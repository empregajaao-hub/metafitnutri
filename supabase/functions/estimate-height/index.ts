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
    const { imageBase64, referenceObject } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um especialista em antropometria visual e visão computacional.
Sua tarefa é estimar a altura de uma pessoa a partir de uma foto de corpo inteiro.

DIRETRIZES:
1. Analise as proporções do corpo em relação ao ambiente.
2. Se houver um objeto de referência mencionado (${referenceObject || 'nenhum específico'}), use-o para calibrar a escala.
3. Considere fatores como perspectiva e ângulo da câmera.
4. Forneça uma estimativa em centímetros (cm) com uma margem de erro.
5. Esta é uma funcionalidade EXPERIMENTAL.

Responda APENAS com um JSON válido no seguinte formato:
{
  "estimated_height_cm": número,
  "confidence_score": número (0-1),
  "margin_of_error_cm": número,
  "analysis_notes": "Breve explicação de como a altura foi estimada",
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
                text: `Estime a altura desta pessoa. Objeto de referência: ${referenceObject || 'padrão (portas, móveis)'}.`
              },
              {
                type: "image_url",
                image_url: { url: imageBase64 }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao comunicar com o serviço de IA.");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Resposta inválida da IA");
    
    return new Response(jsonMatch[0], {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
