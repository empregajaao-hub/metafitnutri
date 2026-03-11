import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Droplets, Utensils, Dumbbell,
  TrendingUp, TrendingDown, Scale,
  Flame, ChevronRight, Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import CircularProgress from "@/components/CircularProgress";

interface DashboardProps {
  userName: string;
  userGoal: "lose" | "maintain" | "gain" | null;
  weight: number | null;
}

const Dashboard = ({ userName, userGoal, weight }: DashboardProps) => {
  const navigate = useNavigate();
  const [todayMeals, setTodayMeals] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);
  const [todayProtein, setTodayProtein] = useState(0);
  const [todayCarbs, setTodayCarbs] = useState(0);
  const [todayFat, setTodayFat] = useState(0);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const calorieGoal = userGoal === "gain" ? 3000 : userGoal === "lose" ? 1800 : 2200;
  const proteinGoal = userGoal === "gain" ? 180 : userGoal === "lose" ? 130 : 150;
  const carbsGoal = userGoal === "gain" ? 350 : userGoal === "lose" ? 180 : 250;
  const fatGoal = userGoal === "gain" ? 90 : userGoal === "lose" ? 50 : 70;
  const waterGoal = userGoal === "gain" ? 12 : userGoal === "lose" ? 10 : 8;

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
      .select("id, estimated_calories, protein_g, carbs_g, fat_g")
      .eq("user_id", user.id)
      .gte("created_at", today.toISOString());

    if (meals) {
      setTodayMeals(meals.length);
      setTodayCalories(meals.reduce((sum, m) => sum + (m.estimated_calories || 0), 0));
      setTodayProtein(meals.reduce((sum, m) => sum + (m.protein_g || 0), 0));
      setTodayCarbs(meals.reduce((sum, m) => sum + (m.carbs_g || 0), 0));
      setTodayFat(meals.reduce((sum, m) => sum + (m.fat_g || 0), 0));
    }
  };

  const addWater = () => {
    if (waterGlasses < waterGoal) setWaterGlasses(prev => prev + 1);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getGoalIcon = () => {
    if (userGoal === "lose") return <TrendingDown className="w-3.5 h-3.5" />;
    if (userGoal === "gain") return <TrendingUp className="w-3.5 h-3.5" />;
    return <Scale className="w-3.5 h-3.5" />;
  };

  const getGoalText = () => {
    if (userGoal === "lose") return "Perder peso";
    if (userGoal === "gain") return "Ganhar massa";
    return "Manter peso";
  };

  const caloriesLeft = Math.max(calorieGoal - todayCalories, 0);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-xs text-muted-foreground">{getGreeting()}</p>
          <h1 className="text-xl font-bold text-foreground leading-tight">
            {userName?.split(' ')[0] || 'Utilizador'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full">
            {getGoalIcon()}
            <span className="text-[11px] font-medium text-primary">{getGoalText()}</span>
          </div>
          {weight && (
            <span className="text-xs text-muted-foreground font-medium">{weight}kg</span>
          )}
        </div>
      </motion.div>

      {/* Central Calorie Ring + Macros */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4">
          <div className="flex items-center justify-center gap-6">
            {/* Main calorie ring */}
            <div className="relative">
              <CircularProgress
                value={todayCalories}
                max={calorieGoal}
                size={110}
                strokeWidth={10}
                color="hsl(var(--primary))"
                unit="kcal"
              />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                <span className="text-[9px] text-muted-foreground bg-background px-1.5 py-0.5 rounded-full border border-border">
                  {caloriesLeft} restam
                </span>
              </div>
            </div>

            {/* Macro breakdown */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <CircularProgress
                  value={todayProtein}
                  max={proteinGoal}
                  size={40}
                  strokeWidth={4}
                  color="hsl(205 100% 50%)"
                  showValue={false}
                />
                <div>
                  <p className="text-[10px] text-muted-foreground">Proteína</p>
                  <p className="text-xs font-bold text-foreground">{todayProtein}g <span className="font-normal text-muted-foreground">/{proteinGoal}g</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CircularProgress
                  value={todayCarbs}
                  max={carbsGoal}
                  size={40}
                  strokeWidth={4}
                  color="hsl(200 95% 55%)"
                  showValue={false}
                />
                <div>
                  <p className="text-[10px] text-muted-foreground">Carbos</p>
                  <p className="text-xs font-bold text-foreground">{todayCarbs}g <span className="font-normal text-muted-foreground">/{carbsGoal}g</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CircularProgress
                  value={todayFat}
                  max={fatGoal}
                  size={40}
                  strokeWidth={4}
                  color="hsl(215 80% 35%)"
                  showValue={false}
                />
                <div>
                  <p className="text-[10px] text-muted-foreground">Gordura</p>
                  <p className="text-xs font-bold text-foreground">{todayFat}g <span className="font-normal text-muted-foreground">/{fatGoal}g</span></p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick stats row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3"
      >
        {/* Water */}
        <Card className="p-3 text-center cursor-pointer active:scale-95 transition-transform" onClick={addWater}>
          <Droplets className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-sm font-bold text-foreground">{waterGlasses}/{waterGoal}</p>
          <p className="text-[10px] text-muted-foreground">Água</p>
          <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(waterGlasses / waterGoal) * 100}%` }}
            />
          </div>
        </Card>

        {/* Meals */}
        <Card className="p-3 text-center">
          <Utensils className="w-5 h-5 text-secondary mx-auto mb-1" />
          <p className="text-sm font-bold text-foreground">{todayMeals}</p>
          <p className="text-[10px] text-muted-foreground">Refeições</p>
          <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-300"
              style={{ width: `${Math.min((todayMeals / 5) * 100, 100)}%` }}
            />
          </div>
        </Card>

        {/* Calories burned estimate */}
        <Card className="p-3 text-center">
          <Flame className="w-5 h-5 text-destructive mx-auto mb-1" />
          <p className="text-sm font-bold text-foreground">{todayCalories}</p>
          <p className="text-[10px] text-muted-foreground">kcal hoje</p>
          <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-destructive rounded-full transition-all duration-300"
              style={{ width: `${Math.min((todayCalories / calorieGoal) * 100, 100)}%` }}
            />
          </div>
        </Card>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-3"
      >
        <Card
          className="p-3 cursor-pointer hover:border-primary/50 active:scale-[0.97] transition-all"
          onClick={() => navigate('/meal-plan')}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">Plano Semanal</p>
              <p className="text-[10px] text-muted-foreground">Receitas IA</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 ml-auto" />
          </div>
        </Card>

        <Card
          className="p-3 cursor-pointer hover:border-secondary/50 active:scale-[0.97] transition-all"
          onClick={() => navigate('/workout')}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
              <Dumbbell className="w-4 h-4 text-secondary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">Treino</p>
              <p className="text-[10px] text-muted-foreground">Plano do dia</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 ml-auto" />
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
