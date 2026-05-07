import { motion, AnimatePresence } from "framer-motion";
import { Check, Droplets, Camera, Flame, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  waterMl: number;
  waterGoalMl: number;
  todayCalories: number;
  calorieGoal: number;
  mealsCount: number;
}

const DailyMissions = ({ waterMl, waterGoalMl, todayCalories, calorieGoal, mealsCount }: Props) => {
  const todayKey = new Date().toISOString().slice(0, 10);
  const [celebratedAll, setCelebratedAll] = useState(false);

  const missions = useMemo(() => {
    const waterPct = Math.min((waterMl / Math.max(waterGoalMl, 1)) * 100, 100);
    const calPct = Math.min((todayCalories / Math.max(calorieGoal, 1)) * 100, 100);
    return [
      {
        id: "meal",
        label: "Regista 1 refeição",
        icon: Camera,
        color: "text-orange-400",
        bg: "bg-orange-500/15",
        progress: Math.min((mealsCount / 1) * 100, 100),
        done: mealsCount >= 1,
        xp: 10,
      },
      {
        id: "water",
        label: "Atinge meta de água",
        icon: Droplets,
        color: "text-blue-400",
        bg: "bg-blue-500/15",
        progress: waterPct,
        done: waterPct >= 100,
        xp: 15,
      },
      {
        id: "cal",
        label: "Bate as calorias",
        icon: Flame,
        color: "text-red-400",
        bg: "bg-red-500/15",
        progress: calPct,
        done: calPct >= 100,
        xp: 25,
      },
    ];
  }, [waterMl, waterGoalMl, todayCalories, calorieGoal, mealsCount]);

  const completedCount = missions.filter((m) => m.done).length;
  const totalXP = missions.filter((m) => m.done).reduce((s, m) => s + m.xp, 0);
  const allDone = completedCount === missions.length;

  useEffect(() => {
    const key = `missions_celebrated_${todayKey}`;
    if (allDone && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      setCelebratedAll(true);
      setTimeout(() => setCelebratedAll(false), 3500);
    }
  }, [allDone, todayKey]);

  return (
    <div className="relative space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-primary" />
          <h3 className="text-[11px] font-black text-white/60 uppercase tracking-widest">
            Missões de Hoje
          </h3>
        </div>
        <span className="text-[10px] font-bold text-primary tabular-nums">
          {completedCount}/{missions.length} · +{totalXP} XP
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {missions.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "relative p-2.5 rounded-2xl border backdrop-blur-md overflow-hidden transition-all",
                m.done
                  ? "bg-primary/10 border-primary/40"
                  : "bg-white/5 border-white/10",
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center", m.bg)}>
                  <Icon className={cn("w-3.5 h-3.5", m.color)} />
                </div>
                {m.done && (
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                  </motion.div>
                )}
              </div>
              <p className="text-[10px] font-bold text-white leading-tight mb-1.5">{m.label}</p>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.progress}%` }}
                  transition={{ duration: 0.8 }}
                  className={cn("h-full rounded-full", m.done ? "bg-primary" : "bg-white/30")}
                />
              </div>
              <p className="text-[9px] font-black text-white/40 mt-1 uppercase tracking-wider">+{m.xp} XP</p>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {celebratedAll && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-blue-500 shadow-lg shadow-primary/40 z-10"
          >
            <span className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Todas missões completas!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DailyMissions;