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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const proxypayToken = Deno.env.get("PROXYPAY_API_TOKEN");
    const proxypayPosId = Deno.env.get("PROXYPAY_POS_ID");

    if (!proxypayToken || !proxypayPosId) {
      return new Response(JSON.stringify({ error: "Configuração do ProxyPay em falta no servidor" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { mobile, amount, planId, months } = await req.json();

    if (!mobile || !amount || !planId) {
      return new Response(JSON.stringify({ error: "Dados em falta (mobile, amount, planId)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Limpar o número de telemóvel (remover espaços, etc)
    const cleanMobile = mobile.replace(/\s+/g, "").replace("+244", "");

    // Criar a transação no ProxyPay
    const response = await fetch("https://api.proxypay.co.ao/opg/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${proxypayToken}`,
      },
      body: JSON.stringify({
        type: "payment",
        pos_id: Number(proxypayPosId),
        mobile: cleanMobile,
        amount: amount.toString(),
        custom_fields: {
          user_id: user.id,
          plan_id: planId,
          months: months || 1
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Erro ProxyPay:", errorData);
      return new Response(JSON.stringify({ error: "Erro ao comunicar com o ProxyPay", details: errorData }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const proxypayData = await response.json();

    return new Response(JSON.stringify(proxypayData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro na função create-proxypay-transaction:", error);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
