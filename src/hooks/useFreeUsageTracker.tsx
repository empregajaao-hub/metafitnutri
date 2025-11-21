import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useFreeUsageTracker = () => {
  const incrementUsage = () => {
    const currentCount = parseInt(localStorage.getItem('free-usage-count') || '0');
    localStorage.setItem('free-usage-count', (currentCount + 1).toString());
  };

  const getUsageCount = (): number => {
    return parseInt(localStorage.getItem('free-usage-count') || '0');
  };

  const resetUsage = () => {
    localStorage.removeItem('free-usage-count');
    localStorage.removeItem('free-plan-modal-shown');
  };

  const checkIfUserIsAuthenticated = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  };

  return {
    incrementUsage,
    getUsageCount,
    resetUsage,
    checkIfUserIsAuthenticated,
  };
};
