import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Droplets, Utensils, Dumbbell, Moon, Flame, TrendingUp, Scale, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  icon: React.ReactNode;
  color: string;
}

const SmartNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userGoal, setUserGoal] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUserData();
    
    // Check for notifications every 5 minutes
    const interval = setInterval(checkNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (userGoal && preferences) {
      checkNotifications();
    }
  }, [userGoal, preferences]);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("goal")
      .eq("id", user.id)
      .maybeSingle();

    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile?.goal) setUserGoal(profile.goal);
    if (prefs) setPreferences(prefs);
  };

  const getGoalBasedNotifications = (goal: string, prefs: any): Notification[] => {
    const currentHour = new Date().getHours();
    const notifications: Notification[] = [];

    // Water reminders based on goal
    if (prefs?.water_reminders) {
      const waterTimes = goal === 'gain' 
        ? [7, 10, 13, 16, 19, 21] 
        : goal === 'lose' 
        ? [8, 11, 14, 17, 20]
        : [8, 12, 16, 20];
      
      if (waterTimes.includes(currentHour)) {
        notifications.push({
          id: `water-${currentHour}`,
          type: "water",
          title: "Hora de Hidratar! 💧",
          message: goal === 'gain' 
            ? "Água é essencial para o ganho de massa muscular. Bebe pelo menos 250ml agora!"
            : goal === 'lose'
            ? "Manter-te hidratado acelera o metabolismo e ajuda na perda de peso!"
            : "Manter a hidratação equilibrada é fundamental para a tua saúde.",
          icon: <Droplets className="w-5 h-5" />,
          color: "text-blue-500"
        });
      }
    }

    // Meal reminders based on goal
    if (prefs?.meal_reminders) {
      const mealTimes = goal === 'gain'
        ? [7, 10, 13, 16, 19, 21]
        : goal === 'lose'
        ? [8, 12, 16, 19]
        : [8, 13, 20];

      if (mealTimes.includes(currentHour)) {
        notifications.push({
          id: `meal-${currentHour}`,
          type: "meal",
          title: goal === 'gain' ? "Hora de Comer! 🍽️" : "Refeição Equilibrada! 🥗",
          message: goal === 'gain'
            ? "Refeições frequentes são cruciais para ganhar massa. Não saltes esta refeição!"
            : goal === 'lose'
            ? "Uma refeição equilibrada agora evita compulsões mais tarde. Come com consciência!"
            : "Mantém a tua rotina alimentar equilibrada para um estilo de vida saudável.",
          icon: <Utensils className="w-5 h-5" />,
          color: "text-green-500"
        });
      }
    }

    // Workout reminders
    if (prefs?.workout_reminders) {
      const workoutHours = goal === 'gain' ? [17, 18] : [7, 17, 18];
      if (workoutHours.includes(currentHour)) {
        notifications.push({
          id: `workout-${currentHour}`,
          type: "workout",
          title: goal === 'gain' ? "Hora do Treino! 💪" : "Momento de Mexer! 🏃",
          message: goal === 'gain'
            ? "Os músculos crescem com consistência. Vamos treinar pesado hoje!"
            : goal === 'lose'
            ? "30 minutos de exercício podem fazer toda a diferença. Vamos lá!"
            : "Manter o corpo ativo é essencial. Que tal um treino agora?",
          icon: <Dumbbell className="w-5 h-5" />,
          color: "text-orange-500"
        });
      }
    }

    // Goal-specific tips
    if (goal === 'lose' && prefs?.weight_loss_tips && currentHour === 9) {
      notifications.push({
        id: `tip-lose-${currentHour}`,
        type: "tip",
        title: "Dica de Emagrecimento 🔥",
        message: [
          "Mastigar devagar ajuda na saciedade. Dá tempo ao teu cérebro!",
          "Trocar refrigerantes por água com limão pode poupar centenas de calorias.",
          "Proteína no pequeno-almoço reduz a fome durante o dia.",
          "Dormir bem regula as hormonas da fome. Prioriza o descanso!"
        ][Math.floor(Math.random() * 4)],
        icon: <Flame className="w-5 h-5" />,
        color: "text-red-500"
      });
    }

    if (goal === 'gain' && prefs?.muscle_gain_tips && currentHour === 9) {
      notifications.push({
        id: `tip-gain-${currentHour}`,
        type: "tip",
        title: "Dica de Ganho de Massa 💪",
        message: [
          "Come proteína em cada refeição. 1.6-2.2g por kg de peso corporal é ideal.",
          "O sono é quando os músculos crescem. Dorme pelo menos 7-8 horas!",
          "Aumenta gradualmente a carga dos exercícios para progressão contínua.",
          "Snacks ricos em proteína entre refeições aceleram os ganhos."
        ][Math.floor(Math.random() * 4)],
        icon: <TrendingUp className="w-5 h-5" />,
        color: "text-emerald-500"
      });
    }

    // Motivational messages
    if (prefs?.motivation && currentHour === 8) {
      const motivations = goal === 'gain'
        ? [
            "Cada repetição conta! Hoje é dia de ficar mais forte! 💪",
            "Os resultados vêm com consistência. Continue a trabalhar!"
          ]
        : goal === 'lose'
        ? [
            "Cada escolha saudável te aproxima do teu objetivo! 🌟",
            "Tu és mais forte do que pensas. Hoje é o teu dia!"
          ]
        : [
            "Equilíbrio é a chave. Continua no bom caminho! ✨",
            "Pequenos hábitos diários fazem grandes diferenças!"
          ];

      notifications.push({
        id: `motivation-${currentHour}`,
        type: "motivation",
        title: "Motivação do Dia! ✨",
        message: motivations[Math.floor(Math.random() * motivations.length)],
        icon: <Bell className="w-5 h-5" />,
        color: "text-purple-500"
      });
    }

    return notifications;
  };

  const checkNotifications = () => {
    if (!userGoal || !preferences) return;
    
    const newNotifications = getGoalBasedNotifications(userGoal, preferences)
      .filter(n => !dismissed.has(n.id));
    
    setNotifications(newNotifications);
  };

  const dismissNotification = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 left-4 md:left-auto md:w-80 z-40 space-y-2">
      <AnimatePresence>
        {notifications.slice(0, 2).map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-4 bg-background/95 backdrop-blur-sm border-border shadow-lg">
              <div className="flex items-start gap-3">
                <div className={`${notification.color} p-2 bg-muted rounded-full`}>
                  {notification.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm">
                    {notification.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 flex-shrink-0"
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
