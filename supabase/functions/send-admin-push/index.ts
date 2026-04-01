import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VAPID_PUBLIC_KEY = "BKQ0rcV6g6crfAchzm98RBgk6tN9VLBXDmxUM-08JDtr4MqfBT1zkpGafWyNofnM-9lsmCmTv4jSJhJrjcmOqas";

// Helper: base64url decode
function base64urlDecode(str: string): Uint8Array {
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// Helper: base64url encode
function base64urlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Build JWT for VAPID auth
async function createVapidJwt(audience: string, subject: string, privateKeyBytes: Uint8Array): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + 86400, sub: subject };

  const encoder = new TextEncoder();
  const headerB64 = base64urlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64urlEncode(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key
  const key = await crypto.subtle.importKey(
    "pkcs8",
    buildPkcs8(privateKeyBytes),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    encoder.encode(unsignedToken)
  );

  // Convert DER signature to raw r||s (64 bytes)
  const rawSig = derToRaw(new Uint8Array(sig));
  return `${unsignedToken}.${base64urlEncode(rawSig)}`;
}

// Build PKCS8 wrapper for raw 32-byte EC private key
function buildPkcs8(rawKey: Uint8Array): Uint8Array {
  // PKCS8 header for P-256
  const header = new Uint8Array([
    0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13,
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02,
    0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x6d, 0x30, 0x6b, 0x02,
    0x01, 0x01, 0x04, 0x20
  ]);
  const mid = new Uint8Array([0xa1, 0x44, 0x03, 0x42, 0x00]);
  // We need the public key too, derive it... Actually for signing we only need the private key
  // Let's use the JWK import approach instead
  
  // For simplicity, build a proper PKCS8 with just the private key
  const result = new Uint8Array(header.length + rawKey.length);
  result.set(header);
  result.set(rawKey, header.length);
  return result;
}

// Convert DER encoded ECDSA signature to raw format
function derToRaw(der: Uint8Array): Uint8Array {
  // If already 64 bytes, it's already raw
  if (der.length === 64) return der;
  
  const raw = new Uint8Array(64);
  // DER: 0x30 <len> 0x02 <r_len> <r> 0x02 <s_len> <s>
  let offset = 2; // skip 0x30 and total length
  
  // R
  offset++; // skip 0x02
  let rLen = der[offset++];
  let rStart = offset;
  if (der[rStart] === 0) { rLen--; rStart++; }
  raw.set(der.slice(rStart, rStart + Math.min(rLen, 32)), 32 - Math.min(rLen, 32));
  offset = rStart + (der[rStart - 1] === 0 ? rLen : rLen);
  
  // S
  offset++; // skip 0x02
  let sLen = der[offset++];
  let sStart = offset;
  if (der[sStart] === 0) { sLen--; sStart++; }
  raw.set(der.slice(sStart, sStart + Math.min(sLen, 32)), 64 - Math.min(sLen, 32));
  
  return raw;
}

// Encrypt payload for Web Push (RFC 8291)
async function encryptPayload(
  payload: Uint8Array,
  p256dhKey: Uint8Array,
  authSecret: Uint8Array
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; publicKey: Uint8Array }> {
  // Generate local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );
  
  // Import subscriber's public key
  const subscriberKey = await crypto.subtle.importKey(
    "raw",
    p256dhKey,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );
  
  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: "ECDH", public: subscriberKey },
    localKeyPair.privateKey,
    256
  );
  
  // Export local public key
  const localPublicKey = new Uint8Array(
    await crypto.subtle.exportKey("raw", localKeyPair.publicKey)
  );
  
  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // HKDF-based key derivation (RFC 8291)
  const encoder = new TextEncoder();
  
  // PRK = HMAC-SHA-256(auth_secret, shared_secret)
  const authKey = await crypto.subtle.importKey("raw", authSecret, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const prk = new Uint8Array(await crypto.subtle.sign("HMAC", authKey, sharedSecret));
  
  // Info for content encryption key
  const keyInfo = concatBuffers(
    encoder.encode("Content-Encoding: aes128gcm\0"),
    new Uint8Array(0)
  );
  
  // Info for nonce
  const nonceInfo = concatBuffers(
    encoder.encode("Content-Encoding: nonce\0"),
    new Uint8Array(0)
  );
  
  // IKM using info = "WebPush: info\0" || ua_public || as_public
  const ikmInfo = concatBuffers(
    encoder.encode("WebPush: info\0"),
    p256dhKey,
    localPublicKey
  );
  
  const ikmKey = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const ikm = new Uint8Array(await crypto.subtle.sign("HMAC", ikmKey, concatBuffers(ikmInfo, new Uint8Array([1]))));
  
  // Derive CEK and nonce using salt
  const saltKey = await crypto.subtle.importKey("raw", salt, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const prkSalt = new Uint8Array(await crypto.subtle.sign("HMAC", saltKey, ikm));
  
  const prkSaltKey = await crypto.subtle.importKey("raw", prkSalt, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const cekInfo = concatBuffers(encoder.encode("Content-Encoding: aes128gcm\0"), new Uint8Array([1]));
  const cekFull = new Uint8Array(await crypto.subtle.sign("HMAC", prkSaltKey, cekInfo));
  const cek = cekFull.slice(0, 16);
  
  const nonceInfoFull = concatBuffers(encoder.encode("Content-Encoding: nonce\0"), new Uint8Array([1]));
  const nonceFull = new Uint8Array(await crypto.subtle.sign("HMAC", prkSaltKey, nonceInfoFull));
  const nonce = nonceFull.slice(0, 12);
  
  // Add padding delimiter
  const paddedPayload = concatBuffers(payload, new Uint8Array([2]));
  
  // Encrypt with AES-128-GCM
  const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    paddedPayload
  ));
  
  // Build aes128gcm content encoding header
  const recordSize = new Uint8Array(4);
  new DataView(recordSize.buffer).setUint32(0, encrypted.length + 86);
  
  const header = concatBuffers(
    salt,
    recordSize,
    new Uint8Array([65]), // key length
    localPublicKey
  );
  
  return {
    ciphertext: concatBuffers(header, encrypted),
    salt,
    publicKey: localPublicKey,
  };
}

function concatBuffers(...buffers: Uint8Array[]): Uint8Array {
  const total = buffers.reduce((sum, b) => sum + b.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const buf of buffers) {
    result.set(buf, offset);
    offset += buf.length;
  }
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

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

    // Determine target user IDs
    let userIds: string[] = [];

    if (target_audience.startsWith("user:")) {
      userIds = [target_audience.replace("user:", "")];
    } else {
      let query = supabaseAdmin.from("user_subscriptions").select("user_id");

      if (target_audience === "free") {
        query = query.eq("plan", "free");
      } else if (target_audience === "premium") {
        query = query.in("plan", ["essential", "evolution", "personal_trainer"]);
      } else if (target_audience === "essential") {
        query = query.eq("plan", "essential");
      } else if (target_audience === "evolution") {
        query = query.eq("plan", "evolution");
      } else if (target_audience === "personal_trainer") {
        query = query.eq("plan", "personal_trainer");
      }
      // for "all" we don't filter

      const { data: subs } = await query;
      if (subs?.length) {
        userIds = subs.map((s: any) => s.user_id);
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
    const payloadBytes = new TextEncoder().encode(payload);
    const privateKeyBytes = base64urlDecode(VAPID_PRIVATE_KEY);

    let sent = 0;
    let failed = 0;

    for (const s of pushSubs) {
      try {
        const endpointUrl = new URL(s.endpoint);
        const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;

        // Create VAPID JWT using JWK import (more reliable)
        const now = Math.floor(Date.now() / 1000);
        const jwtHeader = base64urlEncode(new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
        const jwtPayload = base64urlEncode(new TextEncoder().encode(JSON.stringify({
          aud: audience,
          exp: now + 86400,
          sub: "mailto:repairlubatec@gmail.com"
        })));

        // Import private key as JWK
        const jwk = {
          kty: "EC",
          crv: "P-256",
          d: base64urlEncode(privateKeyBytes),
          x: base64urlEncode(base64urlDecode(VAPID_PUBLIC_KEY).slice(1, 33)),
          y: base64urlEncode(base64urlDecode(VAPID_PUBLIC_KEY).slice(33, 65)),
        };

        const signingKey = await crypto.subtle.importKey(
          "jwk",
          jwk,
          { name: "ECDSA", namedCurve: "P-256" },
          false,
          ["sign"]
        );

        const unsignedToken = `${jwtHeader}.${jwtPayload}`;
        const signature = await crypto.subtle.sign(
          { name: "ECDSA", hash: "SHA-256" },
          signingKey,
          new TextEncoder().encode(unsignedToken)
        );

        // Convert DER to raw if needed
        const sigBytes = new Uint8Array(signature);
        let rawSig: Uint8Array;
        if (sigBytes.length === 64) {
          rawSig = sigBytes;
        } else {
          rawSig = derToRaw(sigBytes);
        }

        const vapidToken = `${unsignedToken}.${base64urlEncode(rawSig)}`;

        // Encrypt payload
        const p256dhBytes = base64urlDecode(s.p256dh);
        const authBytes = base64urlDecode(s.auth);
        const encrypted = await encryptPayload(payloadBytes, p256dhBytes, authBytes);

        // Send push
        const pushResponse = await fetch(s.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Encoding": "aes128gcm",
            "TTL": "86400",
            "Authorization": `vapid t=${vapidToken}, k=${VAPID_PUBLIC_KEY}`,
            "Urgency": "high",
          },
          body: encrypted.ciphertext,
        });

        if (pushResponse.ok || pushResponse.status === 201) {
          sent++;
        } else {
          const status = pushResponse.status;
          console.log("Push failed:", s.endpoint.substring(0, 60), status, await pushResponse.text().catch(() => ""));
          if (status === 404 || status === 410) {
            await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
          }
          failed++;
        }
      } catch (e: any) {
        failed++;
        console.log("Push error:", e?.message);
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
