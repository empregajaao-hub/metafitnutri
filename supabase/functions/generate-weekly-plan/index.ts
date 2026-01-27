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
    const { userId, profile, planType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
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

    // Verify user has evolution or personal_trainer subscription
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: subscription } = await supabaseAdmin
      .from("user_subscriptions")
      .select("plan, is_active")
      .eq("user_id", user.id)
      .single();

    const allowedPlans = ['essential', 'evolution', 'personal_trainer'];
    if (!subscription?.is_active || !allowedPlans.includes(subscription?.plan || '')) {
      return new Response(
        JSON.stringify({ error: "Acesso restrito. Esta funcionalidade requer um plano pago (Essencial, Evolução ou Personal Trainer)." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating weekly ${planType} plan for user:`, user.id);

    const goalMap: { [key: string]: string } = {
      lose_weight: "perder peso e queimar gordura",
      gain_weight: "ganhar massa muscular",
      maintain: "manter o peso e melhorar condição física",
      perder_peso: "perder peso e queimar gordura",
      ganhar_peso: "ganhar massa muscular",
      manter_peso: "manter o peso e melhorar condição física",
    };
    const goalText = goalMap[profile.goal] || profile.goal || "melhorar a saúde";

    const activityMap: { [key: string]: string } = {
      sedentary: "sedentário",
      light: "leve (1-2x por semana)",
      moderate: "moderado (3-4x por semana)",
      active: "ativo (5-6x por semana)",
      very_active: "muito ativo (treina diariamente)",
      sedentario: "sedentário",
      leve: "leve (1-2x por semana)",
      moderado: "moderado (3-4x por semana)",
      ativo: "ativo (5-6x por semana)",
      muito_ativo: "muito ativo (treina diariamente)",
    };
    const activityText = activityMap[profile.activityLevel] || profile.activityLevel || "moderado";

    const systemPrompt = planType === "meal" 
      ? `Tu és um nutricionista especializado em criar planos alimentares personalizados para o contexto angolano.
         Prioriza alimentos e receitas angolanas típicas como funje, mufete, calulu, kissaca, banana pão, muamba, kizaca, feijão de óleo, etc.
         Cria planos detalhados, práticos e deliciosos.
         Responde SEMPRE em formato JSON válido.`
      : `Tu és um personal trainer especializado em criar planos de treino personalizados.
         Cria planos práticos e eficazes que podem ser feitos em casa ou num ginásio.
         Adapta os exercícios ao nível de condição física do utilizador.
         Responde SEMPRE em formato JSON válido.`;

    const userPrompt = planType === "meal"
      ? `Cria um plano alimentar SEMANAL COMPLETO para:
         
         DADOS DO UTILIZADOR:
         - Nome: ${profile.name || "Utilizador"}
         - Idade: ${profile.age || "Não informado"} anos
         - Peso: ${profile.weight || "Não informado"} kg
         - Altura: ${profile.height || "Não informado"} cm
         - Objetivo: ${goalText}
         - Nível de atividade: ${activityText}
         
         IMPORTANTE: Usa alimentos e receitas 100% angolanas!
         
         Retorna um JSON com esta estrutura:
         {
           "weeklyPlan": {
             "monday": {
               "meals": [
                 { "name": "Pequeno-almoço", "time": "07:00", "foods": ["alimento 1", "alimento 2"], "calories": 400 },
                 { "name": "Lanche da manhã", "time": "10:00", "foods": ["alimento"], "calories": 150 },
                 { "name": "Almoço", "time": "13:00", "foods": ["prato principal", "acompanhamento"], "calories": 600 },
                 { "name": "Lanche da tarde", "time": "16:00", "foods": ["alimento"], "calories": 150 },
                 { "name": "Jantar", "time": "19:00", "foods": ["prato principal"], "calories": 500 }
               ]
             },
             "tuesday": { "meals": [...] },
             "wednesday": { "meals": [...] },
             "thursday": { "meals": [...] },
             "friday": { "meals": [...] },
             "saturday": { "meals": [...] },
             "sunday": { "meals": [...] }
           },
           "dailyCalories": 2000,
           "hydration": "recomendação de hidratação",
           "tips": ["dica 1", "dica 2", "dica 3"],
           "notes": "observações gerais sobre o plano"
         }
         
         Cada dia deve ter 5-6 refeições variadas e equilibradas.`
      : `Cria um plano de treino SEMANAL COMPLETO para:
         
         DADOS DO UTILIZADOR:
         - Nome: ${profile.name || "Utilizador"}
         - Idade: ${profile.age || "Não informado"} anos
         - Peso: ${profile.weight || "Não informado"} kg
         - Altura: ${profile.height || "Não informado"} cm
         - Objetivo: ${goalText}
         - Nível de atividade: ${activityText}
         
         Retorna um JSON com esta estrutura:
         {
           "weeklyPlan": {
             "monday": {
               "focus": "Peito e Tríceps",
               "duration": "45 minutos",
               "exercises": [
                 { "name": "nome do exercício", "sets": "3", "reps": "12", "notes": "dica de execução" }
               ]
             },
             "tuesday": { "focus": "...", "duration": "...", "exercises": [...] },
             "wednesday": { "focus": "Descanso Ativo", "duration": "30 minutos", "exercises": [...] },
             "thursday": { "focus": "...", "duration": "...", "exercises": [...] },
             "friday": { "focus": "...", "duration": "...", "exercises": [...] },
             "saturday": { "focus": "...", "duration": "...", "exercises": [...] },
             "sunday": { "focus": "Descanso", "duration": "-", "exercises": [] }
           },
           "warmup": ["exercício de aquecimento 1", "exercício 2"],
           "cooldown": ["alongamento 1", "alongamento 2"],
           "tips": ["dica 1", "dica 2", "dica 3"],
           "notes": "observações gerais sobre o plano"
         }
         
         Inclui 4-6 exercícios por dia de treino, com pelo menos 1 dia de descanso.`;

    console.log(`Calling AI for ${planType} plan`);

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
          { role: "user", content: userPrompt },
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
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`Erro ao gerar plano: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    console.log("AI Response received, parsing JSON...");

    // Extract JSON from response
    let plan;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.log("Raw content:", content);
      
      // Return a default structure
      plan = planType === "meal" 
        ? {
            weeklyPlan: {
              monday: { meals: [
                { name: "Pequeno-almoço", time: "07:00", foods: ["Pão com manteiga", "Chá"], calories: 300 },
                { name: "Almoço", time: "13:00", foods: ["Funje com mufete de peixe"], calories: 550 },
                { name: "Jantar", time: "19:00", foods: ["Calulu de peixe com arroz"], calories: 500 }
              ]},
              tuesday: { meals: [
                { name: "Pequeno-almoço", time: "07:00", foods: ["Papa de milho com leite"], calories: 350 },
                { name: "Almoço", time: "13:00", foods: ["Feijão de óleo com banana pão"], calories: 600 },
                { name: "Jantar", time: "19:00", foods: ["Muamba de galinha com funge"], calories: 550 }
              ]},
              wednesday: { meals: [{ name: "Pequeno-almoço", time: "07:00", foods: ["Pão com ovo"], calories: 350 }]},
              thursday: { meals: [{ name: "Pequeno-almoço", time: "07:00", foods: ["Fruta da época"], calories: 200 }]},
              friday: { meals: [{ name: "Pequeno-almoço", time: "07:00", foods: ["Café com pão"], calories: 280 }]},
              saturday: { meals: [{ name: "Pequeno-almoço", time: "07:00", foods: ["Tapioca"], calories: 320 }]},
              sunday: { meals: [{ name: "Pequeno-almoço", time: "07:00", foods: ["Refeição livre"], calories: 400 }]}
            },
            dailyCalories: 2000,
            hydration: "Bebe pelo menos 2 litros de água por dia",
            tips: ["Evita alimentos processados", "Come devagar", "Prepara as refeições com antecedência"],
            notes: "Este plano foi criado como modelo base. Ajusta as porções conforme necessário."
          }
        : {
            weeklyPlan: {
              monday: { focus: "Peito e Tríceps", duration: "45 min", exercises: [
                { name: "Flexões", sets: "3", reps: "12", notes: "Corpo alinhado" },
                { name: "Flexões diamante", sets: "3", reps: "10", notes: "Mãos juntas" },
                { name: "Dips em cadeira", sets: "3", reps: "12", notes: "Cotovelos para trás" }
              ]},
              tuesday: { focus: "Costas e Bíceps", duration: "45 min", exercises: [
                { name: "Remada com garrafas", sets: "3", reps: "12", notes: "Puxa até o peito" },
                { name: "Curl de bíceps", sets: "3", reps: "15", notes: "Movimento controlado" }
              ]},
              wednesday: { focus: "Descanso Ativo", duration: "30 min", exercises: [
                { name: "Caminhada", sets: "1", reps: "20 min", notes: "Ritmo moderado" }
              ]},
              thursday: { focus: "Pernas", duration: "50 min", exercises: [
                { name: "Agachamentos", sets: "4", reps: "15", notes: "Joelhos não passam os pés" },
                { name: "Afundos", sets: "3", reps: "12 cada", notes: "Passo largo" }
              ]},
              friday: { focus: "Ombros e Core", duration: "40 min", exercises: [
                { name: "Prancha", sets: "3", reps: "45 seg", notes: "Corpo reto" },
                { name: "Elevação lateral", sets: "3", reps: "12", notes: "Cotovelos levemente dobrados" }
              ]},
              saturday: { focus: "Cardio", duration: "30 min", exercises: [
                { name: "Burpees", sets: "3", reps: "10", notes: "Explosão máxima" },
                { name: "Mountain climbers", sets: "3", reps: "20", notes: "Ritmo rápido" }
              ]},
              sunday: { focus: "Descanso", duration: "-", exercises: [] }
            },
            warmup: ["Polichinelos 2 min", "Rotação de braços", "Agachamentos leves"],
            cooldown: ["Alongamento de pernas", "Alongamento de braços", "Respiração profunda"],
            tips: ["Aquece sempre antes do treino", "Hidrata-te bem", "Descansa o suficiente"],
            notes: "Este plano foi criado como modelo base. Ajusta a intensidade conforme necessário."
          };
    }

    console.log("Plan generated successfully");

    return new Response(JSON.stringify({ plan, success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating weekly plan:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
