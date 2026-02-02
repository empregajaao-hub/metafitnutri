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

// Trial day notifications to encourage engagement and conversion
const trialDayNotifications: Record<number, { title: string; body: string }> = {
  1: {
    title: "✨ Bem-vindo ao MetaFit Nutri!",
    body: "O teu caminho para mais saúde começa hoje. Explora o teu plano e dá o primeiro passo 💚",
  },
  2: {
    title: "💪 Motivação Diária",
    body: "Pequenas escolhas hoje constroem grandes resultados amanhã. Abre o app e continua a tua jornada!",
  },
  3: {
    title: "🥗 Recomendações Personalizadas",
    body: "Já viste as tuas recomendações personalizadas? Estão prontas para te ajudar a evoluir ainda esta semana.",
  },
  4: {
    title: "🌱 Consistência é a Chave",
    body: "Cuidar de ti é um ato diário. Estamos aqui para caminhar contigo — entra no app agora.",
  },
  5: {
    title: "⭐ Descobre o Premium",
    body: "Utilizadores premium têm acesso a planos completos, acompanhamento e conteúdos exclusivos. Experimenta dar o próximo passo hoje.",
  },
  6: {
    title: "⏳ Estás Quase Lá",
    body: "Estás perto de transformar a tua rotina de saúde. Desbloqueia tudo com um plano MetaFit Nutri.",
  },
  7: {
    title: "🚀 Último Dia de Teste",
    body: "Pronto para levar a tua saúde a sério? Assina agora o MetaFit Nutri e continua a tua evolução sem limites.",
  },
};

const getNotificationsByGoal = (goal: string): NotificationSchedule => {
  const schedules: Record<string, NotificationSchedule> = {
    lose: {
      water_reminders: {
        times: ["08:00", "11:00", "14:00", "17:00", "20:00"],
        message: "💧 Hora de beber água! Mantém-te hidratado para ajudar na perda de peso.",
      },
      meal_reminders: {
        times: ["07:30", "12:30", "15:30", "19:00"],
        message: "🍽️ Hora de comer! Refeições regulares ajudam no teu objetivo de perder peso.",
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
        message: "💧 Hora de beber água! Mantém a hidratação em dia.",
      },
      meal_reminders: {
        times: ["08:00", "13:00", "20:00"],
        message: "🍽️ Hora de comer! Mantém uma rotina alimentar equilibrada.",
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
      .select("id, Objetivo")
      .not("Objetivo", "is", null);

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

      const schedule = getNotificationsByGoal(user.Objetivo);

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
          "✨ O teu esforço de hoje é o resultado de amanhã. Continua!",
        ];
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        await sendWebPushNotification(supabase, user.id, "Motivação Diária", randomMessage);
        notificationsSent++;
      }
    }

    // Trial day notifications (send at 09:00 for better engagement)
    if (currentHour === "09:00") {
      const now = new Date();
      const { data: trialUsers } = await supabase
        .from("user_subscriptions")
        .select("user_id, trial_start_date, plan")
        .eq("plan", "free")
        .eq("is_active", true)
        .not("trial_start_date", "is", null);

      if (trialUsers?.length) {
        for (const t of trialUsers as any[]) {
          const trialStart = new Date(t.trial_start_date);
          const msPerDay = 1000 * 60 * 60 * 24;
          const daysSinceStart = Math.floor((now.getTime() - trialStart.getTime()) / msPerDay) + 1;

          // Only send for days 1-7
          if (daysSinceStart >= 1 && daysSinceStart <= 7) {
            const notification = trialDayNotifications[daysSinceStart];
            if (notification) {
              const url = daysSinceStart >= 5 ? "/subscription" : "/";
              await sendWebPushNotification(supabase, t.user_id, notification.title, notification.body, url);
              notificationsSent++;
              console.log(`Trial day ${daysSinceStart} notification sent to user ${t.user_id}`);
            }
          }
        }
      }
    }

    // Alertas de expiração de subscrição (executar preferencialmente 08:00)
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
      const statusCode = (e as any)?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
      }
      console.log("Falha ao enviar web push:", e);
    }
  }
}
