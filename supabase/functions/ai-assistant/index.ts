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

    const systemPrompt = `És um assistente virtual do METAFIT, uma aplicação de nutrição 100% angolana. 

INFORMAÇÕES DO METAFIT:
- Analisa fotos de refeições e calcula macronutrientes (calorias, proteínas, carboidratos, gorduras)
- Gera receitas 100% angolanas com ingredientes locais
- Cria planos personalizados semanais baseados nos objetivos do utilizador
- Objetivos disponíveis: perder peso, manter peso, ganhar peso/massa muscular
- Pagamento via Multicaixa, transferência bancária ou MB WAY
- Planos: Mensal (5.000 Kz/mês) e Anual (50.000 Kz/ano, poupa 10.000 Kz)
- Primeiro uso é GRÁTIS (1 análise gratuita), depois precisa de subscrição
- Após pagamento, utilizador anexa comprovativo que é validado em até 24h

CONTACTOS DE SUPORTE:
- WhatsApp: 921 346 544
- Email: angonutri@gmail.com
- Horário: Seg-Sex 08:00-20:00, Sáb 09:00-18:00, Dom 10:00-16:00

FUNCIONALIDADES:
1. Tirar foto da comida → Recebe análise nutricional
2. Tirar foto de ingredientes → Recebe receitas angolanas
3. Plano personalizado semanal com lista de compras
4. Histórico de refeições e análises

Responde SEMPRE em Português de Angola, de forma amigável, profissional e concisa. Se o utilizador perguntar sobre funcionalidades que não existem, sugere o que está disponível.`;

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
