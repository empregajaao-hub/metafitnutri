-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_audience TEXT NOT NULL DEFAULT 'all', -- 'all', 'free', 'monthly', 'annual', 'premium'
  sent_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_by UUID[] DEFAULT ARRAY[]::UUID[]
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy para usuários verem notificações destinadas a eles
CREATE POLICY "Users can view their notifications"
ON public.notifications
FOR SELECT
USING (
  target_audience = 'all' 
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

-- Policy para admins criarem notificações
CREATE POLICY "Admins can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
);

-- Policy para admins verem todas notificações
CREATE POLICY "Admins can view all notifications"
ON public.notifications
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin')
);

-- Índices para performance
CREATE INDEX idx_notifications_target_audience ON public.notifications(target_audience);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);