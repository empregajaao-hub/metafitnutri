import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Droplets, Utensils, Moon, Flame, TrendingUp, Scale, Coffee, Cookie, Sparkles, AlertTriangle, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface SmartNotificationsProps {
  userGoal?: "lose" | "maintain" | "gain" | null;
  userName?: string;
}

const SmartNotifications = ({ userGoal: propGoal, userName }: SmartNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userGoal, setUserGoal] = useState<string | null>(propGoal || null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          if (!propGoal) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("Objetivo")
              .eq("id", user.id)
              .maybeSingle();
            if (profile?.Objetivo) setUserGoal(profile.Objetivo);
          }
        }
      } catch (error) {
        console.log("SmartNotifications: Error fetching user:", error);
      }
    };
    fetchUser();
  }, [propGoal]);

  // Listen for admin notifications in realtime
  useEffect(() => {
    if (!userId) return;

    try {
      const channel = supabase
        .channel("smart-notif-admin")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications" },
          (payload) => {
            try {
              const n = payload.new as any;
              const isForMe =
                n.target_audience === "all" ||
                n.target_audience === `user:${userId}`;
              if (isForMe) {
                const adminNotif: Notification = {
                  id: `admin-${n.id}`,
                  type: "admin",
                  title: n.title,
                  message: n.message,
                  icon: <Bell className="w-5 h-5" />,
                  color: "text-blue-500",
                  bgColor: "bg-blue-500/10",
                };
                setNotifications(prev => [adminNotif, ...prev]);
              }
            } catch (error) {
              console.log("SmartNotifications: Error processing notification:", error);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.log("SmartNotifications: Error setting up realtime channel:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (userGoal) {
      try {
        checkNotifications();
        const interval = setInterval(checkNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
      } catch (error) {
        console.log("SmartNotifications: Error in notification check:", error);
      }
    }
  }, [userGoal]);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("Objetivo")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.Objetivo) setUserGoal(profile.Objetivo);
    } catch (error) {
      console.log("SmartNotifications: Error loading user data:", error);
    }
  };

  const getGoalBasedNotifications = (goal: string): Notification[] => {
    const currentHour = new Date().getHours();
    const notifications: Notification[] = [];
    const firstName = userName?.split(' ')[0] || '';

    // Horários de água personalizados por objetivo
    const waterSchedule = {
      gain: [7, 9, 11, 13, 15, 17, 19, 21],
      lose: [7, 10, 12, 14, 16, 18, 20],
      maintain: [8, 11, 14, 17, 20]
    };

    const schedule = waterSchedule[goal as keyof typeof waterSchedule] || waterSchedule.maintain;
    
    if (schedule.includes(currentHour)) {
      notifications.push({
        id: `water-${currentHour}`,
        type: "water",
        title: firstName ? `${firstName}, hora de hidratar! 💧` : "Hora de Hidratar! 💧",
        message: goal === 'gain' 
          ? "Água ajuda no transporte de nutrientes para os músculos. Bebe 300ml agora!"
          : goal === 'lose'
          ? "Beber água acelera o metabolismo e reduz a fome. 250ml agora!"
          : "Mantém-te hidratado para um corpo saudável. 250ml agora!",
        icon: <Droplets className="w-5 h-5" />,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10"
      });
    }

    // Horários de refeição personalizados
    const mealSchedule = {
      gain: { hours: [7, 10, 13, 16, 19, 21], names: ['Pequeno-almoço', 'Lanche manhã', 'Almoço', 'Lanche tarde', 'Jantar', 'Ceia'] },
      lose: { hours: [8, 12, 16, 19], names: ['Pequeno-almoço', 'Almoço', 'Lanche', 'Jantar'] },
      maintain: { hours: [8, 13, 19], names: ['Pequeno-almoço', 'Almoço', 'Jantar'] }
    };

    const meals = mealSchedule[goal as keyof typeof mealSchedule] || mealSchedule.maintain;
    const mealIndex = meals.hours.indexOf(currentHour);
    
    if (mealIndex !== -1) {
      notifications.push({
        id: `meal-${currentHour}`,
        type: "meal",
        title: `Hora do ${meals.names[mealIndex]}! 🍽️`,
        message: goal === 'gain'
          ? "Não saltes esta refeição! Proteína + carboidratos para crescer forte."
          : goal === 'lose'
          ? "Come com calma e mastiga bem. Proteína e vegetais primeiro!"
          : "Mantém a tua rotina alimentar equilibrada.",
        icon: <Utensils className="w-5 h-5" />,
        color: "text-green-500",
        bgColor: "bg-green-500/10"
      });
    }

    // Alertas sobre refrigerantes e sobremesas (hora do almoço e jantar)
    if ([13, 19].includes(currentHour) && goal === 'lose') {
      notifications.push({
        id: `avoid-sweets-${currentHour}`,
        type: "warning",
        title: "Atenção às tentações! ⚠️",
        message: "Evita refrigerantes e sobremesas açucaradas. Prefere água com limão e frutas naturais como sobremesa.",
        icon: <Cookie className="w-5 h-5" />,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10"
      });
    }

    // Lembrete de sono
    if (currentHour === 22) {
      notifications.push({
        id: `sleep-${currentHour}`,
        type: "sleep",
        title: "Hora de descansar! 🌙",
        message: goal === 'gain'
          ? "Os músculos crescem durante o sono. 7-8 horas são essenciais para ganhos!"
          : goal === 'lose'
          ? "Dormir bem regula hormonas da fome. Descansa para emagrecer melhor!"
          : "Sono de qualidade é fundamental para a saúde geral.",
        icon: <Moon className="w-5 h-5" />,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10"
      });
    }

    // Dica matinal motivacional
    if (currentHour === 7 || currentHour === 8) {
      const tips = {
        lose: [
          "Começa o dia com um copo de água morna com limão para acelerar o metabolismo!",
          "Pequeno-almoço rico em proteína reduz a fome durante o dia.",
          "Evita sumos de fruta - come a fruta inteira para mais fibra!"
        ],
        gain: [
          "Não treines em jejum! Come algo proteico antes do treino matinal.",
          "Adiciona aveia ao teu pequeno-almoço para energia prolongada.",
          "Ovos são excelentes para começar o dia com proteína de qualidade!"
        ],
        maintain: [
          "Um pequeno-almoço equilibrado define o tom para o resto do dia!",
          "Varia os alimentos para obter todos os nutrientes necessários.",
          "Começa com gratidão - uma mente saudável ajuda um corpo saudável!"
        ]
      };
      
      const goalTips = tips[goal as keyof typeof tips] || tips.maintain;
      const tipIndex = new Date().getDate() % goalTips.length;
      
      notifications.push({
        id: `morning-tip`,
        type: "tip",
        title: "Dica da Manhã ✨",
        message: goalTips[tipIndex],
        icon: <Sparkles className="w-5 h-5" />,
        color: "text-primary",
        bgColor: "bg-primary/10"
      });
    }

    // Lembrete peso ideal
    if (currentHour === 9 && goal === 'lose') {
      notifications.push({
        id: `weight-reminder`,
        type: "motivation",
        title: firstName ? `${firstName}, mantém o foco! 🎯` : "Mantém o foco! 🎯",
        message: "Cada dia de escolhas saudáveis te aproxima do teu peso ideal. Tu consegues!",
        icon: <Scale className="w-5 h-5" />,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10"
      });
    }

    if (currentHour === 9 && goal === 'gain') {
      notifications.push({
        id: `mass-reminder`,
        type: "motivation",
        title: firstName ? `${firstName}, foco nos ganhos! 💪` : "Foco nos ganhos! 💪",
        message: "Come bem, treina pesado, descansa. A consistência traz resultados!",
        icon: <TrendingUp className="w-5 h-5" />,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10"
      });
    }

    return notifications;
  };

  const checkNotifications = () => {
    try {
      if (!userGoal) return;
      
      const newNotifications = getGoalBasedNotifications(userGoal)
        .filter(n => !dismissed.has(n.id));
      
      setNotifications(newNotifications);
    } catch (error) {
      console.log("SmartNotifications: Error checking notifications:", error);
    }
  };

  const dismissNotification = (id: string) => {
    try {
      setDismissed(prev => new Set([...prev, id]));
      setNotifications(prev => prev ? prev.filter(n => n.id !== id) : []);
    } catch (error) {
      console.log("SmartNotifications: Error dismissing notification:", error);
    }
  };

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 left-4 md:left-auto md:w-96 z-40 space-y-3" role="region" aria-label="Notificações">
      <AnimatePresence>
        {notifications && notifications.slice(0, 2).map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          >
            <Card className="p-4 bg-background/95 backdrop-blur-md border-border shadow-medium">
              <div className="flex items-start gap-3">
                <div className={`${notification.bgColor} p-2.5 rounded-xl`}>
                  <span className={notification.color}>{notification.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm">
                    {notification.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 flex-shrink-0 hover:bg-muted"
                  onClick={() => dismissNotification(notification.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SmartNotifications;
