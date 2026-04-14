import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    if (path === 'validate') {
      const { mobile, planId } = await req.json();
      // Logic to validate customer/mobile for billing
      return new Response(JSON.stringify({ valid: true, message: "Valid customer" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === 'create-bill') {
      const { mobile, amount, planId, walletType, userId, months } = await req.json();
      
      // 1. Record transaction as pending
      const { data: transaction, error: txError } = await supabaseAdmin
        .from('biller_transactions')
        .insert({
          user_id: userId,
          wallet_type: walletType,
          amount: amount,
          status: 'pending',
          phone_number: mobile,
          plan_id: planId,
          months: months || 1
        })
        .select()
        .single();

      if (txError) throw txError;

      // 2. Simulate or Call Wallet Provider API
      // For Unitel Money simulation (Sandbox mode)
      if (Deno.env.get("BILLER_SANDBOX") === "true" || walletType === 'unitel_money') {
         // Simulate successful request to provider
         return new Response(JSON.stringify({ 
           success: true, 
           transactionId: transaction.id, 
           providerReference: "UM-" + Math.random().toString(36).substr(2, 9).toUpperCase() 
         }), {
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         });
      }

      return new Response(JSON.stringify({ error: "Wallet not implemented yet" }), {
        status: 501,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === 'callback') {
      const payload = await req.json();
      const { transactionId, status, providerReference } = payload;

      // Log the callback
      await supabaseAdmin.from('biller_logs').insert({
        event_type: 'callback_received',
        message: `Callback for ${transactionId}`,
        details: payload
      });

      if (status === 'completed') {
        // 1. Update transaction
        const { data: tx, error: updateError } = await supabaseAdmin
          .from('biller_transactions')
          .update({ 
            status: 'completed', 
            reference_id: providerReference,
            callback_payload: payload 
          })
          .eq('id', transactionId)
          .select()
          .single();

        if (updateError) throw updateError;

        // 2. Create entry in Pagamentos
        const { data: payment, error: pError } = await supabaseAdmin
          .from('Pagamentos')
          .insert({
            user_id: tx.user_id,
            plano: tx.plan_id,
            Valor: tx.amount,
            estado: 'approved',
            "Forma de Pag": tx.wallet_type.toUpperCase()
          })
          .select()
          .single();

        if (pError) throw pError;

        // 3. Activate subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + (tx.months || 1));

        const { error: subError } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            plan: tx.plan_id,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            is_active: true,
          })
          .eq('user_id', tx.user_id);

        if (subError) throw subError;
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Biller Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
