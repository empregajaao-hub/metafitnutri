import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Droplets, Utensils, Dumbbell,
  TrendingUp, TrendingDown, Scale,
  Flame, Plus, Minus,
  Trash2, Camera, ChevronRight, Zap, Target
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import GoalCelebration from "./GoalCelebration";
import { cn } from "@/lib/utils";

interface DashboardProps {
  userName: string;
  userGoal: "lose" | "maintain" | "gain" | null;
  weight: number | null;
  height?: number | null;
  age?: number | null;
  activityLevel?: string | null;
  gender?: string | null;
}

const WATER_OPTIONS = [150, 200, 250, 350, 500];

const Dashboard = ({ userName, userGoal, weight, height, age, activityLevel, gender }: DashboardProps) => {
  const navigate = useNavigate();
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const [todayCalories, setTodayCalories] = useState(0);
  const [todayProtein, setTodayProtein] = useState(0);
  const [todayCarbs, setTodayCarbs] = useState(0);
  const [todayFat, setTodayFat] = useState(0);
  const [showWaterPicker, setShowWaterPicker] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCelebration, setShowCelebration] = useState(false);
  const [goalJustCompleted, setGoalJustCompleted] = useState(false);

  // Persist water in Supabase daily_tracking
  const todayKey = new Date().toISOString().slice(0, 10);
  const [waterMl, setWaterMl] = useState(0);
  const [trackingLoaded, setTrackingLoaded] = useState(false);

  // Load water from Supabase on mount
  useEffect(() => {
    const loadWater = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("daily_tracking")
        .select("water_ml")
        .eq("user_id", user.id)
        .eq("tracking_date", todayKey)
        .maybeSingle();
      if (data) setWaterMl(data.water_ml);
      setTrackingLoaded(true);
    };
    loadWater();
  }, [todayKey]);

  // Save water to Supabase whenever it changes
  useEffect(() => {
    if (!trackingLoaded) return;
    const saveWater = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("daily_tracking").upsert({
        user_id: user.id,
        tracking_date: todayKey,
        water_ml: waterMl,
        calories_consumed: todayCalories,
        calories_goal: calorieGoal,
      }, { onConflict: "user_id,tracking_date" });
    };
    saveWater();
  }, [waterMl, trackingLoaded]);

  // Professional Mifflin-St Jeor BMR + TDEE calculation
  const calculateGoals = () => {
    const w = weight || 70;
    const h = height || 170;
    const a = age || 30;
    
    const genderOffset = gender === "feminino" ? -161 : 5;
    const bmr = 10 * w + 6.25 * h - 5 * a + genderOffset;
    
    const activityMultipliers: Record<string, number> = {
      "Sedentário": 1.2,
      "Levemente Ativo": 1.375,
      "Moderadamente Ativo": 1.55,
      "Muito Ativo": 1.725,
      "Extremamente Ativo": 1.9,
    };
    const multiplier = activityMultipliers[activityLevel || ""] || 1.4;
    const tdee = Math.round(bmr * multiplier);
    
    const loseCal = Math.max(Math.round(tdee * 0.80), 1200);
    const gainCal = Math.round(tdee * 1.15);
    
    if (userGoal === "lose") {
      const prot = Math.round(w * 2.0);
      const fat = Math.round(w * 0.8);
      const carbsCal = loseCal - (prot * 4) - (fat * 9);
      return { cal: loseCal, prot, carbs: Math.max(Math.round(carbsCal / 4), 50), fat, water: Math.round(w * 35) };
    }
    if (userGoal === "gain") {
      const prot = Math.round(w * 1.8);
      const fat = Math.round(w * 1.0);
      const carbsCal = gainCal - (prot * 4) - (fat * 9);
      return { cal: gainCal, prot, carbs: Math.round(carbsCal / 4), fat, water: Math.round(w * 40) };
    }
    const prot = Math.round(w * 1.6);
    const fat = Math.round(w * 0.9);
    const carbsCal = tdee - (prot * 4) - (fat * 9);
    return { cal: tdee, prot, carbs: Math.round(carbsCal / 4), fat, water: Math.round(w * 35) };
  };

  const goals = calculateGoals();
  const calorieGoal = goals.cal;
  const proteinGoal = goals.prot;
  const carbsGoal = goals.carbs;
  const fatGoal = goals.fat;
  const waterGoalMl = goals.water;

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
      const totalCal = meals.reduce((s, m) => s + (m.estimated_calories || 0), 0);
      setTodayCalories(totalCal);
      setTodayProtein(meals.reduce((s, m) => s + (m.protein_g || 0), 0));
      setTodayCarbs(meals.reduce((s, m) => s + (m.carbs_g || 0), 0));
      setTodayFat(meals.reduce((s, m) => s + (m.fat_g || 0), 0));
      
      const celebrated = sessionStorage.getItem(`goal_celebrated_${today.toDateString()}`);
      if (totalCal >= goals.cal && !celebrated) {
        setShowCelebration(true);
        setGoalJustCompleted(true);
        sessionStorage.setItem(`goal_celebrated_${today.toDateString()}`, 'true');
      }
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

  const getGoalLabel = () => {
    if (userGoal === "lose") return "Perder";
    if (userGoal === "gain") return "Ganhar";
    return "Manter";
  };

  const GoalIcon = userGoal === "lose" ? TrendingDown : userGoal === "gain" ? TrendingUp : Scale;
  const caloriesLeft = Math.max(calorieGoal - todayCalories, 0);
  const calPercent = Math.min((todayCalories / calorieGoal) * 100, 100);
  const waterPercent = Math.min((waterMl / waterGoalMl) * 100, 100);

  const macros = [
    { label: "Proteína", value: todayProtein, goal: proteinGoal, color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: <Flame className="w-3 h-3" /> },
    { label: "Carbos", value: todayCarbs, goal: carbsGoal, color: "hsl(205,100%,50%)", bg: "hsla(205,100%,50%,0.12)", icon: <Zap className="w-3 h-3" /> },
    { label: "Gordura", value: todayFat, goal: fatGoal, color: "#eab308", bg: "rgba(234,179,8,0.12)", icon: <Target className="w-3 h-3" /> },
  ];

  const Ring = ({ percent, size, stroke, color, children }: { percent: number; size: number; stroke: number; color: string; children?: React.ReactNode }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (Math.min(percent, 100) / 100) * circ;
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-muted/20" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full gap-4 py-2">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-[11px] text-primary font-bold uppercase tracking-wider">{getGreeting()}</p>
          <h1 className="text-xl font-black text-white">{userName?.split(' ')[0] || 'User'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <GoalIcon className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase">{getGoalLabel()}</span>
          </div>
        </div>
      </motion.div>

      <Card variant="glass" className="p-4 relative overflow-hidden border-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16" />
        
        <div className="relative z-10 flex items-center gap-6">
          <Ring percent={calPercent} size={120} stroke={10} color="hsl(205,100%,50%)">
            <span className="text-2xl font-black text-white leading-none">{caloriesLeft}</span>
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-tighter">kcal restam</span>
          </Ring>

          <div className="flex-1 space-y-3">
            {macros.map((m, i) => {
              const pct = Math.min((m.value / m.goal) * 100, 100);
              return (
                <div key={m.label} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-white/70 uppercase">{m.label}</span>
                    <span className="text-white">{m.value}g <span className="text-white/40">/ {m.goal}g</span></span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card variant="glass" className="p-3 flex flex-col gap-2 border-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Droplets className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-[11px] font-bold text-white">Água</span>
            </div>
            <span className="text-[10px] font-bold text-white/50">{waterMl}ml</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${waterPercent}%` }}
              className="h-full bg-blue-500 rounded-full"
            />
          </div>
          <div className="flex gap-1">
            <Button 
              variant="glass" 
              size="sm" 
              className="flex-1 h-8 text-[10px] font-bold"
              onClick={() => setWaterMl(prev => Math.max(0, prev - 250))}
            >
              -250ml
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1 h-8 text-[10px] font-bold"
              onClick={() => addWater(250)}
            >
              +250ml
            </Button>
          </div>
        </Card>

        <div className="grid grid-rows-2 gap-2">
          <Button
            variant="glass"
            className="justify-start gap-3 h-full border-none"
            onClick={() => navigate('/meal-plan')}
          >
            <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Utensils className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-white leading-none">Plano de</p>
              <p className="text-[8px] text-white/40 uppercase font-black">Alimentação</p>
            </div>
          </Button>
          <Button
            variant="glass"
            className="justify-start gap-3 h-full border-none"
            onClick={() => navigate('/workout')}
          >
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-white leading-none">Plano de</p>
              <p className="text-[8px] text-white/40 uppercase font-black">Treino</p>
            </div>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-black text-white/50 uppercase tracking-widest">Refeições de Hoje</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-[10px] font-bold text-primary"
            onClick={() => navigate('/upload')}
          >
            Ver Histórico <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {todayMeals.length === 0 ? (
          <Button
            variant="glass"
            className="flex-1 flex-col gap-3 border-dashed border-2 border-white/10 hover:border-primary/50 transition-all group"
            onClick={() => navigate('/upload')}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-white">Regista a tua refeição</p>
              <p className="text-[10px] text-white/40">Análise instantânea com IA</p>
            </div>
          </Button>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {todayMeals.map((meal, i) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="shrink-0 w-32 group relative"
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-white/5 relative">
                  {meal.image_url ? (
                    <img src={meal.image_url} alt="Meal" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-white/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2">
                    <p className="text-[10px] font-black text-white leading-none">{meal.estimated_calories} kcal</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteMeal(meal.id); }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
            <Button
              variant="glass"
              className="shrink-0 w-32 aspect-square rounded-2xl border-dashed border-2 border-white/10"
              onClick={() => navigate('/upload')}
            >
              <Plus className="w-6 h-6 text-white/20" />
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCelebration && (
          <GoalCelebration
            onClose={() => setShowCelebration(false)}
            isGoalCompleted={goalJustCompleted}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
