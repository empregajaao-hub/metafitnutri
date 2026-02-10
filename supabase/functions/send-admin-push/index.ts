import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.7?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Check admin role
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

    // Setup VAPID
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const VAPID_EMAIL = Deno.env.get("VAPID_EMAIL") || "mailto:repairlubatec@gmail.com";
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    // Determine target user IDs
    let userIds: string[] = [];

    if (target_audience.startsWith("user:")) {
      userIds = [target_audience.replace("user:", "")];
    } else {
      // Build query based on audience
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
      // "all" = no filter

      const { data: subs } = await query;
      if (subs?.length) {
        userIds = subs.map((s: any) => s.user_id);
      } else if (target_audience === "all") {
        // Fallback: get all users with push subscriptions
        const { data: pushSubs } = await supabaseAdmin.from("push_subscriptions").select("user_id");
        userIds = [...new Set((pushSubs || []).map((s: any) => s.user_id))];
      }
    }

    if (userIds.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "Nenhum utilizador encontrado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get push subscriptions for these users
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
      const subscription = {
        endpoint: s.endpoint,
        keys: { p256dh: s.p256dh, auth: s.auth },
      };

      try {
        await webpush.sendNotification(subscription as any, payload);
        sent++;
      } catch (e: any) {
        const statusCode = e?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
        }
        failed++;
        console.log("Push failed for endpoint:", s.endpoint, e?.message);
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
