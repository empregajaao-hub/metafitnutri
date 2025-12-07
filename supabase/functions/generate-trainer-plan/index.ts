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
    const { student, trainerName, planType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const goalMap: { [key: string]: string } = {
      lose_weight: "perder peso e queimar gordura",
      gain_weight: "ganhar massa muscular",
      maintain: "manter o peso e melhorar condição física",
    };
    const studentGoal = String(student.goal || "");
    const goalText = goalMap[studentGoal] || "melhorar a saúde";

    const activityMap: { [key: string]: string } = {
      sedentary: "sedentário",
      light: "leve (1-2x por semana)",
      moderate: "moderado (3-4x por semana)",
      active: "ativo (5-6x por semana)",
      very_active: "muito ativo (treina diariamente)",
    };
    const studentActivity = String(student.activityLevel || "");
    const activityText = activityMap[studentActivity] || "moderado";

    const systemPrompt = planType === "workout" 
      ? `Tu és um personal trainer especializado em criar planos de treino personalizados. 
         Cria planos práticos e eficazes para o contexto angolano.
         Responde SEMPRE em formato JSON válido.`
      : `Tu és um nutricionista especializado em criar planos alimentares personalizados.
         Prioriza alimentos e receitas angolanas típicas.
         Responde SEMPRE em formato JSON válido.`;

    const userPrompt = planType === "workout"
      ? `Cria um plano de treino semanal para:
         
         DADOS DO ALUNO:
         - Nome: ${student.name}
         - Idade: ${student.age || "Não informado"} anos
         - Peso: ${student.weight || "Não informado"} kg
         - Altura: ${student.height || "Não informado"} cm
         - Objetivo: ${goalText}
         - Nível de atividade: ${activityText}
         
         Personal Trainer: ${trainerName}
         
         Retorna um JSON com esta estrutura:
         {
           "exercises": [
             {
               "name": "nome do exercício",
               "sets": "número de séries",
               "reps": "número de repetições ou duração",
               "notes": "dica de execução"
             }
           ],
           "tips": ["dica 1", "dica 2", "dica 3"],
           "weeklySchedule": "descrição da divisão semanal"
         }
         
         Inclui 6-8 exercícios variados e apropriados para o objetivo.`
      : `Cria um plano alimentar diário para:
         
         DADOS DO ALUNO:
         - Nome: ${student.name}
         - Idade: ${student.age || "Não informado"} anos
         - Peso: ${student.weight || "Não informado"} kg
         - Altura: ${student.height || "Não informado"} cm
         - Objetivo: ${goalText}
         - Nível de atividade: ${activityText}
         
         Personal Trainer: ${trainerName}
         
         IMPORTANTE: Usa alimentos e receitas 100% angolanas como funje, mufete, calulu, funge, kissaca, banana pão, muamba, etc.
         
         Retorna um JSON com esta estrutura:
         {
           "meals": [
             {
               "name": "Pequeno-almoço",
               "time": "07:00",
               "foods": ["alimento 1", "alimento 2"],
               "calories": 400
             }
           ],
           "hydration": "recomendação de hidratação",
           "notes": "observações gerais",
           "dailyCalories": 2000
         }
         
         Inclui 5-6 refeições ao longo do dia.`;

    console.log(`Generating ${planType} plan for ${student.name}`);

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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`Erro ao gerar plano: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    console.log("AI Response:", content);

    // Extract JSON from response
    let plan;
    try {
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // Return a default structure
      plan = planType === "workout" 
        ? {
            exercises: [
              { name: "Agachamentos", sets: "3", reps: "12", notes: "Mantém as costas rectas" },
              { name: "Flexões", sets: "3", reps: "10", notes: "Corpo alinhado" },
              { name: "Prancha", sets: "3", reps: "30 segundos", notes: "Contrai o abdómen" },
              { name: "Lunges", sets: "3", reps: "10 cada perna", notes: "Joelho não passa do pé" },
              { name: "Burpees", sets: "3", reps: "8", notes: "Movimento explosivo" },
            ],
            tips: [
              "Aquece sempre 5-10 minutos antes",
              "Hidrata-te durante o treino",
              "Descansa 60-90 segundos entre séries",
            ],
          }
        : {
            meals: [
              { name: "Pequeno-almoço", time: "07:00", foods: ["Pão com manteiga", "Chá ou café", "Banana"], calories: 350 },
              { name: "Lanche", time: "10:00", foods: ["Fruta da época"], calories: 100 },
              { name: "Almoço", time: "13:00", foods: ["Funje com mufete", "Salada verde"], calories: 550 },
              { name: "Lanche", time: "16:00", foods: ["Iogurte natural"], calories: 150 },
              { name: "Jantar", time: "19:00", foods: ["Calulu de peixe", "Arroz"], calories: 500 },
            ],
            hydration: "Bebe pelo menos 2 litros de água por dia",
            notes: "Evita alimentos processados e bebidas açucaradas",
          };
    }

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});