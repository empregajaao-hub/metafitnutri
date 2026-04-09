
-- ============================================
-- 1. Fix plan_members RLS: restrict open SELECT
-- ============================================
DROP POLICY IF EXISTS "Anyone can view by invite token" ON public.plan_members;

CREATE POLICY "View by invite token or own membership"
ON public.plan_members
FOR SELECT
TO public
USING (
  owner_id = auth.uid()
  OR member_id = auth.uid()
  OR (invite_token IS NOT NULL AND invite_token = current_setting('request.headers', true)::json->>'x-invite-token')
);

-- ============================================
-- 2. Update notifications RLS for new plan names
-- ============================================
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;

CREATE POLICY "Users can view their notifications"
ON public.notifications
FOR SELECT
TO public
USING (
  target_audience = 'all'
  OR target_audience = 'user:' || auth.uid()::text
  OR (target_audience = 'free' AND EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan = 'free'
  ))
  OR (target_audience = 'monthly' AND EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan = 'monthly'
  ))
  OR (target_audience = 'annual' AND EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan = 'annual'
  ))
  OR (target_audience = 'essential' AND EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan = 'essential'
  ))
  OR (target_audience = 'evolution' AND EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan = 'evolution'
  ))
  OR (target_audience = 'personal_trainer' AND EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan = 'personal_trainer'
  ))
  OR (target_audience = 'premium' AND EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan IN ('essential', 'evolution', 'personal_trainer', 'monthly', 'annual')
  ))
);

DROP POLICY IF EXISTS "Users can mark notifications as read" ON public.notifications;

CREATE POLICY "Users can mark notifications as read"
ON public.notifications
FOR UPDATE
TO authenticated
USING (
  target_audience = 'all'
  OR target_audience = 'user:' || auth.uid()::text
  OR (target_audience = 'free' AND EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan = 'free'
  ))
  OR (target_audience = 'monthly' AND EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan = 'monthly'
  ))
  OR (target_audience = 'annual' AND EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan = 'annual'
  ))
  OR (target_audience = 'essential' AND EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan = 'essential'
  ))
  OR (target_audience = 'evolution' AND EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan = 'evolution'
  ))
  OR (target_audience = 'personal_trainer' AND EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan = 'personal_trainer'
  ))
  OR (target_audience = 'premium' AND EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan IN ('essential', 'evolution', 'personal_trainer', 'monthly', 'annual')
  ))
)
WITH CHECK (true);

-- ============================================
-- 3. Create daily_tracking table
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  water_ml INTEGER NOT NULL DEFAULT 0,
  calories_consumed INTEGER NOT NULL DEFAULT 0,
  calories_goal INTEGER NOT NULL DEFAULT 2000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tracking_date)
);

ALTER TABLE public.daily_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily tracking"
ON public.daily_tracking FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily tracking"
ON public.daily_tracking FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily tracking"
ON public.daily_tracking FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily tracking"
ON public.daily_tracking FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_daily_tracking_updated_at
BEFORE UPDATE ON public.daily_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
