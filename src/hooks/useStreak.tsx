import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const MILESTONES = [3, 7, 14, 30, 60, 100, 365];

export interface StreakData {
  current: number;
  longest: number;
  isActiveToday: boolean;
  nextMilestone: number;
  loading: boolean;
}

export const useStreak = (): StreakData => {
  const [data, setData] = useState<StreakData>({
    current: 0,
    longest: 0,
    isActiveToday: false,
    nextMilestone: 3,
    loading: true,
  });

  useEffect(() => {
    const compute = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setData((d) => ({ ...d, loading: false }));
        return;
      }

      // Pull last 400 days of activity
      const { data: rows } = await supabase
        .from("daily_tracking")
        .select("tracking_date, water_ml, calories_consumed")
        .eq("user_id", user.id)
        .order("tracking_date", { ascending: false })
        .limit(400);

      if (!rows || rows.length === 0) {
        setData({ current: 0, longest: 0, isActiveToday: false, nextMilestone: 3, loading: false });
        return;
      }

      // A day counts as "active" if there is any tracking activity
      const activeDates = new Set(
        rows
          .filter((r) => (r.water_ml ?? 0) > 0 || (r.calories_consumed ?? 0) > 0)
          .map((r) => r.tracking_date),
      );

      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      const yest = new Date(today); yest.setDate(yest.getDate() - 1);
      const yestStr = yest.toISOString().slice(0, 10);

      const isActiveToday = activeDates.has(todayStr);

      // Compute current streak: start from today (or yesterday if not yet active today)
      let current = 0;
      let cursor = new Date(isActiveToday ? todayStr : yestStr);
      while (true) {
        const key = cursor.toISOString().slice(0, 10);
        if (activeDates.has(key)) {
          current += 1;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      }

      // Longest: scan full set
      const sorted = [...activeDates].sort();
      let longest = 0;
      let run = 0;
      let prev: Date | null = null;
      for (const d of sorted) {
        const cur = new Date(d);
        if (prev && (cur.getTime() - prev.getTime()) === 86400000) {
          run += 1;
        } else {
          run = 1;
        }
        if (run > longest) longest = run;
        prev = cur;
      }

      const nextMilestone = MILESTONES.find((m) => m > current) ?? current + 1;

      setData({ current, longest, isActiveToday, nextMilestone, loading: false });
    };

    compute();
  }, []);

  return data;
};