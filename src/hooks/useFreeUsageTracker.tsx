import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

export const useFreeUsageTracker = () => {
  const FREE_LIMIT = 1; // Apenas 1 foto grátis
  const RESET_TIME_MS = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
  const ANALYSIS_TIMEOUT_MS = 90 * 1000; // 1 minuto e 30 segundos para usuários não cadastrados
  
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkUserPlanAndAuth();
  }, []);

  const checkUserPlanAndAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setIsAuthenticated(false);
      setUserPlan(null);
      return;
    }

    setIsAuthenticated(true);

    // Verificar plano do usuário
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('plan, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    setUserPlan(subscription?.plan || 'free');
  };

  const incrementUsage = () => {
    const currentCount = parseInt(localStorage.getItem('free-usage-count') || '0');
    localStorage.setItem('free-usage-count', (currentCount + 1).toString());
    localStorage.setItem('free-usage-timestamp', Date.now().toString());
  };

  const getUsageCount = (): number => {
    return parseInt(localStorage.getItem('free-usage-count') || '0');
  };

  const shouldApplyLimit = (): boolean => {
    // Aplicar limite para:
    // 1. Usuários não autenticados
    // 2. Usuários com plano "free" ou sem plano ativo
    if (!isAuthenticated) return true;
    if (userPlan === 'free' || userPlan === null) return true;
    
    // Usuários com plano "monthly" ou "annual" não têm limite
    return false;
  };

  const hasReachedLimit = (): boolean => {
    // Não aplicar limite se o usuário tem plano pago
    if (!shouldApplyLimit()) return false;

    const count = getUsageCount();
    if (count < FREE_LIMIT) return false;

    // Verificar se já passaram 24h desde o último uso
    const timestamp = localStorage.getItem('free-usage-timestamp');
    if (!timestamp) return count >= FREE_LIMIT;

    const timePassed = Date.now() - parseInt(timestamp);
    if (timePassed >= RESET_TIME_MS) {
      // Reset automático após 24h
      resetUsage();
      return false;
    }

    return true;
  };

  const getTimeUntilReset = (): number => {
    const timestamp = localStorage.getItem('free-usage-timestamp');
    if (!timestamp) return 0;

    const timePassed = Date.now() - parseInt(timestamp);
    const remaining = RESET_TIME_MS - timePassed;
    return remaining > 0 ? remaining : 0;
  };

  const resetUsage = () => {
    localStorage.removeItem('free-usage-count');
    localStorage.removeItem('free-usage-timestamp');
    localStorage.removeItem('free-plan-modal-shown');
  };

  const checkIfUserIsAuthenticated = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  };

  return {
    incrementUsage,
    getUsageCount,
    hasReachedLimit,
    resetUsage,
    checkIfUserIsAuthenticated,
    getTimeUntilReset,
    shouldApplyLimit,
    isAuthenticated,
    userPlan,
    FREE_LIMIT,
    ANALYSIS_TIMEOUT_MS,
  };
};
