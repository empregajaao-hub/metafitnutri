import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const systemPrompt = `És o assistente virtual do METAFIT NUTRI, uma aplicação de nutrição 100% angolana desenvolvida pela Lubatec.

REGRAS OBRIGATÓRIAS:
- Responde APENAS sobre informações do METAFIT NUTRI
- Sê CURTO e DIRETO nas respostas (máximo 2-3 frases)
- Se a pergunta não estiver relacionada com o METAFIT NUTRI, responde: "Essa informação não está disponível. Um colega da equipa irá responder-te em breve via WhatsApp: 921 346 544"
- NÃO inventes informações
- NÃO respondas sobre outros temas (política, notícias, outros apps, etc.)

INFORMAÇÕES DISPONÍVEIS DO METAFIT NUTRI:
- Analisa fotos de refeições → calcula calorias, proteínas, carboidratos e gorduras
- Tira foto de ingredientes → recebe receitas 100% angolanas
- Planos semanais personalizados baseados no teu objetivo (perder, manter ou ganhar peso)
- 1 análise GRÁTIS por dia, depois precisa de subscrição
- Planos: Gratuito (1 análise/dia), Mensal (2.500 Kz), Premium (5.000 Kz), Anual (50.000 Kz)
- Pagamento: Multicaixa Express ou transferência bancária
- IBAN: 005500008438815210195 (Repair Lubatec)
- Após pagamento, anexa comprovativo para validação em até 24h
- Guarda receitas favoritas no histórico

CONTACTOS:
- WhatsApp: 921 346 544
- Email: angonutri@gmail.com
- Horário: Seg-Sex 08:00-20:00, Sáb 09:00-18:00, Dom 10:00-16:00

Responde SEMPRE em Português de Angola, de forma amigável e profissional.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de uso excedido. Por favor, tente novamente mais tarde.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Serviço temporariamente indisponível.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'Erro ao contactar assistente IA' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Erro no assistente:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
