import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.7?target=deno";

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

    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const VAPID_EMAIL = Deno.env.get("VAPID_EMAIL") || "mailto:repairlubatec@gmail.com";

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      throw new Error("VAPID keys não configuradas");
    }

    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

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
        await sendWebPushNotification(supabase, user.id, "Lembrete de Água", schedule.water_reminders.message);
        notificationsSent++;
      }

      // Verificar notificações de refeição
      if (prefs.meal_reminders && schedule.meal_reminders.times.includes(currentHour)) {
        await sendWebPushNotification(supabase, user.id, "Hora da Refeição", schedule.meal_reminders.message);
        notificationsSent++;
      }

      // Verificar notificação de sono
      if (currentHour === schedule.sleep_reminder.time) {
        await sendWebPushNotification(supabase, user.id, "Hora de Dormir", schedule.sleep_reminder.message);
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
        await sendWebPushNotification(supabase, user.id, "Motivação Diária", randomMessage);
        notificationsSent++;
      }
    }

    // Alertas de expiração de subscrição (executar preferencialmente 08:00)
    // - Envia quando faltar 3 dias, 1 dia, e no dia que expira.
    if (currentHour === "08:00") {
      const now = new Date();
      const { data: subs } = await supabase
        .from("user_subscriptions")
        .select("user_id, plan, end_date, is_active")
        .neq("plan", "free")
        .not("end_date", "is", null)
        .eq("is_active", true);

      if (subs?.length) {
        for (const s of subs as any[]) {
          const end = new Date(s.end_date);
          const msPerDay = 1000 * 60 * 60 * 24;
          const daysLeft = Math.ceil((end.getTime() - now.getTime()) / msPerDay);

          if (![3, 1, 0].includes(daysLeft)) continue;

          const title = "A tua subscrição está a terminar";
          const body =
            daysLeft <= 0
              ? "O teu período do plano terminou hoje. Para continuar com acesso total, renova a subscrição."
              : `Faltam ${daysLeft} ${daysLeft === 1 ? "dia" : "dias"} para o teu plano terminar. Renova com antecedência para não perderes acesso.`;

          await sendWebPushNotification(supabase, s.user_id, title, body, "/subscription");
          notificationsSent++;
        }
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

async function sendWebPushNotification(
  // Tipagem flexível para evitar conflitos de generics no Deno/esm
  supabase: any,
  userId: string,
  title: string,
  message: string,
  url = "/"
) {
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!subs || subs.length === 0) return;

  const payload = JSON.stringify({ title, body: message, url });

  for (const s of subs as any[]) {
    const subscription = {
      endpoint: s.endpoint,
      keys: {
        p256dh: s.p256dh,
        auth: s.auth,
      },
    };

    try {
      await webpush.sendNotification(subscription as any, payload);
    } catch (e) {
      // Se o endpoint expirou, remove para evitar falhas repetidas
      const statusCode = (e as any)?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
      }
      console.log("Falha ao enviar web push:", e);
    }
  }
}
