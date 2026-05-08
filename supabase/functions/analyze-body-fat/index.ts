import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imagesBase64, userProfile } = await req.json(); // imagesBase64 is an array of 3 images
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Autenticação necessária. Por favor, faça login." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Sessão inválida. Por favor, faça login novamente." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify subscription is active
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: subscription } = await supabaseAdmin
      .from("user_subscriptions")
      .select("plan, is_active, end_date, trial_start_date")
      .eq("user_id", user.id)
      .single();

    const now = new Date();
    const trialEnd = subscription?.trial_start_date
      ? new Date(new Date(subscription.trial_start_date).getTime() + 7 * 24 * 60 * 60 * 1000)
      : null;
    const isTrialActive = trialEnd && now < trialEnd;
    const isPaidActive = subscription?.is_active && subscription?.plan !== 'free' &&
      (!subscription?.end_date || new Date(subscription.end_date) > now);

    if (!isTrialActive && !isPaidActive) {
      return new Response(
        JSON.stringify({ error: "Subscrição expirada. Por favor, renove o seu plano para continuar." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }


    const systemPrompt = `Você é um especialista em análise visual de composição corporal.
Sua tarefa é analisar três fotos de um utilizador (frente, lado, costas) e estimar o seu percentual de gordura corporal.

DIRETRIZES:
1. Analise a definição muscular, vascularização e depósitos de gordura subcutânea em cada vista.
2. Use o perfil do utilizador (idade: ${userProfile?.age || 'N/A'}, género: ${userProfile?.gender || 'N/A'}, peso: ${userProfile?.weight || 'N/A'}) para contextualizar.
3. Forneça uma estimativa de percentual (%) com uma margem de erro razoável.
4. Identifique as áreas com maior concentração de gordura e de maior definição.
5. Esta é uma funcionalidade EXPERIMENTAL.

Responda APENAS com um JSON válido no seguinte formato:
{
  "body_fat_percentage": número,
  "confidence_score": número (0-1),
  "margin_of_error_pct": número,
  "body_composition_analysis": "Breve análise visual das três vistas",
  "strengths": ["Ponto forte 1", "Ponto forte 2"],
  "improvement_areas": ["Área 1", "Área 2"],
  "health_category": "Ex: Atleta, Fitness, Médio, Acima da média",
  "tips_for_accuracy": ["Dica 1", "Dica 2"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: [
              {
                type: "text",
                text: `Analise o percentual de gordura corporal destas três fotos (frente, lado, costas).`
              },
              ...imagesBase64.map((img: string) => ({
                type: "image_url",
                image_url: { url: img }
              }))
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error (analyze-body-fat):", response.status, errorText);
      throw new Error("Erro ao comunicar com o serviço de IA.");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let result;
    try {
      if (!jsonMatch) throw new Error("Não foi encontrado JSON na resposta da IA");
      result = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Erro ao processar JSON da IA (analyze-body-fat):", parseError, "Conteúdo:", content);
      throw new Error("A IA devolveu um formato que não conseguimos processar. Tente novamente.");
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
