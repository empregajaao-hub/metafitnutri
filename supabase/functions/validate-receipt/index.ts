import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function normalizeText(t: string) {
  return (t || "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeIban(t: string) {
  return (t || "").replace(/\s+/g, "").replace(/[^0-9A-Z]/gi, "").toUpperCase();
}

function parseAmount(text: string): number | null {
  // Try to capture patterns like 2.500,00 or 2500 or 15 000
  const candidates = text
    .replace(/KZ/gi, "")
    .match(/\b\d{1,3}(?:[\.\s]\d{3})*(?:,\d{2})?\b/g);
  if (!candidates?.length) return null;

  // take the largest numeric candidate (usually the value)
  const nums = candidates
    .map((c) => c.replace(/\s/g, "").replace(/\./g, "").replace(/,/g, "."))
    .map((c) => Number(c))
    .filter((n) => Number.isFinite(n));

  if (!nums.length) return null;
  return Math.max(...nums);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const visionKey = Deno.env.get("GOOGLE_VISION_API_KEY");

    if (!visionKey) {
      return new Response(JSON.stringify({ ok: false, reason: "vision_key_missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ ok: false, reason: "auth_required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ ok: false, reason: "invalid_session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { filePath, expectedAmount, expectedIban, expectedRecipient } = await req.json();

    if (!filePath || typeof filePath !== "string") {
      return new Response(JSON.stringify({ ok: false, reason: "missing_filePath" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Security: only allow validating receipts in the user's folder
    if (!filePath.startsWith(`${user.id}/`)) {
      return new Response(JSON.stringify({ ok: false, reason: "forbidden_path" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lower = filePath.toLowerCase();
    if (lower.endsWith(".pdf")) {
      return new Response(JSON.stringify({ ok: false, reason: "pdf_not_supported_yet" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: blob, error: dlErr } = await supabaseAdmin.storage.from("receipts").download(filePath);
    if (dlErr || !blob) {
      console.error("download receipt error:", dlErr);
      return new Response(JSON.stringify({ ok: false, reason: "download_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bytes = new Uint8Array(await blob.arrayBuffer());
    const base64 = toBase64(bytes);

    const visionResp = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(visionKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64 },
              features: [{ type: "TEXT_DETECTION" }],
            },
          ],
        }),
      },
    );

    if (!visionResp.ok) {
      const t = await visionResp.text();
      console.error("vision error:", visionResp.status, t);
      return new Response(JSON.stringify({ ok: false, reason: "vision_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await visionResp.json();
    const fullText: string = json?.responses?.[0]?.fullTextAnnotation?.text || "";
    const norm = normalizeText(fullText);

    const ibanOk = expectedIban ? norm.includes(normalizeIban(expectedIban)) || normalizeIban(norm).includes(normalizeIban(expectedIban)) : false;
    const recipientOk = expectedRecipient ? norm.includes(normalizeText(expectedRecipient)) : false;

    const expectedAmtNum = Number(expectedAmount);
    const extractedAmount = parseAmount(norm);
    const amountOk = Number.isFinite(expectedAmtNum) && extractedAmount !== null
      ? Math.abs(extractedAmount - expectedAmtNum) < 0.01
      : false;

    const ok = Boolean(ibanOk && recipientOk && amountOk);
    const reason = ok
      ? "ok"
      : !ibanOk
        ? "iban_mismatch"
        : !recipientOk
          ? "recipient_mismatch"
          : "amount_mismatch";

    return new Response(
      JSON.stringify({
        ok,
        reason,
        checks: { ibanOk, recipientOk, amountOk },
        extractedAmount,
        snippet: fullText.slice(0, 700),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("validate-receipt error:", error);
    return new Response(JSON.stringify({ ok: false, reason: "server_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
