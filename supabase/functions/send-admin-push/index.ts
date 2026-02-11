import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as webpush from "https://esm.sh/jsr/@negrel/webpush@0.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VAPID_PUBLIC_KEY = "BKQ0rcV6g6crfAchzm98RBgk6tN9VLBXDmxUM-08JDtr4MqfBT1zkpGafWyNofnM-9lsmCmTv4jSJhJrjcmOqas";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify admin identity
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user } } = await supabaseAuth.auth.getUser(token);
    if (!user) return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { title, message, target_audience } = body;

    if (!title || !message || !target_audience) {
      return new Response(JSON.stringify({ error: "Dados incompletos" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
    if (!VAPID_PRIVATE_KEY) {
      return new Response(JSON.stringify({ error: "VAPID_PRIVATE_KEY não configurada" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Import VAPID keys
    const appServer = await webpush.importVapidKeys({
      publicKey: VAPID_PUBLIC_KEY,
      privateKey: VAPID_PRIVATE_KEY,
    }, { subject: "mailto:repairlubatec@gmail.com" });

    // Determine target user IDs
    let userIds: string[] = [];

    if (target_audience.startsWith("user:")) {
      userIds = [target_audience.replace("user:", "")];
    } else {
      let query = supabaseAdmin.from("user_subscriptions").select("user_id");

      if (target_audience === "free") {
        query = query.eq("plan", "free");
      } else if (target_audience === "premium") {
        query = query.in("plan", ["monthly", "annual", "essential", "evolution", "personal_trainer"]);
      } else if (target_audience === "monthly") {
        query = query.eq("plan", "monthly");
      } else if (target_audience === "annual") {
        query = query.eq("plan", "annual");
      }

      const { data: subs } = await query;
      if (subs?.length) {
        userIds = subs.map((s: any) => s.user_id);
      } else if (target_audience === "all") {
        const { data: pushSubs } = await supabaseAdmin.from("push_subscriptions").select("user_id");
        userIds = [...new Set((pushSubs || []).map((s: any) => s.user_id))];
      }
    }

    if (userIds.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "Nenhum utilizador encontrado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: pushSubs } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth, user_id")
      .in("user_id", userIds);

    if (!pushSubs?.length) {
      return new Response(JSON.stringify({ sent: 0, message: "Nenhuma subscrição push encontrada" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.stringify({ title, body: message, url: "/" });
    let sent = 0;
    let failed = 0;

    for (const s of pushSubs) {
      try {
        const subscription = {
          endpoint: s.endpoint,
          keys: { p256dh: s.p256dh, auth: s.auth },
        };

        // Build and send push notification using Web Crypto based library
        const pushRequest = await webpush.buildPushRequest(
          appServer,
          subscription,
          null, // no options
          new TextEncoder().encode(payload)
        );

        const pushResponse = await fetch(pushRequest);
        
        if (pushResponse.ok || pushResponse.status === 201) {
          sent++;
        } else {
          const status = pushResponse.status;
          if (status === 404 || status === 410) {
            await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
          }
          failed++;
          console.log("Push failed:", s.endpoint, status, await pushResponse.text());
        }
      } catch (e: any) {
        failed++;
        console.log("Push error:", s.endpoint, e?.message);
      }
    }

    return new Response(JSON.stringify({ sent, failed, total: pushSubs.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
