import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RankInfo {
  name: string;
  emoji: string;
  color: string;
  minXP: number;
}

export const RANKS: RankInfo[] = [
  { name: "Iniciante",   emoji: "🌱", color: "#94a3b8", minXP: 0 },
  { name: "Dedicado",    emoji: "💪", color: "#60a5fa", minXP: 100 },
  { name: "Atleta",      emoji: "🔥", color: "#fb923c", minXP: 300 },
  { name: "Guerreiro",   emoji: "⚡", color: "#a78bfa", minXP: 700 },
  { name: "Campeão",     emoji: "🏆", color: "#facc15", minXP: 1500 },
  { name: "Lenda",       emoji: "👑", color: "#f43f5e", minXP: 3000 },
];

export interface LevelData {
  totalXP: number;
  level: number;
  rank: RankInfo;
  nextRank: RankInfo | null;
  progressToNext: number; // 0-100
  xpToNext: number;
  loading: boolean;
}

// XP rules:
// - 10 XP per meal logged
// - 1 XP per 100ml of water (max 30/day)
// - 5 XP per active day (any tracking)
// - +50 XP bonus per 7 consecutive active days
export const useUserLevel = (): LevelData => {
  const [data, setData] = useState<LevelData>({
    totalXP: 0,
    level: 1,
    rank: RANKS[0],
    nextRank: RANKS[1],
    progressToNext: 0,
    xpToNext: 100,
    loading: true,
  });

  useEffect(() => {
    const compute = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setData((d) => ({ ...d, loading: false }));
        return;
      }

      const [{ count: mealCount }, { data: tracking }] = await Promise.all([
        supabase
          .from("meal_analyses")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("daily_tracking")
          .select("water_ml, calories_consumed")
          .eq("user_id", user.id)
          .limit(400),
      ]);

      let xp = (mealCount ?? 0) * 10;
      let activeDays = 0;
      (tracking ?? []).forEach((row) => {
        const water = row.water_ml ?? 0;
        const cals = row.calories_consumed ?? 0;
        if (water > 0 || cals > 0) {
          activeDays += 1;
          xp += 5;
          xp += Math.min(Math.floor(water / 100), 30);
        }
      });
      xp += Math.floor(activeDays / 7) * 50;

      const rank = [...RANKS].reverse().find((r) => xp >= r.minXP) ?? RANKS[0];
      const idx = RANKS.indexOf(rank);
      const nextRank = RANKS[idx + 1] ?? null;
      const level = idx + 1;

      let progressToNext = 100;
      let xpToNext = 0;
      if (nextRank) {
        const span = nextRank.minXP - rank.minXP;
        const inRank = xp - rank.minXP;
        progressToNext = Math.min((inRank / span) * 100, 100);
        xpToNext = Math.max(nextRank.minXP - xp, 0);
      }

      setData({
        totalXP: xp,
        level,
        rank,
        nextRank,
        progressToNext,
        xpToNext,
        loading: false,
      });
    };

    compute();
  }, []);

  return data;
};