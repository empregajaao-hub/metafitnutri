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

interface PushSubscription {
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
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
        message: "🍽️ Hora de registar a tua refeição! Abre o METAFIT e fotografa o teu prato.",
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
        message: "🍽️ Hora de comer! Regista a tua refeição no METAFIT para acompanhar os macros.",
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
        message: "🍽️ Hora de comer! Regista a refeição para manter o equilíbrio.",
      },
      sleep_reminder: {
        time: "22:00",
        message: "😴 Hora de descansar! Um sono regular mantém o equilíbrio.",
      },
    },
  };

  return schedules[goal] || schedules.maintain;
};

// Web Push implementation
async function sendWebPush(subscription: PushSubscription, payload: object): Promise<boolean> {
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error("VAPID keys not configured");
    return false;
  }

  try {
    // Use fetch to send to the push endpoint with proper headers
    // This is a simplified implementation - for production, use proper VAPID signing
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 201) {
      console.log(`Push sent to ${subscription.user_id}`);
      return true;
    }

    console.error(`Push failed for ${subscription.user_id}: ${response.status}`);
    return false;
  } catch (error: any) {
    console.error(`Error sending push to ${subscription.user_id}:`, error.message);
    return false;
  }
}

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

    // Fetch users with goals and their push subscriptions
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, Objetivo")
      .not("Objetivo", "is", null);

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: "Nenhum usuário encontrado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let notificationsSent = 0;

    for (const profile of profiles) {
      // Check notification preferences
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", profile.id)
        .single();

      if (!prefs) continue;

      // Get push subscriptions for this user
      const { data: subscriptions } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", profile.id);

      if (!subscriptions || subscriptions.length === 0) continue;

      const schedule = getNotificationsByGoal(profile.Objetivo);

      // Check water reminders
      if (prefs.water_reminders && schedule.water_reminders.times.includes(currentHour)) {
        for (const sub of subscriptions) {
          const sent = await sendWebPush(sub, {
            title: "Lembrete de Água 💧",
            body: schedule.water_reminders.message,
            url: "/upload",
          });
          if (sent) notificationsSent++;
        }
      }

      // Check meal reminders
      if (prefs.meal_reminders && schedule.meal_reminders.times.includes(currentHour)) {
        for (const sub of subscriptions) {
          const sent = await sendWebPush(sub, {
            title: "Hora da Refeição 🍽️",
            body: schedule.meal_reminders.message,
            url: "/upload",
          });
          if (sent) notificationsSent++;
        }
      }

      // Check sleep reminder
      if (currentHour === schedule.sleep_reminder.time) {
        for (const sub of subscriptions) {
          const sent = await sendWebPush(sub, {
            title: "Hora de Dormir 😴",
            body: schedule.sleep_reminder.message,
            url: "/",
          });
          if (sent) notificationsSent++;
        }
      }

      // Daily motivation at 8am
      if (prefs.motivation && currentHour === "08:00") {
        const motivationalMessages = [
          "💪 Bom dia! Hoje é um novo dia para alcançar os teus objetivos!",
          "🌟 Acredita em ti mesmo! Cada passo conta na tua jornada.",
          "🔥 A consistência é a chave do sucesso. Vamos lá!",
          "✨ O teu esforço de hoje é o resultado de amanhã. Continue!",
        ];
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        
        for (const sub of subscriptions) {
          const sent = await sendWebPush(sub, {
            title: "Motivação Diária ✨",
            body: randomMessage,
            url: "/",
          });
          if (sent) notificationsSent++;
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
