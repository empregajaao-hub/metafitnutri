import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSubscriptionGuard = () => {
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  const checkStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }
      setIsLoggedIn(true);

      const { data: sub } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!sub) {
        // Se não houver subscrição, consideramos expirado (deveria ter sido criada no onboarding)
        setIsExpired(true);
        setIsLoading(false);
        return;
      }

      setSubscription(sub);

      const now = new Date();
      
      // Lógica de Trial (7 dias)
      const trialStart = new Date(sub.trial_start_date || sub.created_at || now.toISOString());
      const trialEnd = new Date(trialStart);
      trialEnd.setDate(trialEnd.getDate() + 7);
      const isTrialActive = now <= trialEnd;

      // Lógica de Plano Pago
      const hasActivePaid = sub.is_active && 
                           sub.plan !== "free" && 
                           !!sub.end_date && 
                           new Date(sub.end_date) > now;

      // Está expirado se não tiver trial ativo nem plano pago ativo
      setIsExpired(!hasActivePaid && !isTrialActive);
    } catch (error) {
      console.error("Error in useSubscriptionGuard:", error);
      setIsExpired(false); // Em caso de erro, permitimos o acesso para não bloquear utilizadores por falhas técnicas
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return { isExpired, isLoading, isLoggedIn, subscription, refreshStatus: checkStatus };
};
