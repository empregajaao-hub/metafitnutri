import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // O ProxyPay envia um POST com o objeto da transação
    const transaction = await req.json();
    console.log("Recebido webhook do ProxyPay:", transaction);

    const { id, status, custom_fields } = transaction;
    const userId = custom_fields?.user_id;

    if (!userId) {
      console.error("Webhook recebido sem user_id nos custom_fields");
      return new Response(JSON.stringify({ error: "user_id_missing" }), { status: 400 });
    }

    // Mapeamento de estados do ProxyPay para o sistema interno
    // Estados comuns: completed, expired, rejected
    if (status === "completed") {
      // 1. Atualizar o estado do pagamento na tabela Pagamentos
      // Procuramos o pagamento pendente mais recente deste utilizador
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from("Pagamentos")
        .update({ estado: "approved" })
        .eq("user_id", userId)
        .eq("estado", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .select()
        .single();

      if (paymentError) {
        console.error("Erro ao atualizar pagamento:", paymentError);
      } else {
        // 2. Ativar a subscrição do utilizador
        const months = custom_fields?.months || 1;
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + Number(months));

        const { error: subError } = await supabaseAdmin
          .from("user_subscriptions")
          .update({
            plan: payment.plano,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            is_active: true,
          })
          .eq("user_id", userId);

        if (subError) {
          console.error("Erro ao ativar subscrição:", subError);
        } else {
          console.log(`Subscrição ativada com sucesso para o utilizador ${userId}`);
        }
      }
    } else if (status === "expired" || status === "rejected") {
      await supabaseAdmin
        .from("Pagamentos")
        .update({ estado: "rejected" })
        .eq("user_id", userId)
        .eq("estado", "pending")
        .order("created_at", { ascending: false })
        .limit(1);
      
      console.log(`Pagamento ${status} para o utilizador ${userId}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro no processamento do webhook:", error);
    return new Response(JSON.stringify({ error: "server_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
