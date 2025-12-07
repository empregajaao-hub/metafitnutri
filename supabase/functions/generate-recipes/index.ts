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
    const { imagesBase64, goal } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um chef angolano especializado em criar receitas nutritivas e adaptadas aos objetivos de saúde.
Analise as fotos dos ingredientes fornecidos e crie receitas angolanas completas e detalhadas.

IMPORTANTE: Seja extremamente detalhado e prático.

Responda APENAS com um JSON válido no seguinte formato:
{
  "identified_ingredients": [
    {
      "name": "nome do ingrediente",
      "estimated_quantity": "quantidade estimada (ex: 500g, 3 unidades)",
      "category": "categoria (proteína, vegetal, carboidrato, etc)"
    }
  ],
  "main_recipe": {
    "title": "nome da receita principal",
    "description": "descrição atrativa da receita",
    "difficulty": "fácil, média ou difícil",
    "time_minutes": número de minutos,
    "portions": número de porções,
    "ingredients_detailed": [
      {
        "ingredient": "nome do ingrediente",
        "quantity_grams": número em gramas,
        "preparation": "como preparar este ingrediente"
      }
    ],
    "steps": ["passo 1 detalhado", "passo 2 detalhado", "..."],
    "nutrition_per_portion": {
      "calories": número,
      "protein_g": número,
      "carbs_g": número,
      "fat_g": número
    },
    "analysis": {
      "for_loss": {
        "assessment": "análise para perda de peso",
        "modifications": ["modificação 1", "modificação 2"],
        "remove": ["ingrediente a remover"],
        "reduce": ["ingrediente a reduzir"],
        "add": ["ingrediente a adicionar"]
      },
      "for_maintain": {
        "assessment": "análise para manutenção",
        "tips": ["dica 1", "dica 2"]
      },
      "for_gain": {
        "assessment": "análise para ganho de peso",
        "add": ["ingrediente a adicionar"],
        "increase": ["ingrediente a aumentar"]
      }
    }
  },
  "alternative_recipes": [
    {
      "title": "nome da receita alternativa",
      "description": "descrição breve",
      "difficulty": "fácil, média ou difícil",
      "time_minutes": número,
      "key_difference": "o que diferencia esta receita da principal",
      "nutrition_per_portion": {
        "calories": número,
        "protein_g": número,
        "carbs_g": número,
        "fat_g": número
      },
      "suitable_for": ["lose", "maintain", "gain"] // objetivos para os quais é adequada
    }
  ]
}`;

    // Build the content array with text and all images
    const content: any[] = [
      {
        type: "text",
        text: `Analise estes ingredientes e crie receitas angolanas DETALHADAS. O objetivo do utilizador é: ${goal === 'lose' ? 'perder peso' : goal === 'gain' ? 'ganhar peso' : 'manter peso'}.

DIA DA SEMANA: ${new Date().toLocaleDateString('pt-AO', { weekday: 'long' })}
(As receitas devem variar conforme o dia - cada dia oferece sugestões criativas e diferentes!)

REQUISITOS:
1. Identifique TODOS os ingredientes nas fotos
2. Crie uma receita principal CRIATIVA usando estes ingredientes - diferente para cada dia!
3. Forneça gramagens EXATAS para cada ingrediente
4. Dê instruções passo-a-passo muito claras
5. Calcule valores nutricionais precisos
6. Faça análise completa baseada no objetivo
7. Sugira 2-3 receitas ALTERNATIVAS e VARIADAS com os mesmos ingredientes
8. Seja CRIATIVO - evite repetir as mesmas receitas sempre`
      }
    ];

    // Add all images to the content
    for (const imageBase64 of imagesBase64) {
      content.push({
        type: "image_url",
        image_url: {
          url: imageBase64
        }
      });
    }

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
            content: content
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
    const content_response = data.choices[0].message.content;
    
    // Extract JSON from the response
    const jsonMatch = content_response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Resposta inválida da IA");
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-recipes function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
