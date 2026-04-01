
-- Drop old user notification policy and recreate with new plan names
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;

CREATE POLICY "Users can view their notifications" ON public.notifications
FOR SELECT TO public
USING (
  target_audience = 'all'
  OR target_audience = ('user:' || (auth.uid())::text)
  OR (target_audience = 'free' AND EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan = 'free'
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
    SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan IN ('essential', 'evolution', 'personal_trainer')
  ))
);
