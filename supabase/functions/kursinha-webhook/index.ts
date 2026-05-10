import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-kursinha-signature, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PLAN_BY_CHECKOUT_ID: Record<string, string> = {
  "69fafebe3420b95cb08c1cca": "essential",
  "69faffe09ee288b4b295d881": "evolution",
  "69fb018f8a6a706ac75fd7b8": "personal_trainer",
};

const validPlans = ["monthly", "annual", "essential", "evolution", "personal_trainer"];

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const asText = (value: unknown) => (value ?? "").toString().trim();
const asLower = (value: unknown) => asText(value).toLowerCase();
const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const readNested = (payload: any, paths: string[]) => {
  for (const path of paths) {
    const value = path.split(".").reduce((acc, key) => acc?.[key], payload);
    if (value !== undefined && value !== null && asText(value) !== "") return value;
  }
  return undefined;
};

const normalisePlan = (payload: any, amount: number) => {
  const rawPlan = asLower(readNested(payload, [
    "plan",
    "plano",
    "product",
    "produto",
    "product_name",
    "product.id",
    "product.name",
    "checkout.id",
    "checkout_url",
    "data.product.id",
    "data.product.name",
    "data.checkout.id",
    "metadata.plan",
    "metadata.plano",
    "custom.plan",
    "custom.plano",
  ]));

  if (validPlans.includes(rawPlan)) return rawPlan;

  for (const [checkoutId, plan] of Object.entries(PLAN_BY_CHECKOUT_ID)) {
    if (rawPlan.includes(checkoutId) || JSON.stringify(payload).includes(checkoutId)) return plan;
  }

  if (rawPlan.includes("profissional") || rawPlan.includes("personal") || rawPlan.includes("trainer")) {
    return "personal_trainer";
  }
  if (rawPlan.includes("familiar") || rawPlan.includes("evolution") || rawPlan.includes("evolução")) {
    return "evolution";
  }
  if (rawPlan.includes("individual") || rawPlan.includes("essential") || rawPlan.includes("essencial")) {
    return "essential";
  }
  if (rawPlan.includes("anual") || rawPlan.includes("annual")) return "annual";
  if (rawPlan.includes("mensal") || rawPlan.includes("monthly")) return "monthly";

  if (amount >= 15000) return "personal_trainer";
  if (amount >= 5000) return "evolution";
  if (amount >= 2500) return "essential";

  return "essential";
};

const classifyEvent = (payload: any) => {
  const raw = asLower(readNested(payload, [
    "event",
    "evento",
    "status",
    "tipo",
    "event_type",
    "type",
    "data.status",
    "payment.status",
    "order.status",
  ]));

  const approved = ["compra_aprovada", "approved", "completed", "paid", "pago", "success", "succeeded", "order.approved", "payment.success"];
  const cancelled = ["compra_cancelada", "cancelled", "canceled", "refunded", "rejected", "failed", "expirado", "expired"];
  const pending = ["compra_pendente", "pending", "pendente", "processing", "processando", "aguardando_pagamento", "waiting_payment"];

  if (approved.some((event) => raw.includes(event))) return { raw, action: "approve", autoApprovedFromPending: false };
  if (pending.some((event) => raw.includes(event))) return { raw, action: "approve", autoApprovedFromPending: true };
  if (cancelled.some((event) => raw.includes(event))) return { raw, action: "cancel", autoApprovedFromPending: false };

  return { raw, action: "ignore", autoApprovedFromPending: false };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  try {
    const expectedSecret = Deno.env.get("KURSINHA_WEBHOOK_SECRET");
    if (!expectedSecret) {
      console.error("KURSINHA_WEBHOOK_SECRET não configurado");
      return jsonResponse({ error: "server_misconfigured" }, 500);
    }

    const providedSecret =
      req.headers.get("x-webhook-secret") ||
      req.headers.get("x-kursinha-signature") ||
      new URL(req.url).searchParams.get("secret");

    if (providedSecret !== expectedSecret) {
      console.warn("Webhook Kursinha: secret inválido");
      return jsonResponse({ error: "unauthorized" }, 401);
    }

    const payload = await req.json();
    console.log("Kursinha webhook recebido:", JSON.stringify(payload));

    const amount = Number(readNested(payload, ["amount", "valor", "price", "total", "data.amount", "data.valor", "payment.amount"]) ?? 0) || 0;
    const email = asLower(readNested(payload, [
      "email",
      "customer_email",
      "buyer_email",
      "cliente.email",
      "customer.email",
      "buyer.email",
      "client.email",
      "data.email",
      "data.customer.email",
      "data.buyer.email",
      "metadata.email",
      "custom.email",
    ]));
    const paymentId = asText(readNested(payload, [
      "payment_id",
      "transaction_id",
      "reference",
      "referencia",
      "id",
      "order_id",
      "data.id",
      "payment.id",
      "order.id",
    ])) || crypto.randomUUID();
    const plan = normalisePlan(payload, amount);
    const event = classifyEvent(payload);
    const metadataUserId = asText(readNested(payload, ["user_id", "external_reference", "external_id", "metadata.user_id", "custom.user_id", "data.metadata.user_id"]));

    if (!email && !isUuid(metadataUserId)) {
      return jsonResponse({ error: "email_or_user_id_required" }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let userId: string | null = isUuid(metadataUserId) ? metadataUserId : null;
    if (!userId && email) {
      const { data: list, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listError) console.error("Erro a listar users:", listError);
      const found = list?.users?.find((u) => (u.email || "").toLowerCase() === email);
      if (found) userId = found.id;
    }

    if (!userId) {
      console.warn(`Utilizador não encontrado para email=${email} payment_id=${paymentId}`);
      return jsonResponse({ ok: false, error: "user_not_found", email, payment_id: paymentId }, 202);
    }

    const now = new Date();
    const months = Number(readNested(payload, ["months", "meses", "duration_months", "metadata.months"]) ?? (plan === "annual" ? 12 : 1)) || 1;
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + Math.max(1, months));

    if (event.action === "approve") {
      const subPayload = {
        user_id: userId,
        email: email || null,
        plan: plan as any,
        status: "active",
        is_active: true,
        start_date: now.toISOString(),
        end_date: expiresAt.toISOString(),
        payment_id: paymentId,
        updated_at: now.toISOString(),
      };

      const { data: existingSubs, error: subLookupError } = await supabaseAdmin
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      if (subLookupError) throw subLookupError;

      if (existingSubs && existingSubs.length > 0) {
        const { error: updateError } = await supabaseAdmin
          .from("user_subscriptions")
          .update(subPayload)
          .eq("user_id", userId);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabaseAdmin.from("user_subscriptions").insert(subPayload);
        if (insertError) throw insertError;
      }

      const { data: existingPayment } = await supabaseAdmin
        .from("Pagamentos")
        .select("id")
        .eq("provider", "kursinha")
        .eq("payment_id", paymentId)
        .maybeSingle();

      const paymentPayload = {
        user_id: userId,
        plano: plan as any,
        Valor: amount,
        "Forma de Pag": event.autoApprovedFromPending ? "Kursinha auto-aprovado" : "Kursinha",
        estado: "approved",
        payment_id: paymentId,
        provider: "kursinha",
        updated_at: now.toISOString(),
      };

      if (existingPayment) {
        await supabaseAdmin.from("Pagamentos").update(paymentPayload).eq("id", existingPayment.id);
      } else {
        await supabaseAdmin.from("Pagamentos").insert(paymentPayload);
      }

      console.log(`✅ Subscrição ativada user=${userId} email=${email} plano=${plan} pending_auto=${event.autoApprovedFromPending}`);
      return jsonResponse({ ok: true, event: "approved", auto_approved_from_pending: event.autoApprovedFromPending, email, plan, expires_at: expiresAt.toISOString() });
    }

    if (event.action === "cancel") {
      await supabaseAdmin
        .from("user_subscriptions")
        .update({ is_active: false, status: "cancelled", end_date: now.toISOString(), updated_at: now.toISOString() })
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

      console.log(`❌ Subscrição cancelada user=${userId} email=${email}`);
      return jsonResponse({ ok: true, event: "cancelled", email });
    }

    console.log(`Evento ignorado: ${event.raw}`);
    return jsonResponse({ ok: true, ignored: true, event: event.raw });
  } catch (error) {
    console.error("Erro no webhook Kursinha:", error);
    return jsonResponse({ error: "server_error", message: String(error) }, 500);
  }
});
