import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSubscriptionGuard = () => {
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }
      setIsLoggedIn(true);

      const { data: sub } = await supabase
        .from("user_subscriptions")
        .select("plan, is_active, end_date, trial_start_date, created_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!sub) { setIsExpired(true); setIsLoading(false); return; }

      const now = new Date();
      const trialStart = new Date(sub.trial_start_date || sub.created_at || now.toISOString());
      const trialEnd = new Date(trialStart);
      trialEnd.setDate(trialEnd.getDate() + 7);

      const hasActivePaid = sub.is_active && sub.plan !== "free" && !!sub.end_date && new Date(sub.end_date) > now;
      const isTrialActive = now <= trialEnd;

      setIsExpired(!hasActivePaid && !isTrialActive);
    } catch {
      setIsExpired(false);
    } finally {
      setIsLoading(false);
    }
  };

  return { isExpired, isLoading, isLoggedIn };
};
