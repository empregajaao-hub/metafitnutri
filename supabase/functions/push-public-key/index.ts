import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// VAPID public key is safe to expose (it's the public half of the key pair)
const VAPID_PUBLIC_KEY = "BKQ0rcV6g6crfAchzm98RBgk6tN9VLBXDmxUM-08JDtr4MqfBT1zkpGafWyNofnM-9lsmCmTv4jSJhJrjcmOqas";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  return new Response(JSON.stringify({ publicKey: VAPID_PUBLIC_KEY }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
