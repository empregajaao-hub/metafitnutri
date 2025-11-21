import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Versão simplificada para usuários não autenticados (sem ingredientes detalhados)
    const systemPromptFree = `Você é um nutricionista angolano especializado em análise de refeições. 
Analise a foto da refeição e forneça informações nutricionais básicas.
Considere pratos típicos angolanos como Funge, Moamba de Galinha, Calulu, Muamba de Dendém, Arroz, Feijão, Peixe, Carne, etc.

Responda APENAS com um JSON válido no seguinte formato:
{
  "description": "descrição geral do prato",
  "estimated_calories": número total,
  "protein_g": número total,
  "carbs_g": número total,
  "fat_g": número total,
  "portion_size": "descrição do tamanho da porção",
  "confidence": número entre 0 e 1,
  "analysis": {
    "for_loss": {
      "assessment": "análise básica para quem quer perder peso",
      "remove": ["lista de ajustes gerais"],
      "add": ["lista de sugestões gerais"]
    },
    "for_maintain": {
      "assessment": "análise básica para quem quer manter peso",
      "adjustments": ["lista de ajustes gerais"]
    },
    "for_gain": {
      "assessment": "análise básica para quem quer ganhar peso",
      "add": ["lista de sugestões gerais"],
      "increase": ["lista de ajustes gerais"]
    }
  }
}`;

    // Versão completa para usuários autenticados (com ingredientes detalhados)
    const systemPromptPaid = `Você é um nutricionista angolano especializado em análise de refeições. 
Analise a foto da refeição e forneça informações nutricionais DETALHADAS e COMPLETAS.
Considere pratos típicos angolanos como Funge, Moamba de Galinha, Calulu, Muamba de Dendém, Arroz, Feijão, Peixe, Carne, etc.

IMPORTANTE: Seja EXTREMAMENTE detalhado na sua análise de cada ingrediente.

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

    const systemPrompt = isAuthenticated ? systemPromptPaid : systemPromptFree;

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
