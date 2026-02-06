import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Camera, Droplets, Utensils, Moon, Dumbbell, 
  TrendingUp, TrendingDown, Scale, Target, 
  ArrowRight, Flame, Sparkles, ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

interface DashboardProps {
  userName: string;
  userGoal: "lose" | "maintain" | "gain" | null;
  weight: number | null;
}

const Dashboard = ({ userName, userGoal, weight }: DashboardProps) => {
  const navigate = useNavigate();
  const [todayMeals, setTodayMeals] = useState(0);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const waterGoal = userGoal === "gain" ? 12 : userGoal === "lose" ? 10 : 8;
  const mealGoal = userGoal === "gain" ? 6 : userGoal === "lose" ? 4 : 5;

  useEffect(() => {
    loadTodayStats();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadTodayStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: meals } = await supabase
      .from("meal_analyses")
      .select("id")
      .eq("user_id", user.id)
      .gte("created_at", today.toISOString());

    setTodayMeals(meals?.length || 0);
  };

  const addWater = () => {
    if (waterGlasses < waterGoal) {
      setWaterGlasses(prev => prev + 1);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getGoalIcon = () => {
    if (userGoal === "lose") return <TrendingDown className="w-4 h-4" />;
    if (userGoal === "gain") return <TrendingUp className="w-4 h-4" />;
    return <Scale className="w-4 h-4" />;
  };

  const getGoalText = () => {
    if (userGoal === "lose") return "Perder peso";
    if (userGoal === "gain") return "Ganhar massa";
    return "Manter peso";
  };

  const getNextMealTime = () => {
    const hour = currentTime.getHours();
    if (hour < 7) return "07:00 - Pequeno-almoço";
    if (hour < 10) return "10:00 - Lanche";
    if (hour < 13) return "13:00 - Almoço";
    if (hour < 16) return "16:00 - Lanche";
    if (hour < 20) return "20:00 - Jantar";
    return "22:00 - Ceia leve";
  };

  const getMotivationalMessage = () => {
    if (userGoal === "lose") {
      const messages = [
        "Cada escolha saudável te aproxima do objetivo! 💪",
        "Lembra-te: consistência vence intensidade.",
        "O teu corpo agradece cada decisão consciente!"
      ];
      return messages[currentTime.getDate() % messages.length];
    }
    if (userGoal === "gain") {
      const messages = [
        "Alimenta os teus músculos, eles crescem com dedicação! 💪",
        "Proteína + treino = resultados garantidos.",
        "Cada refeição é uma oportunidade de crescer!"
      ];
      return messages[currentTime.getDate() % messages.length];
    }
    return "Equilíbrio é a chave para uma vida saudável! ✨";
  };

  return (
    <div className="space-y-6">
      {/* Header com saudação */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-muted-foreground text-sm">{getGreeting()}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {userName?.split(' ')[0] || 'Utilizador'}
          </h1>
        </div>
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-lg bg-primary/30 scale-125" />
          <img 
            src={logo} 
            alt="METAFIT" 
            className="h-14 w-14 rounded-full relative z-10 border-2 border-primary/50 shadow-glow"
          />
        </div>
      </motion.div>

      {/* Objetivo do utilizador */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                {getGoalIcon()}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">O teu objetivo</p>
                <p className="font-semibold text-foreground">{getGoalText()}</p>
              </div>
            </div>
            {weight && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Peso atual</p>
                <p className="font-bold text-foreground">{weight} kg</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Mensagem motivacional */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-4 bg-muted/30 border-border/50">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80">{getMotivationalMessage()}</p>
          </div>
        </Card>
      </motion.div>

      {/* Grid de progresso do dia */}
      <div className="grid grid-cols-2 gap-4">
        {/* Água */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 space-y-3 h-full">
            <div className="flex items-center justify-between">
              <Droplets className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">{waterGlasses}/{waterGoal}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hidratação</p>
              <p className="font-semibold text-foreground">{waterGlasses * 250}ml</p>
            </div>
            <Progress value={(waterGlasses / waterGoal) * 100} className="h-2" />
            <Button 
              size="sm" 
              variant="outline" 
              onClick={addWater}
              className="w-full text-xs"
              disabled={waterGlasses >= waterGoal}
            >
              + Copo
            </Button>
          </Card>
        </motion.div>

        {/* Refeições */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 space-y-3 h-full">
            <div className="flex items-center justify-between">
              <Utensils className="w-5 h-5 text-secondary" />
              <span className="text-xs text-muted-foreground">{todayMeals}/{mealGoal}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Refeições</p>
              <p className="font-semibold text-foreground">{todayMeals} hoje</p>
            </div>
            <Progress value={(todayMeals / mealGoal) * 100} className="h-2" />
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/upload')}
              className="w-full text-xs"
            >
              + Registar
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* Próxima refeição */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Utensils className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Próxima refeição</p>
                <p className="font-semibold text-foreground">{getNextMealTime()}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>
      </motion.div>

      {/* Ações rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 gap-4"
      >
        <Card 
          className="p-5 cursor-pointer hover:border-primary/50 transition-all group"
          onClick={() => navigate('/upload')}
        >
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Analisar Refeição</p>
              <p className="text-xs text-muted-foreground">Foto → Macros</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-5 cursor-pointer hover:border-primary/50 transition-all group"
          onClick={() => navigate('/workout')}
        >
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Dumbbell className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Ver Treino</p>
              <p className="text-xs text-muted-foreground">Plano do dia</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Dicas do objetivo */}
      {userGoal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-4 bg-gradient-to-br from-accent/5 to-transparent border-accent/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4 text-accent" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">
                  Dica para {userGoal === 'lose' ? 'perder peso' : userGoal === 'gain' ? 'ganhar massa' : 'manter peso'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {userGoal === 'lose' 
                    ? 'Evita refrigerantes e sobremesas açucaradas. Prefere água e frutas naturais.'
                    : userGoal === 'gain'
                    ? 'Adiciona proteína a cada refeição. Snacks como ovos e amendoins ajudam muito.'
                    : 'Mantém rotinas regulares e come de forma equilibrada em cada refeição.'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* CTA para plano semanal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button 
          className="w-full rounded-xl h-14 bg-foreground text-background hover:bg-foreground/90"
          onClick={() => navigate('/meal-plan')}
        >
          <Flame className="w-5 h-5 mr-2" />
          Ver Plano Semanal Completo
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
};

export default Dashboard;
