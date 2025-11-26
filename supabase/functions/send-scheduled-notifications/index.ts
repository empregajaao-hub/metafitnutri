import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationSchedule {
  water_reminders: { times: string[]; message: string };
  meal_reminders: { times: string[]; message: string };
  sleep_reminder: { time: string; message: string };
}

const getNotificationsByGoal = (goal: string): NotificationSchedule => {
  const schedules: Record<string, NotificationSchedule> = {
    lose: {
      water_reminders: {
        times: ["08:00", "11:00", "14:00", "17:00", "20:00"],
        message: "💧 Hora de beber água! Mantenha-se hidratado para ajudar na perda de peso.",
      },
      meal_reminders: {
        times: ["07:30", "12:30", "15:30", "19:00"],
        message: "🍽️ Hora de comer! Refeições regulares ajudam no seu objetivo de perder peso.",
      },
      sleep_reminder: {
        time: "22:00",
        message: "😴 Hora de descansar! Um bom sono é essencial para a perda de peso.",
      },
    },
    gain: {
      water_reminders: {
        times: ["07:00", "10:00", "13:00", "16:00", "19:00", "21:00"],
        message: "💧 Bebe água! Essencial para o ganho de massa muscular.",
      },
      meal_reminders: {
        times: ["07:00", "10:00", "13:00", "16:00", "19:00", "21:30"],
        message: "🍽️ Hora de comer! Refeições frequentes ajudam no ganho de massa.",
      },
      sleep_reminder: {
        time: "22:30",
        message: "😴 Hora de dormir! O descanso é fundamental para o crescimento muscular.",
      },
    },
    maintain: {
      water_reminders: {
        times: ["08:00", "12:00", "16:00", "20:00"],
        message: "💧 Hora de beber água! Mantenha a hidratação em dia.",
      },
      meal_reminders: {
        times: ["08:00", "13:00", "20:00"],
        message: "🍽️ Hora de comer! Mantenha uma rotina alimentar equilibrada.",
      },
      sleep_reminder: {
        time: "22:00",
        message: "😴 Hora de descansar! Um sono regular mantém o equilíbrio.",
      },
    },
  };

  return schedules[goal] || schedules.maintain;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const currentHour = new Date().toLocaleTimeString("pt-AO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    console.log(`Verificando notificações para ${currentHour}`);

    // Buscar usuários com notificações ativadas
    const { data: users } = await supabase
      .from("profiles")
      .select("id, goal")
      .not("goal", "is", null);

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: "Nenhum usuário encontrado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let notificationsSent = 0;

    for (const user of users) {
      // Verificar preferências de notificação
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!prefs) continue;

      const schedule = getNotificationsByGoal(user.goal);

      // Verificar notificações de água
      if (prefs.water_reminders && schedule.water_reminders.times.includes(currentHour)) {
        await sendWebPushNotification(user.id, "Lembrete de Água", schedule.water_reminders.message);
        notificationsSent++;
      }

      // Verificar notificações de refeição
      if (prefs.meal_reminders && schedule.meal_reminders.times.includes(currentHour)) {
        await sendWebPushNotification(user.id, "Hora da Refeição", schedule.meal_reminders.message);
        notificationsSent++;
      }

      // Verificar notificação de sono
      if (currentHour === schedule.sleep_reminder.time) {
        await sendWebPushNotification(user.id, "Hora de Dormir", schedule.sleep_reminder.message);
        notificationsSent++;
      }

      // Notificações motivacionais diárias (8h da manhã)
      if (prefs.motivation && currentHour === "08:00") {
        const motivationalMessages = [
          "💪 Bom dia! Hoje é um novo dia para alcançar os teus objetivos!",
          "🌟 Acredita em ti mesmo! Cada passo conta na tua jornada.",
          "🔥 A consistência é a chave do sucesso. Vamos lá!",
          "✨ O teu esforço de hoje é o resultado de amanhã. Continue!",
        ];
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        await sendWebPushNotification(user.id, "Motivação Diária", randomMessage);
        notificationsSent++;
      }
    }

    return new Response(
      JSON.stringify({
        message: `${notificationsSent} notificações enviadas`,
        time: currentHour,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Erro:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sendWebPushNotification(userId: string, title: string, message: string) {
  // Implementação simplificada - em produção, usar Web Push API
  console.log(`Notificação para ${userId}: ${title} - ${message}`);
  
  // Aqui você pode integrar com serviços como OneSignal, Firebase, ou Web Push API
  // Por enquanto, apenas logamos a notificação
}
