import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// VAPID public key is safe to expose (it's the public half of the key pair)
const VAPID_PUBLIC_KEY = "BKQ0rcV6g6crfAchzm98RBgk6tN9VLBXDmxUM-08JDtr4MqfBT1zkpGafWyNofnM-9lsmCmTv4jSJhJrjcmOqas";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  return new Response(JSON.stringify({ publicKey: VAPID_PUBLIC_KEY }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
