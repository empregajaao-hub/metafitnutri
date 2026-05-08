import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-kursinha-signature, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Webhook do Kursinha — recebe eventos de pagamento e ativa/desativa
 * a subscrição do utilizador no MetaFit Nutri.
 *
 * Eventos suportados:
 *  - compra_aprovada  -> ativa plano por 30 dias
 *  - compra_cancelada -> desativa plano
 *  - compra_pendente  -> regista pagamento como pending
 *
 * Segurança: valida o header `x-webhook-secret` contra KURSINHA_WEBHOOK_SECRET.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // ── Validação de segurança ─────────────────────────────────────────
    const expectedSecret = Deno.env.get("KURSINHA_WEBHOOK_SECRET");
    if (!expectedSecret) {
      console.error("KURSINHA_WEBHOOK_SECRET não configurado");
      return new Response(JSON.stringify({ error: "server_misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const providedSecret =
      req.headers.get("x-webhook-secret") ||
      req.headers.get("x-kursinha-signature") ||
      new URL(req.url).searchParams.get("secret");

    if (providedSecret !== expectedSecret) {
      console.warn("Webhook Kursinha: secret inválido");
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();
    console.log("Kursinha webhook recebido:", JSON.stringify(payload));

    // Aceitamos diferentes formatos de payload
    const event: string =
      payload.event || payload.status || payload.tipo || "";
    const email: string | undefined = (
      payload.email ||
      payload.customer_email ||
      payload.cliente?.email ||
      payload.buyer?.email ||
      ""
    )
      ?.toString()
      .trim()
      .toLowerCase();
    const paymentId: string =
      payload.payment_id ||
      payload.transaction_id ||
      payload.id ||
      payload.order_id ||
      crypto.randomUUID();
    const planFromPayload: string | undefined =
      payload.plan || payload.plano || payload.product || payload.produto;
    const amount: number =
      Number(payload.amount ?? payload.valor ?? payload.price ?? 0) || 0;

    if (!email) {
      return new Response(JSON.stringify({ error: "email_required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── Identificar utilizador pelo email ──────────────────────────────
    let userId: string | null = null;
    try {
      // 1) tentar via auth admin (lista paginada — limitamos a 1ª página suficiente)
      const { data: list } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      const found = list?.users?.find(
        (u) => (u.email || "").toLowerCase() === email,
      );
      if (found) userId = found.id;
    } catch (e) {
      console.error("Erro a listar users:", e);
    }

    // ── Mapear plano ───────────────────────────────────────────────────
    const validPlans = [
      "monthly",
      "annual",
      "essential",
      "evolution",
      "personal_trainer",
    ];
    const plan = validPlans.includes(String(planFromPayload))
      ? (planFromPayload as string)
      : "monthly";

    const now = new Date();

    // ── Tratamento dos eventos ─────────────────────────────────────────
    if (
      event === "compra_aprovada" ||
      event === "approved" ||
      event === "completed" ||
      event === "paid"
    ) {
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + 30);

      if (userId) {
        // upsert subscrição
        const { data: existing } = await supabaseAdmin
          .from("user_subscriptions")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        const subPayload = {
          user_id: userId,
          email,
          plan: plan as any,
          status: "active",
          is_active: true,
          start_date: now.toISOString(),
          end_date: expiresAt.toISOString(),
          payment_id: paymentId,
          updated_at: now.toISOString(),
        };

        if (existing) {
          await supabaseAdmin
            .from("user_subscriptions")
            .update(subPayload)
            .eq("user_id", userId);
        } else {
          await supabaseAdmin.from("user_subscriptions").insert(subPayload);
        }

        // log do pagamento
        await supabaseAdmin.from("Pagamentos").insert({
          user_id: userId,
          plano: plan as any,
          Valor: amount,
          "Forma de Pag": "Kursinha",
          estado: "approved",
          payment_id: paymentId,
          provider: "kursinha",
        });

        console.log(`✅ Subscrição ativada para ${email} (${userId}) plano=${plan}`);
      } else {
        // utilizador ainda não existe — guardamos pendente por email para reconciliar no signup
        console.warn(`Utilizador não encontrado para ${email}; a guardar pendente por email`);
        await supabaseAdmin.from("user_subscriptions").insert({
          user_id: "00000000-0000-0000-0000-000000000000",
          email,
          plan: plan as any,
          status: "pending_user",
          is_active: false,
          payment_id: paymentId,
          start_date: now.toISOString(),
          end_date: expiresAt.toISOString(),
        } as any).then(() => {}, (e) => console.error("insert pending falhou (esperado se RLS):", e));
      }

      return new Response(
        JSON.stringify({ ok: true, event: "approved", email, plan }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (
      event === "compra_cancelada" ||
      event === "cancelled" ||
      event === "canceled" ||
      event === "refunded"
    ) {
      if (userId) {
        await supabaseAdmin
          .from("user_subscriptions")
          .update({
            is_active: false,
            status: "cancelled",
            end_date: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq("user_id", userId);

        await supabaseAdmin.from("Pagamentos").insert({
          user_id: userId,
          plano: plan as any,
          Valor: amount,
          "Forma de Pag": "Kursinha",
          estado: "rejected",
          payment_id: paymentId,
          provider: "kursinha",
        });
        console.log(`❌ Subscrição cancelada para ${email}`);
      }
      return new Response(
        JSON.stringify({ ok: true, event: "cancelled", email }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (event === "compra_pendente" || event === "pending") {
      if (userId) {
        await supabaseAdmin.from("Pagamentos").insert({
          user_id: userId,
          plano: plan as any,
          Valor: amount,
          "Forma de Pag": "Kursinha",
          estado: "pending",
          payment_id: paymentId,
          provider: "kursinha",
        });
      }
      console.log(`⏳ Pagamento pendente para ${email}`);
      return new Response(
        JSON.stringify({ ok: true, event: "pending", email }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`Evento ignorado: ${event}`);
    return new Response(
      JSON.stringify({ ok: true, ignored: true, event }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Erro no webhook Kursinha:", error);
    return new Response(
      JSON.stringify({ error: "server_error", message: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});