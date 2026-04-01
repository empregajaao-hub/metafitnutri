import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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

interface DashboardProps {
  userName: string;
  userGoal: "lose" | "maintain" | "gain" | null;
  weight: number | null;
  height?: number | null;
  age?: number | null;
  activityLevel?: string | null;
}

const WATER_OPTIONS = [150, 200, 250, 350, 500];

const Dashboard = ({ userName, userGoal, weight, height, age, activityLevel }: DashboardProps) => {
  const navigate = useNavigate();
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const [todayCalories, setTodayCalories] = useState(0);
  const [todayProtein, setTodayProtein] = useState(0);
  const [todayCarbs, setTodayCarbs] = useState(0);
  const [todayFat, setTodayFat] = useState(0);
  const [waterMl, setWaterMl] = useState(0);
  const [showWaterPicker, setShowWaterPicker] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCelebration, setShowCelebration] = useState(false);
  const [goalJustCompleted, setGoalJustCompleted] = useState(false);

  // Realistic BMR/TDEE calculation (Mifflin-St Jeor average)
  const calculateGoals = () => {
    const w = weight || 70;
    const h = height || 170;
    const a = age || 30;
    // Average of male/female Mifflin-St Jeor
    const bmr = 10 * w + 6.25 * h - 5 * a + 0; // +5 male, -161 female → average ~-78
    const activityMultipliers: Record<string, number> = {
      "Sedentário": 1.2,
      "Levemente Ativo": 1.375,
      "Moderadamente Ativo": 1.55,
      "Muito Ativo": 1.725,
      "Extremamente Ativo": 1.9,
    };
    const multiplier = activityMultipliers[activityLevel || ""] || 1.4;
    const tdee = Math.round(bmr * multiplier);
    
    if (userGoal === "lose") return { cal: Math.round(tdee - 500), prot: Math.round(w * 2), carbs: Math.round((tdee - 500) * 0.35 / 4), fat: Math.round((tdee - 500) * 0.25 / 9), water: Math.round(w * 35) };
    if (userGoal === "gain") return { cal: Math.round(tdee + 400), prot: Math.round(w * 1.8), carbs: Math.round((tdee + 400) * 0.45 / 4), fat: Math.round((tdee + 400) * 0.25 / 9), water: Math.round(w * 40) };
    return { cal: tdee, prot: Math.round(w * 1.5), carbs: Math.round(tdee * 0.40 / 4), fat: Math.round(tdee * 0.30 / 9), water: Math.round(w * 35) };
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
    { label: "Prot", value: todayProtein, goal: proteinGoal, color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
    { label: "Carbs", value: todayCarbs, goal: carbsGoal, color: "hsl(205,100%,50%)", bg: "hsla(205,100%,50%,0.12)" },
    { label: "Gord", value: todayFat, goal: fatGoal, color: "#eab308", bg: "rgba(234,179,8,0.12)" },
  ];

  // SVG ring helper
  const Ring = ({ percent, size, stroke, color, children }: { percent: number; size: number; stroke: number; color: string; children?: React.ReactNode }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (Math.min(percent, 100) / 100) * circ;
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} opacity={0.3} />
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
    <div className="flex flex-col h-full gap-2 py-1">
      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{getGreeting()}</p>
          <h1 className="text-lg font-extrabold text-foreground leading-tight">{userName?.split(' ')[0] || 'User'}</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary/15 to-accent/10 border border-primary/20">
            <GoalIcon className="w-3 h-3 text-primary" />
            <span className="text-[9px] font-bold text-primary">{getGoalLabel()}</span>
          </div>
          {weight && (
            <div className="px-2 py-1 rounded-full bg-card border border-border/50">
              <span className="text-[9px] font-bold text-foreground">{weight}kg</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── MAIN CALORIE PANEL ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl p-3 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, hsl(215 35% 14%), hsl(220 30% 18%))' }}
      >
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, hsl(205 100% 50%), transparent)' }} />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, hsl(142 71% 45%), transparent)' }} />

        <div className="relative z-10 flex items-center gap-4">
          {/* Calorie Ring */}
          <Ring percent={calPercent} size={100} stroke={8} color="hsl(205,100%,55%)">
            <span className="text-[18px] font-black" style={{ color: 'hsl(0,0%,95%)' }}>{caloriesLeft}</span>
            <span className="text-[8px] font-medium" style={{ color: 'hsl(210,15%,65%)' }}>kcal restam</span>
          </Ring>

          {/* Macros vertical */}
          <div className="flex-1 space-y-2">
            {macros.map((m, i) => {
              const pct = Math.min((m.value / m.goal) * 100, 100);
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: m.bg }}>
                    <span className="text-[8px] font-black" style={{ color: m.color }}>{m.label[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-0.5">
                      <span className="text-[9px] font-semibold" style={{ color: 'hsl(210,15%,80%)' }}>{m.label}</span>
                      <span className="text-[9px] font-bold" style={{ color: 'hsl(0,0%,95%)' }}>{m.value}<span style={{ color: 'hsl(210,15%,55%)' }}>/{m.goal}g</span></span>
                    </div>
                    <div className="h-[5px] rounded-full overflow-hidden" style={{ background: 'hsla(0,0%,100%,0.08)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: m.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.15 + i * 0.08 }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {/* Eaten / Goal summary */}
            <div className="flex items-center gap-1 pt-0.5">
              <Flame className="w-3 h-3" style={{ color: 'hsl(15,90%,55%)' }} />
              <span className="text-[9px] font-bold" style={{ color: 'hsl(0,0%,90%)' }}>
                {todayCalories} <span style={{ color: 'hsl(210,15%,55%)' }}>/ {calorieGoal} kcal</span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── WATER + QUICK ACTIONS ROW ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-5 gap-2"
      >
        {/* Water (3 cols) */}
        <div className="col-span-3 rounded-2xl p-2.5 relative overflow-visible"
          style={{ background: 'linear-gradient(135deg, hsl(200 60% 20%), hsl(210 50% 25%))' }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'hsla(200,100%,60%,0.2)' }}>
                <Droplets className="w-3 h-3" style={{ color: 'hsl(200,100%,70%)' }} />
              </div>
              <div>
                <span className="text-[9px] font-bold block leading-none" style={{ color: 'hsl(0,0%,92%)' }}>Água</span>
                <span className="text-[7px]" style={{ color: 'hsl(210,15%,55%)' }}>{waterMl}/{waterGoalMl}ml</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setWaterMl(prev => Math.max(prev - 250, 0))}
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'hsla(0,0%,100%,0.1)' }}
              >
                <Minus className="w-2.5 h-2.5" style={{ color: 'hsl(210,15%,65%)' }} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setShowWaterPicker(!showWaterPicker)}
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'hsl(200,100%,55%)' }}
              >
                <Plus className="w-2.5 h-2.5" style={{ color: '#fff' }} />
              </motion.button>
            </div>
          </div>

          {/* Water bar */}
          <div className="h-[6px] rounded-full overflow-hidden" style={{ background: 'hsla(0,0%,100%,0.08)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, hsl(200,100%,50%), hsl(190,100%,60%))' }}
              initial={{ width: 0 }}
              animate={{ width: `${waterPercent}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>

          <AnimatePresence>
            {showWaterPicker && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-1.5 z-30 rounded-xl p-2.5 border shadow-xl"
                style={{ background: 'hsl(215,30%,15%)', borderColor: 'hsla(0,0%,100%,0.1)' }}
              >
                <div className="grid grid-cols-3 gap-1">
                  {WATER_OPTIONS.map(ml => (
                    <motion.button
                      key={ml}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => addWater(ml)}
                      className="text-[9px] font-bold py-1.5 rounded-lg transition-all"
                      style={{ background: 'hsla(200,100%,55%,0.15)', color: 'hsl(200,100%,70%)' }}
                    >
                      {ml}ml
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick nav buttons (2 cols) */}
        <div className="col-span-2 flex flex-col gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/meal-plan')}
            className="flex-1 rounded-2xl p-2.5 flex items-center gap-2 text-left"
            style={{ background: 'linear-gradient(135deg, hsl(142 40% 18%), hsl(150 35% 22%))' }}
          >
            <Utensils className="w-4 h-4" style={{ color: 'hsl(142,71%,55%)' }} />
            <div>
              <span className="text-[9px] font-bold block leading-none" style={{ color: 'hsl(0,0%,92%)' }}>Plano</span>
              <span className="text-[7px]" style={{ color: 'hsl(142,30%,50%)' }}>Semanal</span>
            </div>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/workout')}
            className="flex-1 rounded-2xl p-2.5 flex items-center gap-2 text-left"
            style={{ background: 'linear-gradient(135deg, hsl(270 35% 20%), hsl(280 30% 25%))' }}
          >
            <Dumbbell className="w-4 h-4" style={{ color: 'hsl(270,80%,70%)' }} />
            <div>
              <span className="text-[9px] font-bold block leading-none" style={{ color: 'hsl(0,0%,92%)' }}>Treino</span>
              <span className="text-[7px]" style={{ color: 'hsl(270,30%,55%)' }}>Do dia</span>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* ── TODAY'S MEALS ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex-1 min-h-0 flex flex-col"
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Camera className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-foreground">Refeições de Hoje</span>
            {todayMeals.length > 0 && (
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">{todayMeals.length}</span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/upload')}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold"
            style={{ background: 'hsla(205,100%,50%,0.12)', color: 'hsl(205,100%,55%)' }}
          >
            <Plus className="w-2.5 h-2.5" /> Adicionar
          </motion.button>
        </div>

        {todayMeals.length === 0 ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/upload')}
            className="flex-1 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all"
            style={{ borderColor: 'hsla(205,100%,50%,0.2)', background: 'hsla(205,100%,50%,0.03)' }}
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, hsla(205,100%,50%,0.15), hsla(200,100%,60%,0.1))' }}
            >
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-foreground">Tira foto da refeição</p>
              <p className="text-[8px] text-muted-foreground">Análise nutricional com IA</p>
            </div>
          </motion.button>
        ) : (
          <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden scrollbar-hide flex gap-2 pb-1 items-stretch">
            {todayMeals.map((meal, i) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="shrink-0 w-[110px] rounded-xl overflow-hidden relative group flex flex-col"
                style={{ background: 'linear-gradient(180deg, hsl(215 30% 14%), hsl(220 25% 18%))' }}
              >
                {/* Image */}
                <div className="relative h-[60px] overflow-hidden">
                  {meal.image_url ? (
                    <img src={meal.image_url} alt="Refeição" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'hsla(0,0%,100%,0.05)' }}>
                      <Utensils className="w-4 h-4" style={{ color: 'hsl(210,15%,40%)' }} />
                    </div>
                  )}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, hsl(215 30% 14%), transparent 60%)' }} />
                  {/* Delete */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => { e.stopPropagation(); handleDeleteMeal(meal.id); }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'hsla(0,0%,0%,0.6)' }}
                  >
                    <Trash2 className="w-2.5 h-2.5 text-destructive" />
                  </motion.button>
                  {/* Time */}
                  <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded" style={{ background: 'hsla(0,0%,0%,0.5)' }}>
                    <p className="text-[7px] font-medium" style={{ color: 'hsl(0,0%,80%)' }}>
                      {new Date(meal.created_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                {/* Info */}
                <div className="p-1.5 flex-1 flex flex-col justify-center">
                  <p className="text-[11px] font-extrabold leading-none" style={{ color: 'hsl(0,0%,95%)' }}>
                    {meal.estimated_calories} <span className="text-[8px] font-normal" style={{ color: 'hsl(210,15%,55%)' }}>kcal</span>
                  </p>
                  <div className="flex gap-1 mt-1">
                    <span className="text-[6px] font-bold px-1 py-0.5 rounded" style={{ color: '#22c55e', background: 'rgba(34,197,94,0.12)' }}>P:{meal.protein_g}g</span>
                    <span className="text-[6px] font-bold px-1 py-0.5 rounded" style={{ color: 'hsl(205,100%,55%)', background: 'hsla(205,100%,55%,0.12)' }}>C:{meal.carbs_g}g</span>
                    <span className="text-[6px] font-bold px-1 py-0.5 rounded" style={{ color: '#eab308', background: 'rgba(234,179,8,0.12)' }}>G:{meal.fat_g}g</span>
                  </div>
                </div>
              </motion.div>
            ))}
            {/* Add more */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/upload')}
              className="shrink-0 w-[60px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1"
              style={{ borderColor: 'hsla(205,100%,50%,0.2)', background: 'hsla(205,100%,50%,0.03)' }}
            >
              <Plus className="w-4 h-4 text-primary" />
              <span className="text-[7px] text-muted-foreground">Mais</span>
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
