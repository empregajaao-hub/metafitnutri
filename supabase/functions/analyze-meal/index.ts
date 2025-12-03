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
    const { imageBase64, goal, isAuthenticated = false } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user from auth header if available
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    console.log("Analyzing meal for user:", userId || "anonymous");

    // Prompt unificado: análise COMPLETA para todos (gratuitos e pagos)
    const systemPrompt = `Você é um nutricionista angolano especializado em análise de refeições.
Analise a foto da refeição e forneça informações nutricionais DETALHADAS e COMPLETAS para TODOS os usuários.
Considere pratos típicos angolanos como Funge, Moamba de Galinha, Calulu, Muamba de Dendém, Arroz, Feijão, Peixe, Carne, etc.

IMPORTANTE: 
1. Seja EXTREMAMENTE detalhado na análise de cada ingrediente
2. Identifique claramente o que o usuário DEVE comer e o que NÃO DEVE comer de acordo com sua meta
3. Forneça receitas alternativas 100% angolanas alinhadas ao objetivo

Responda APENAS com um JSON válido no seguinte formato:
{
  "description": "descrição detalhada de todos os elementos visíveis no prato",
  "items": [
    {
      "name": "nome do alimento",
      "estimated_grams": número em gramas,
      "calories": número de calorias,
      "protein_g": número,
      "carbs_g": número,
      "fat_g": número
    }
  ],
  "estimated_calories": número total,
  "protein_g": número total,
  "carbs_g": número total,
  "fat_g": número total,
  "portion_size": "descrição do tamanho da porção",
  "confidence": número entre 0 e 1,
  "what_to_eat": ["lista de alimentos/ingredientes da foto que o usuário DEVE comer segundo seu objetivo"],
  "what_not_to_eat": ["lista de alimentos/ingredientes da foto que o usuário NÃO DEVE comer segundo seu objetivo"],
  "angolan_recipes": [
    {
      "name": "nome da receita angolana",
      "description": "breve descrição",
      "why": "por que essa receita ajuda no objetivo do usuário"
    }
  ],
  "analysis": {
    "for_loss": {
      "assessment": "análise detalhada para quem quer perder peso",
      "remove": ["lista de itens a remover ou reduzir"],
      "add": ["lista de itens a adicionar"],
      "portion_adjustments": "ajustes específicos nas porções"
    },
    "for_maintain": {
      "assessment": "análise detalhada para quem quer manter peso",
      "adjustments": ["lista de pequenos ajustes sugeridos"]
    },
    "for_gain": {
      "assessment": "análise detalhada para quem quer ganhar peso",
      "add": ["lista de itens a adicionar"],
      "increase": ["lista de itens a aumentar porção"],
      "portion_adjustments": "ajustes específicos nas porções"
    }
  }
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
                text: `Analise esta refeição em DETALHE COMPLETO. O objetivo do utilizador é: ${goal === 'lose' ? 'perder peso' : goal === 'gain' ? 'ganhar peso' : 'manter peso'}.

IMPORTANTE:
1. Identifique TODOS os elementos visíveis no prato
2. Estime a gramagem de CADA elemento
3. Calcule os valores nutricionais de cada elemento
4. Forneça recomendações específicas e detalhadas baseadas no objetivo
5. Seja preciso e prático nas sugestões`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos ao workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao comunicar com o serviço de IA");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta inválida da IA");
    }
    
    const result = JSON.parse(jsonMatch[0]);

    // Save to database if user is authenticated
    if (userId) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { error: insertError } = await supabase
        .from("meal_analyses")
        .insert({
          user_id: userId,
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
            analysis: result.analysis
          }
        });

      if (insertError) {
        console.error("Error saving meal analysis:", insertError);
      } else {
        console.log("Meal analysis saved successfully for user:", userId);
      }
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
