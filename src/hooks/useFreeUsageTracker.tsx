import { supabase } from '@/integrations/supabase/client';

export const useFreeUsageTracker = () => {
  const FREE_LIMIT = 1; // Apenas 1 foto grátis
  const RESET_TIME_MS = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
  const ANALYSIS_TIMEOUT_MS = 90 * 1000; // 1 minuto e 30 segundos para usuários não cadastrados

  const incrementUsage = () => {
    const currentCount = parseInt(localStorage.getItem('free-usage-count') || '0');
    localStorage.setItem('free-usage-count', (currentCount + 1).toString());
    localStorage.setItem('free-usage-timestamp', Date.now().toString());
  };

  const getUsageCount = (): number => {
    return parseInt(localStorage.getItem('free-usage-count') || '0');
  };

  const hasReachedLimit = (): boolean => {
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
    FREE_LIMIT,
    ANALYSIS_TIMEOUT_MS,
  };
};
