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
    const { imageBase64, goal, additionalIngredients } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null;

    let userId: string | null = null;
    if (token) {
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
      if (!authError && user) {
        userId = user.id;
      }
    }

    if (userId) {
      const supabaseCheck = createClient(supabaseUrl, supabaseServiceKey);
      const { data: subscription } = await supabaseCheck
        .from("user_subscriptions")
        .select("plan, is_active, end_date, trial_start_date")
        .eq("user_id", userId)
        .single();

      const now = new Date();
      const trialEnd = subscription?.trial_start_date
        ? new Date(new Date(subscription.trial_start_date).getTime() + 7 * 24 * 60 * 60 * 1000)
        : null;
      const isTrialActive = trialEnd && now < trialEnd;
      const isPaidActive = subscription?.is_active && subscription?.plan !== 'free' && subscription?.end_date &&
        new Date(subscription.end_date) > now;

      if (!isTrialActive && !isPaidActive) {
        return new Response(
          JSON.stringify({ error: "Subscrição expirada. Por favor, renove o seu plano para continuar." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const additionalIngredientsContext = additionalIngredients 
      ? `\n\nIMPORTANTE: O utilizador informou que também tem disponíveis os seguintes ingredientes em casa: ${additionalIngredients}. Use-os nas receitas sugeridas.`
      : '';

    const systemPrompt = `Você é um nutricionista angolano de elite especializado em análise visual de alimentos.
Sua tarefa é analisar a foto e fornecer uma resposta profissional, elegante e extremamente precisa.

Determine se a foto contém:
1. REFEIÇÃO PRONTA: Forneça análise nutricional detalhada.
2. INGREDIENTES CRUS: Sugira receitas angolanas criativas.

DIRETRIZES CRÍTICAS:
- Descrição: MÁXIMO 2 frases, super resumida e direta. Exemplo: "Prato típico angolano com batatas fritas, bife e ovo estrelado. Refeição calórica e rica em gorduras."
- Identifique pratos típicos angolanos com precisão.
- Seja rigoroso com açúcares e ultraprocessados.
- As receitas devem ser práticas e gourmet.

Responda APENAS com um JSON válido no seguinte formato:
{
  "type": "meal" ou "ingredients",
  "description": "MÁXIMO 2 frases super resumidas. Ex: 'Prato típico com batatas fritas, bife e ovo. Refeição calórica e gordurosa.'",
  "items": [
    {
      "name": "Nome do item",
      "estimated_grams": número,
      "calories": número,
      "protein_g": número,
      "carbs_g": número,
      "fat_g": número,
      "sugar_warning": boolean
    }
  ],
  "estimated_calories": número total,
  "protein_g": número total,
  "carbs_g": número total,
  "fat_g": número total,
  "portion_size": "Ex: Porção Generosa, Porção Equilibrada",
  "confidence": número (0-1),
  "sugar_alert": {
    "has_sugary_items": boolean,
    "items_detected": ["lista"],
    "health_warning": "Aviso profissional sobre os riscos detectados",
    "healthier_alternatives": ["Sugestões de trocas inteligentes"]
  },
  "what_to_eat": ["Máximo 3 itens: o que priorizar para o objetivo"],
  "what_not_to_eat": ["Máximo 3 itens: o que evitar ou reduzir"],
  "suggested_recipes": [
    {
      "name": "Nome da Receita",
      "description": "1 frase resumida da sugestão",
      "difficulty": "Fácil, Média ou Difícil",
      "time_minutes": número,
      "why": "Por que esta receita é perfeita para o objetivo do usuário",
      "ingredients_from_photo": ["itens da foto"],
      "additional_ingredients": ["itens extras"],
      "steps": ["Passo 1", "Passo 2", "..."],
      "nutrition_per_portion": { "calories": número, "protein_g": número, "carbs_g": número, "fat_g": número }
    }
  ],
  "angolan_recipes": [
    { "name": "Nome", "description": "1 frase resumida", "why": "Benefício em 1 linha" }
  ]
}`;

    console.log("Iniciando chamada para AI Gateway...");
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
                text: `Analise esta imagem para um utilizador cujo objetivo é: ${goal === 'lose' ? 'perder peso' : goal === 'gain' ? 'ganhar massa muscular' : 'manter um estilo de vida saudável'}.
                
                Contexto Adicional:
                - Dia: ${new Date().toLocaleDateString('pt-AO', { weekday: 'long' })}
                ${additionalIngredientsContext}
                
                Forneça uma análise de alta precisão, focando em macros e na cultura alimentar de Angola.`
              },
              {
                type: "image_url",
                image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao comunicar com o serviço de IA. Verifique os créditos ou limites.");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log("Conteúdo recebido da IA:", content);
    
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Não foi encontrado JSON na resposta da IA");
      result = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Erro ao processar JSON da IA:", parseError, "Conteúdo:", content);
      throw new Error("A IA devolveu um formato que não conseguimos processar. Tente novamente.");
    }

    if (userId) {
      let savedImageUrl: string | null = null;
      try {
        const base64Match = imageBase64.match(/^data:image\/(\w+);base64,(.+)$/);
        if (base64Match) {
          const ext = base64Match[1] === 'jpeg' ? 'jpg' : base64Match[1];
          const base64Data = base64Match[2];
          const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          const fileName = `${userId}/${Date.now()}.${ext}`;
          
          const { error: uploadErr } = await supabaseAdmin.storage
            .from("meal-images")
            .upload(fileName, binaryData, { contentType: `image/${base64Match[1]}`, upsert: false });
          
          if (!uploadErr) {
            const { data: urlData } = supabaseAdmin.storage.from("meal-images").getPublicUrl(fileName);
            savedImageUrl = urlData.publicUrl;
          }
        }
      } catch (imgErr) {
        console.error("Image processing error:", imgErr);
      }

      await supabaseAdmin
        .from("meal_analyses")
        .insert({
          user_id: userId,
          image_url: savedImageUrl,
          estimated_calories: result.estimated_calories || 0,
          protein_g: result.protein_g || 0,
          carbs_g: result.carbs_g || 0,
          fat_g: result.fat_g || 0,
          confidence: result.confidence || 0.8,
          portion_size: result.portion_size || "Porção média",
          suggestions: {
            description: result.description,
            items: result.items,
            what_to_eat: result.what_to_eat,
            what_not_to_eat: result.what_not_to_eat,
            angolan_recipes: result.angolan_recipes,
            sugar_alert: result.sugar_alert,
            suggested_recipes: result.suggested_recipes,
            additional_ingredients_used: additionalIngredients || null,
          },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-meal function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
