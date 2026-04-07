
-- Allow authenticated users to update notifications they can see (to mark as read)
CREATE POLICY "Users can mark notifications as read"
ON public.notifications
FOR UPDATE
TO authenticated
USING (
  (target_audience = 'all')
  OR (target_audience = ('user:' || (auth.uid())::text))
  OR (
    (target_audience = 'free') AND EXISTS (
      SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan = 'free'
    )
  )
  OR (
    (target_audience = 'essential') AND EXISTS (
      SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan = 'essential'
    )
  )
  OR (
    (target_audience = 'evolution') AND EXISTS (
      SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan = 'evolution'
    )
  )
  OR (
    (target_audience = 'personal_trainer') AND EXISTS (
      SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan = 'personal_trainer'
    )
  )
  OR (
    (target_audience = 'premium') AND EXISTS (
      SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND plan IN ('essential', 'evolution', 'personal_trainer')
    )
  )
)
WITH CHECK (true);
