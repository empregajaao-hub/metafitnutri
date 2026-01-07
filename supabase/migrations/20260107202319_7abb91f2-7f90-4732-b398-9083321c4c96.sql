-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Service role can access all subscriptions" ON public.push_subscriptions;