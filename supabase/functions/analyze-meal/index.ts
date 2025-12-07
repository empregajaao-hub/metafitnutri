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
    const { imageBase64, goal } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Verify authentication - get user from JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Autenticação necessária. Por favor, faça login." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Sessão inválida. Por favor, faça login novamente." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    console.log("Analyzing meal for user:", userId);

    // Use service role to check subscription and usage limits
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check user subscription
    const { data: subscription } = await supabaseAdmin
      .from("user_subscriptions")
      .select("plan, is_active")
      .eq("user_id", userId)
      .single();

    const isPaidUser = subscription?.is_active && 
      subscription?.plan && 
      ['monthly', 'annual', 'personal_trainer'].includes(subscription.plan);

    // For free users, check daily usage limit (1 analysis per 24h)
    if (!isPaidUser) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { count } = await supabaseAdmin
        .from("meal_analyses")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", twentyFourHoursAgo);

      if (count && count >= 1) {
        return new Response(
          JSON.stringify({ 
            error: "Limite diário atingido. Aguarde 24 horas ou faça upgrade para um plano pago.",
            limitReached: true 
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Prompt unificado: análise COMPLETA para todos (gratuitos e pagos)
    // Detecta se é comida pronta ou ingredientes crus
    const systemPrompt = `Você é um nutricionista angolano especializado em análise de refeições e criação de receitas.
Analise a foto e determine se é:
1. Uma REFEIÇÃO PRONTA (prato já preparado) - forneça análise nutricional completa
2. INGREDIENTES CRUS (alimentos não preparados) - sugira receitas angolanas com esses ingredientes

Considere pratos típicos angolanos como Funge, Moamba de Galinha, Calulu, Muamba de Dendém, Arroz, Feijão, Peixe, Carne, etc.

IMPORTANTE: 
1. Primeiro identifique se são ingredientes crus ou comida pronta
2. Se for COMIDA PRONTA: análise nutricional detalhada
3. Se forem INGREDIENTES CRUS: sugira 3-4 receitas angolanas que podem ser feitas com esses ingredientes
4. Identifique claramente o que o usuário DEVE comer e o que NÃO DEVE comer de acordo com sua meta
5. Forneça receitas alternativas 100% angolanas alinhadas ao objetivo

Responda APENAS com um JSON válido no seguinte formato:
{
  "type": "meal" ou "ingredients",
  "description": "descrição detalhada de todos os elementos visíveis",
  "items": [
    {
      "name": "nome do alimento/ingrediente",
      "estimated_grams": número em gramas,
      "calories": número de calorias,
      "protein_g": número,
      "carbs_g": número,
      "fat_g": número
    }
  ],
  "estimated_calories": número total (0 se for ingredientes crus),
  "protein_g": número total,
  "carbs_g": número total,
  "fat_g": número total,
  "portion_size": "descrição do tamanho da porção",
  "confidence": número entre 0 e 1,
  "what_to_eat": ["lista de alimentos/ingredientes da foto que o usuário DEVE comer segundo seu objetivo"],
  "what_not_to_eat": ["lista de alimentos/ingredientes da foto que o usuário NÃO DEVE comer segundo seu objetivo"],
  "suggested_recipes": [
    {
      "name": "nome da receita angolana",
      "description": "breve descrição da receita",
      "difficulty": "fácil, média ou difícil",
      "time_minutes": número,
      "why": "por que essa receita ajuda no objetivo do usuário",
      "ingredients_from_photo": ["ingredientes da foto usados"],
      "additional_ingredients": ["ingredientes adicionais necessários"],
      "steps": ["passo 1", "passo 2", "..."],
      "nutrition_per_portion": {
        "calories": número,
        "protein_g": número,
        "carbs_g": número,
        "fat_g": número
      }
    }
  ],
  "angolan_recipes": [
    {
      "name": "nome da receita angolana alternativa",
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

DIA DA SEMANA: ${new Date().toLocaleDateString('pt-AO', { weekday: 'long' })}
(Varie as receitas e sugestões baseado no dia - cada dia deve ter recomendações diferentes!)

IMPORTANTE:
1. Identifique TODOS os elementos visíveis no prato
2. Estime a gramagem de CADA elemento
3. Calcule os valores nutricionais de cada elemento
4. Forneça recomendações específicas e detalhadas baseadas no objetivo
5. Seja CRIATIVO - sugira receitas DIFERENTES das usuais para este dia
6. Varie os ingredientes adicionais sugeridos
7. Seja preciso e prático nas sugestões`
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

    // Save to database
    const { error: insertError } = await supabaseAdmin
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
