
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS payment_id text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS status text;

ALTER TABLE public."Pagamentos"
  ADD COLUMN IF NOT EXISTS payment_id text,
  ADD COLUMN IF NOT EXISTS provider text;

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_email ON public.user_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payment_id ON public.user_subscriptions(payment_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_payment_id ON public."Pagamentos"(payment_id);
