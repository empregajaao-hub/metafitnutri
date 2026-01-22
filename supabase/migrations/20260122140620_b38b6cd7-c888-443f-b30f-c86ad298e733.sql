-- Extend notifications visibility policy to support per-user targeting via target_audience='user:<uuid>'
-- This migration is safe and idempotent.

DO $$
BEGIN
  -- Drop existing policy if present (so we can recreate with additional condition)
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'notifications'
      AND policyname = 'Users can view their notifications'
  ) THEN
    EXECUTE 'DROP POLICY "Users can view their notifications" ON public.notifications';
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Recreate policy with individual targeting support
CREATE POLICY "Users can view their notifications"
ON public.notifications
FOR SELECT
USING (
  target_audience = 'all'
  OR target_audience = ('user:' || auth.uid()::text)
  OR (target_audience = 'free' AND EXISTS (
    SELECT 1 FROM public.user_subscriptions 
    WHERE user_id = auth.uid() AND plan = 'free'
  ))
  OR (target_audience = 'monthly' AND EXISTS (
    SELECT 1 FROM public.user_subscriptions 
    WHERE user_id = auth.uid() AND plan = 'monthly'
  ))
  OR (target_audience = 'annual' AND EXISTS (
    SELECT 1 FROM public.user_subscriptions 
    WHERE user_id = auth.uid() AND plan = 'annual'
  ))
  OR (target_audience = 'premium' AND EXISTS (
    SELECT 1 FROM public.user_subscriptions 
    WHERE user_id = auth.uid() AND plan IN ('monthly', 'annual')
  ))
);
