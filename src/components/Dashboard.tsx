import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Droplets, Utensils, Dumbbell,
  TrendingUp, TrendingDown, Scale,
  Flame, ChevronRight, Plus, Minus,
  Trash2, Camera, GlassWater, Zap
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
      setTodayCalories(meals.reduce((s, m) => s + (m.estimated_calories || 0), 0));
      setTodayProtein(meals.reduce((s, m) => s + (m.protein_g || 0), 0));
      setTodayCarbs(meals.reduce((s, m) => s + (m.carbs_g || 0), 0));
      setTodayFat(meals.reduce((s, m) => s + (m.fat_g || 0), 0));
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

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getGoalConfig = () => {
    if (userGoal === "lose") return { icon: TrendingDown, text: "Perder peso" };
    if (userGoal === "gain") return { icon: TrendingUp, text: "Ganhar massa" };
    return { icon: Scale, text: "Manter peso" };
  };

  const goalConfig = getGoalConfig();
  const GoalIcon = goalConfig.icon;
  const caloriesLeft = Math.max(calorieGoal - todayCalories, 0);
  const waterPercent = Math.min((waterMl / waterGoalMl) * 100, 100);

  const macros = [
    { label: "Proteína", value: todayProtein, goal: proteinGoal, color: "hsl(142, 71%, 45%)", id: "prot" },
    { label: "Carbos", value: todayCarbs, goal: carbsGoal, color: "hsl(205, 100%, 50%)", id: "carbs" },
    { label: "Gordura", value: todayFat, goal: fatGoal, color: "hsl(45, 93%, 47%)", id: "fat" },
  ];

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pb-2 scrollbar-hide">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between pt-1"
      >
        <div>
          <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">
            {getGreeting()}
          </p>
          <h1 className="text-xl font-extrabold text-foreground leading-tight tracking-tight">
            {userName?.split(' ')[0] || 'Utilizador'}
          </h1>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/15 rounded-full backdrop-blur-sm">
            <GoalIcon className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-primary">{goalConfig.text}</span>
          </div>
          {weight && (
            <div className="px-2.5 py-1.5 bg-card border border-border/50 rounded-full shadow-sm">
              <span className="text-[10px] text-foreground font-bold">{weight}<span className="text-muted-foreground font-normal">kg</span></span>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Main Nutrition Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="p-5 border-border/30 shadow-md bg-gradient-to-br from-card to-card/80 backdrop-blur-sm relative overflow-hidden">
          {/* Subtle decorative element */}
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/[0.03]" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-accent/[0.03]" />
          
          <div className="flex items-center justify-center gap-6 relative z-10">
            {/* Main calorie ring */}
            <div className="flex flex-col items-center">
              <CircularProgress
                value={todayCalories}
                max={calorieGoal}
                size={110}
                strokeWidth={9}
                color="hsl(var(--primary))"
                gradient
                gradientId="cal-grad"
                unit="kcal"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-2 flex items-center gap-1 px-2.5 py-0.5 bg-muted/40 rounded-full"
              >
                <Zap className="w-2.5 h-2.5 text-primary" />
                <span className="text-[9px] font-semibold text-muted-foreground">
                  {caloriesLeft} restam
                </span>
              </motion.div>
            </div>

            {/* Macro breakdown */}
            <div className="flex flex-col gap-3">
              {macros.map((macro, i) => (
                <motion.div
                  key={macro.id}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <CircularProgress
                    value={macro.value}
                    max={macro.goal}
                    size={38}
                    strokeWidth={4}
                    color={macro.color}
                    showValue={false}
                  />
                  <div>
                    <p className="text-[9px] text-muted-foreground font-medium leading-none mb-0.5">
                      {macro.label}
                    </p>
                    <p className="text-xs font-bold text-foreground leading-none">
                      {macro.value}g
                      <span className="text-[10px] font-normal text-muted-foreground"> /{macro.goal}g</span>
                    </p>
                    {/* Mini bar */}
                    <div className="mt-1 w-16 h-[3px] bg-muted/40 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: macro.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((macro.value / macro.goal) * 100, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Water + Calories Row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="grid grid-cols-2 gap-2.5"
      >
        {/* Water Card */}
        <Card className="p-3 border-border/30 shadow-sm relative overflow-visible group">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                <Droplets className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-foreground block leading-none">Água</span>
                <span className="text-[8px] text-muted-foreground">{waterMl}/{waterGoalMl}ml</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setWaterMl(prev => Math.max(prev - 250, 0))}
                className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Minus className="w-3 h-3 text-muted-foreground" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setShowWaterPicker(!showWaterPicker)}
                className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm"
              >
                <Plus className="w-3 h-3" />
              </motion.button>
            </div>
          </div>

          {/* Water wave bar */}
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary/80 to-accent/80"
              initial={{ width: 0 }}
              animate={{ width: `${waterPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          <AnimatePresence>
            {showWaterPicker && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-2 z-20 bg-card border border-border/50 rounded-2xl p-3 shadow-xl"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <GlassWater className="w-3 h-3 text-primary" />
                  <p className="text-[10px] font-semibold text-foreground">Adicionar água</p>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {WATER_OPTIONS.map(ml => (
                    <motion.button
                      key={ml}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => addWater(ml)}
                      className="text-[10px] font-bold py-2 rounded-xl bg-primary/8 text-primary hover:bg-primary/15 transition-all border border-primary/10"
                    >
                      {ml}ml
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Calories Summary Card */}
        <Card className="p-3 border-border/30 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-destructive/15 to-destructive/5 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-destructive" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-foreground block leading-none">Consumo</span>
                <span className="text-[8px] text-muted-foreground">{todayCalories}/{calorieGoal} kcal</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-foreground">{todayMeals.length}</span>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: todayCalories > calorieGoal
                  ? 'linear-gradient(90deg, hsl(var(--destructive)), hsl(0, 84%, 50%))'
                  : 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((todayCalories / calorieGoal) * 100, 100)}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </Card>
      </motion.div>

      {/* Today's Meals */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-foreground">Refeições de Hoje</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2.5 text-[10px] font-semibold text-primary hover:text-primary rounded-full hover:bg-primary/8"
            onClick={() => navigate('/upload')}
          >
            <Plus className="w-3 h-3 mr-1" />
            Adicionar
          </Button>
        </div>

        {todayMeals.length === 0 ? (
          <motion.div whileTap={{ scale: 0.98 }}>
            <Card
              className="p-5 border-dashed border-2 border-primary/15 cursor-pointer hover:border-primary/30 hover:bg-primary/[0.02] transition-all rounded-2xl"
              onClick={() => navigate('/upload')}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-foreground">Tira foto da tua refeição</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Análise nutricional instantânea com IA</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
            {todayMeals.map((meal, i) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="shrink-0"
              >
                <Card className="w-[128px] border-border/30 shadow-sm overflow-hidden group">
                  {/* Image */}
                  <div className="relative w-full h-[70px] bg-muted/20">
                    {meal.image_url ? (
                      <img src={meal.image_url} alt="Refeição" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Utensils className="w-5 h-5 text-muted-foreground/30" />
                      </div>
                    )}
                    {/* Delete overlay */}
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={(e) => { e.stopPropagation(); handleDeleteMeal(meal.id); }}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-2.5 h-2.5 text-destructive" />
                    </motion.button>
                    {/* Time badge */}
                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-background/80 backdrop-blur-sm rounded-md">
                      <p className="text-[7px] font-medium text-foreground">
                        {new Date(meal.created_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-2">
                    <p className="text-[11px] font-extrabold text-foreground leading-none">{meal.estimated_calories} <span className="text-[9px] font-normal text-muted-foreground">kcal</span></p>
                    <div className="flex gap-1.5 mt-1">
                      <span className="text-[7px] font-semibold px-1 py-0.5 rounded" style={{ color: 'hsl(142, 71%, 45%)', background: 'hsl(142, 71%, 45%, 0.08)' }}>P:{meal.protein_g}g</span>
                      <span className="text-[7px] font-semibold px-1 py-0.5 rounded text-primary bg-primary/8">C:{meal.carbs_g}g</span>
                      <span className="text-[7px] font-semibold px-1 py-0.5 rounded" style={{ color: 'hsl(45, 93%, 47%)', background: 'hsl(45, 93%, 47%, 0.08)' }}>G:{meal.fat_g}g</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            {/* Add more card */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="shrink-0"
            >
              <Card
                className="w-[128px] h-full min-h-[106px] border-dashed border-border/40 flex items-center justify-center cursor-pointer hover:border-primary/30 transition-all"
                onClick={() => navigate('/upload')}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[8px] text-muted-foreground">Adicionar</span>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="grid grid-cols-2 gap-2.5"
      >
        {[
          {
            title: "Plano Semanal",
            subtitle: "Receitas IA",
            icon: Utensils,
            route: "/meal-plan",
            gradient: "from-primary/12 to-accent/8",
            iconColor: "text-primary",
          },
          {
            title: "Treino",
            subtitle: "Plano do dia",
            icon: Dumbbell,
            route: "/workout",
            gradient: "from-secondary/12 to-secondary/5",
            iconColor: "text-secondary",
          },
        ].map((action) => (
          <motion.div key={action.route} whileTap={{ scale: 0.97 }}>
            <Card
              className="p-3 cursor-pointer hover:shadow-md transition-all border-border/30 shadow-sm"
              onClick={() => navigate(action.route)}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shrink-0`}>
                  <action.icon className={`w-4 h-4 ${action.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-foreground">{action.title}</p>
                  <p className="text-[9px] text-muted-foreground">{action.subtitle}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Dashboard;
