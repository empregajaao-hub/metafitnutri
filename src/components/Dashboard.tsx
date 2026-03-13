import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Droplets, Utensils, Dumbbell,
  TrendingUp, TrendingDown, Scale,
  Flame, ChevronRight, Plus, Minus,
  Target, Activity, Trash2, Camera
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import CircularProgress from "@/components/CircularProgress";

interface DashboardProps {
  userName: string;
  userGoal: "lose" | "maintain" | "gain" | null;
  weight: number | null;
}

const WATER_OPTIONS = [150, 200, 250, 300, 500];

const Dashboard = ({ userName, userGoal, weight }: DashboardProps) => {
  const navigate = useNavigate();
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const [todayCalories, setTodayCalories] = useState(0);
  const [todayProtein, setTodayProtein] = useState(0);
  const [todayCarbs, setTodayCarbs] = useState(0);
  const [todayFat, setTodayFat] = useState(0);
  const [waterMl, setWaterMl] = useState(0);
  const [showWaterPicker, setShowWaterPicker] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const calorieGoal = userGoal === "gain" ? 3000 : userGoal === "lose" ? 1800 : 2200;
  const proteinGoal = userGoal === "gain" ? 180 : userGoal === "lose" ? 130 : 150;
  const carbsGoal = userGoal === "gain" ? 350 : userGoal === "lose" ? 180 : 250;
  const fatGoal = userGoal === "gain" ? 90 : userGoal === "lose" ? 50 : 70;
  const waterGoalMl = userGoal === "gain" ? 3000 : userGoal === "lose" ? 2500 : 2000;

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
      .select("id, estimated_calories, protein_g, carbs_g, fat_g, image_url, created_at")
      .eq("user_id", user.id)
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false });

    if (meals) {
      setTodayMeals(meals);
      setTodayCalories(meals.reduce((sum, m) => sum + (m.estimated_calories || 0), 0));
      setTodayProtein(meals.reduce((sum, m) => sum + (m.protein_g || 0), 0));
      setTodayCarbs(meals.reduce((sum, m) => sum + (m.carbs_g || 0), 0));
      setTodayFat(meals.reduce((sum, m) => sum + (m.fat_g || 0), 0));
    }
  };

  const handleDeleteMeal = async (id: string) => {
    const { error } = await supabase.from("meal_analyses").delete().eq("id", id);
    if (!error) {
      const updated = todayMeals.filter(m => m.id !== id);
      setTodayMeals(updated);
      setTodayCalories(updated.reduce((s, m) => s + (m.estimated_calories || 0), 0));
      setTodayProtein(updated.reduce((s, m) => s + (m.protein_g || 0), 0));
      setTodayCarbs(updated.reduce((s, m) => s + (m.carbs_g || 0), 0));
      setTodayFat(updated.reduce((s, m) => s + (m.fat_g || 0), 0));
    }
  };

  const addWater = (ml: number) => {
    setWaterMl(prev => Math.min(prev + ml, waterGoalMl + 1000));
    setShowWaterPicker(false);
  };

  const removeWater = () => {
    setWaterMl(prev => Math.max(prev - 250, 0));
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getGoalConfig = () => {
    if (userGoal === "lose") return { icon: TrendingDown, text: "Perder peso", color: "text-primary" };
    if (userGoal === "gain") return { icon: TrendingUp, text: "Ganhar massa", color: "text-primary" };
    return { icon: Scale, text: "Manter peso", color: "text-primary" };
  };

  const goalConfig = getGoalConfig();
  const GoalIcon = goalConfig.icon;
  const caloriesLeft = Math.max(calorieGoal - todayCalories, 0);
  const caloriePercent = Math.min((todayCalories / calorieGoal) * 100, 100);
  const waterPercent = Math.min((waterMl / waterGoalMl) * 100, 100);

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pb-2 scrollbar-hide">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">{getGreeting()}</p>
          <h1 className="text-lg font-bold text-foreground leading-tight">
            {userName?.split(' ')[0] || 'Utilizador'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/8 border border-primary/15 rounded-full">
            <GoalIcon className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-semibold text-primary">{goalConfig.text}</span>
          </div>
          {weight && (
            <div className="px-2 py-1 bg-muted/50 rounded-full">
              <span className="text-[10px] text-muted-foreground font-semibold">{weight}kg</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Calorie Ring + Macros */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="p-4 border-border/40 shadow-sm">
          <div className="flex items-center justify-center gap-5">
            <div className="relative flex flex-col items-center">
              <CircularProgress
                value={todayCalories}
                max={calorieGoal}
                size={100}
                strokeWidth={8}
                color="hsl(var(--primary))"
                unit="kcal"
              />
              <div className="mt-1 flex items-center gap-1">
                <Target className="w-2.5 h-2.5 text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground font-medium">
                  {caloriesLeft} restam
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                { label: "Proteína", value: todayProtein, goal: proteinGoal, color: "hsl(142, 71%, 45%)" },
                { label: "Carbos", value: todayCarbs, goal: carbsGoal, color: "hsl(205, 100%, 50%)" },
                { label: "Gordura", value: todayFat, goal: fatGoal, color: "hsl(45, 93%, 47%)" },
              ].map((macro) => (
                <div key={macro.label} className="flex items-center gap-2.5">
                  <CircularProgress
                    value={macro.value}
                    max={macro.goal}
                    size={34}
                    strokeWidth={3.5}
                    color={macro.color}
                    showValue={false}
                  />
                  <div>
                    <p className="text-[9px] text-muted-foreground leading-none">{macro.label}</p>
                    <p className="text-[11px] font-bold text-foreground leading-tight">
                      {macro.value}g <span className="font-normal text-muted-foreground">/{macro.goal}g</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Water + Today Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-2.5"
      >
        {/* Water Card */}
        <Card className="p-3 border-border/40 shadow-sm relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <Droplets className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-[10px] font-semibold text-foreground">Água</span>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={removeWater}
                className="w-5 h-5 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Minus className="w-2.5 h-2.5 text-muted-foreground" />
              </button>
              <button
                onClick={() => setShowWaterPicker(!showWaterPicker)}
                className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center hover:bg-primary/25 transition-colors"
              >
                <Plus className="w-2.5 h-2.5 text-primary" />
              </button>
            </div>
          </div>
          <p className="text-sm font-bold text-foreground">{waterMl}ml</p>
          <p className="text-[9px] text-muted-foreground">Meta: {waterGoalMl}ml</p>
          <div className="mt-1.5 h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${waterPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <AnimatePresence>
            {showWaterPicker && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 right-0 mt-1 z-10 bg-card border border-border rounded-xl p-2 shadow-lg"
              >
                <p className="text-[9px] text-muted-foreground mb-1.5 px-1">Adicionar (ml)</p>
                <div className="grid grid-cols-3 gap-1">
                  {WATER_OPTIONS.map(ml => (
                    <button
                      key={ml}
                      onClick={() => addWater(ml)}
                      className="text-[10px] font-semibold py-1.5 rounded-lg bg-primary/8 text-primary hover:bg-primary/15 transition-colors"
                    >
                      {ml}ml
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Calorie Summary Card */}
        <Card className="p-3 border-border/40 shadow-sm">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-6 h-6 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-destructive" />
            </div>
            <span className="text-[10px] font-semibold text-foreground">Consumo</span>
          </div>
          <p className="text-sm font-bold text-foreground">{todayCalories} kcal</p>
          <p className="text-[9px] text-muted-foreground">Meta: {calorieGoal} kcal</p>
          <div className="mt-1.5 h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                backgroundColor: caloriePercent > 100 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(caloriePercent, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </Card>
      </motion.div>

      {/* Today's Meals */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Refeições de Hoje</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-primary hover:text-primary"
            onClick={() => navigate('/upload')}
          >
            <Camera className="w-3 h-3 mr-1" />
            Adicionar
          </Button>
        </div>

        {todayMeals.length === 0 ? (
          <Card
            className="p-4 border-dashed border-border/50 cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => navigate('/upload')}
          >
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center">
                <Camera className="w-4 h-4 text-primary" />
              </div>
              <p className="text-[11px] text-muted-foreground">Tira foto da tua refeição</p>
            </div>
          </Card>
        ) : (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {todayMeals.map((meal) => (
              <Card key={meal.id} className="p-2 border-border/40 shadow-sm shrink-0 w-[130px]">
                {meal.image_url && (
                  <div className="w-full h-16 rounded-lg overflow-hidden mb-1.5 bg-muted/30">
                    <img
                      src={meal.image_url}
                      alt="Refeição"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-foreground">{meal.estimated_calories} kcal</p>
                    <p className="text-[8px] text-muted-foreground">
                      P:{meal.protein_g}g · C:{meal.carbs_g}g · G:{meal.fat_g}g
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteMeal(meal.id); }}
                    className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 className="w-2.5 h-2.5 text-destructive" />
                  </button>
                </div>
                <p className="text-[8px] text-muted-foreground mt-0.5">
                  {new Date(meal.created_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-2.5"
      >
        <Card
          className="p-3 cursor-pointer hover:border-primary/30 active:scale-[0.98] transition-all border-border/40 shadow-sm"
          onClick={() => navigate('/meal-plan')}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-foreground">Plano Semanal</p>
              <p className="text-[9px] text-muted-foreground">Receitas IA</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </div>
        </Card>

        <Card
          className="p-3 cursor-pointer hover:border-secondary/30 active:scale-[0.98] transition-all border-border/40 shadow-sm"
          onClick={() => navigate('/workout')}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
              <Dumbbell className="w-4 h-4 text-secondary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-foreground">Treino</p>
              <p className="text-[9px] text-muted-foreground">Plano do dia</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
