
-- Affiliate system enums
CREATE TYPE public.affiliate_status AS ENUM ('pending', 'active', 'suspended', 'rejected');
CREATE TYPE public.affiliate_payment_method AS ENUM ('iban', 'wallet');
CREATE TYPE public.commission_status AS ENUM ('pending', 'approved', 'paid', 'cancelled');
CREATE TYPE public.referral_status AS ENUM ('clicked', 'signed_up', 'subscribed', 'cancelled');

-- ============ AFFILIATES ============
CREATE TABLE public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  payment_method public.affiliate_payment_method NOT NULL,
  payment_details TEXT NOT NULL,
  status public.affiliate_status NOT NULL DEFAULT 'pending',
  commission_percent NUMERIC(5,2) NOT NULL DEFAULT 40,
  bonus NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_earned NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  total_conversions INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_affiliates_code ON public.affiliates(code);
CREATE INDEX idx_affiliates_status ON public.affiliates(status);
CREATE INDEX idx_affiliates_user_id ON public.affiliates(user_id);

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own affiliate" ON public.affiliates FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own affiliate" ON public.affiliates FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Admins view all affiliates" ON public.affiliates FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update affiliates" ON public.affiliates FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- ============ AFFILIATE CLICKS ============
CREATE TABLE public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  ip_hash TEXT,
  user_agent_hash TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_clicks_affiliate ON public.affiliate_clicks(affiliate_id, created_at DESC);

ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliates view own clicks" ON public.affiliate_clicks FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_id AND a.user_id = auth.uid()));
CREATE POLICY "Admins view all clicks" ON public.affiliate_clicks FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- ============ REFERRALS ============
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL UNIQUE,
  status public.referral_status NOT NULL DEFAULT 'signed_up',
  clicked_at TIMESTAMPTZ,
  signed_up_at TIMESTAMPTZ DEFAULT now(),
  subscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_referrals_affiliate ON public.referrals(affiliate_id);
CREATE INDEX idx_referrals_user ON public.referrals(referred_user_id);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliates view own referrals" ON public.referrals FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_id AND a.user_id = auth.uid()));
CREATE POLICY "Admins view all referrals" ON public.referrals FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage referrals" ON public.referrals FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Anti self-referral trigger
CREATE OR REPLACE FUNCTION public.prevent_self_referral()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.affiliates WHERE id = NEW.affiliate_id AND user_id = NEW.referred_user_id) THEN
    RAISE EXCEPTION 'Self-referral not allowed';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_prevent_self_referral
  BEFORE INSERT ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_referral();

-- ============ COMMISSIONS ============
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES public.referrals(id) ON DELETE SET NULL,
  payment_id TEXT,
  plan TEXT,
  sale_amount NUMERIC(12,2) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  percent_applied NUMERIC(5,2) NOT NULL,
  status public.commission_status NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_commissions_affiliate ON public.commissions(affiliate_id, created_at DESC);
CREATE INDEX idx_commissions_status ON public.commissions(status);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliates view own commissions" ON public.commissions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_id AND a.user_id = auth.uid()));
CREATE POLICY "Admins view all commissions" ON public.commissions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage commissions" ON public.commissions FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ============ AFFILIATE PAYMENTS ============
CREATE TABLE public.affiliate_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  method TEXT,
  reference TEXT,
  notes TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_aff_payments_affiliate ON public.affiliate_payments(affiliate_id, created_at DESC);

ALTER TABLE public.affiliate_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliates view own payouts" ON public.affiliate_payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.affiliates a WHERE a.id = affiliate_id AND a.user_id = auth.uid()));
CREATE POLICY "Admins view all payouts" ON public.affiliate_payments FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins create payouts" ON public.affiliate_payments FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- ============ AFFILIATE SETTINGS (singleton) ============
CREATE TABLE public.affiliate_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  default_percent NUMERIC(5,2) NOT NULL DEFAULT 40,
  min_payout NUMERIC(12,2) NOT NULL DEFAULT 5000,
  cookie_days INTEGER NOT NULL DEFAULT 30,
  bonus_rules JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);
INSERT INTO public.affiliate_settings (id) VALUES (1);

ALTER TABLE public.affiliate_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads settings" ON public.affiliate_settings FOR SELECT USING (true);
CREATE POLICY "Admins update settings" ON public.affiliate_settings FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- updated_at triggers
CREATE TRIGGER trg_aff_updated BEFORE UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_comm_updated BEFORE UPDATE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.affiliate_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ FUNCTIONS ============

-- Register a click by affiliate code (returns affiliate id)
CREATE OR REPLACE FUNCTION public.register_affiliate_click(
  _code TEXT, _ip_hash TEXT DEFAULT NULL, _ua_hash TEXT DEFAULT NULL, _referrer TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _aff_id UUID;
BEGIN
  SELECT id INTO _aff_id FROM public.affiliates WHERE code = _code AND status = 'active';
  IF _aff_id IS NULL THEN RETURN NULL; END IF;
  -- rate limit: max 10 clicks per IP per minute per affiliate
  IF _ip_hash IS NOT NULL AND (
    SELECT COUNT(*) FROM public.affiliate_clicks
    WHERE affiliate_id = _aff_id AND ip_hash = _ip_hash
      AND created_at > now() - INTERVAL '1 minute'
  ) >= 10 THEN
    RETURN _aff_id;
  END IF;
  INSERT INTO public.affiliate_clicks (affiliate_id, ip_hash, user_agent_hash, referrer)
    VALUES (_aff_id, _ip_hash, _ua_hash, _referrer);
  UPDATE public.affiliates SET total_clicks = total_clicks + 1 WHERE id = _aff_id;
  RETURN _aff_id;
END;
$$;

-- Attribute a referral after signup
CREATE OR REPLACE FUNCTION public.attribute_referral(_user_id UUID, _code TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _aff_id UUID; _ref_id UUID;
BEGIN
  SELECT id INTO _aff_id FROM public.affiliates WHERE code = _code AND status = 'active';
  IF _aff_id IS NULL THEN RETURN NULL; END IF;
  -- prevent self
  IF EXISTS (SELECT 1 FROM public.affiliates WHERE id = _aff_id AND user_id = _user_id) THEN
    RETURN NULL;
  END IF;
  INSERT INTO public.referrals (affiliate_id, referred_user_id, status, signed_up_at)
    VALUES (_aff_id, _user_id, 'signed_up', now())
    ON CONFLICT (referred_user_id) DO NOTHING
    RETURNING id INTO _ref_id;
  RETURN _ref_id;
END;
$$;

-- Generate commission for a payment (called by webhook). Uses email or user_id.
CREATE OR REPLACE FUNCTION public.generate_commission_for_payment(
  _user_id UUID, _payment_id TEXT, _plan TEXT, _amount NUMERIC
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _ref RECORD; _aff RECORD; _comm_id UUID; _commission NUMERIC;
BEGIN
  SELECT * INTO _ref FROM public.referrals WHERE referred_user_id = _user_id LIMIT 1;
  IF _ref IS NULL THEN RETURN NULL; END IF;
  SELECT * INTO _aff FROM public.affiliates WHERE id = _ref.affiliate_id AND status = 'active';
  IF _aff IS NULL THEN RETURN NULL; END IF;
  -- avoid duplicate
  IF EXISTS (SELECT 1 FROM public.commissions WHERE payment_id = _payment_id) THEN
    RETURN NULL;
  END IF;
  _commission := ROUND((_amount * _aff.commission_percent / 100)::numeric, 2);
  INSERT INTO public.commissions (affiliate_id, referral_id, payment_id, plan, sale_amount, commission_amount, percent_applied, status, approved_at)
    VALUES (_aff.id, _ref.id, _payment_id, _plan, _amount, _commission, _aff.commission_percent, 'approved', now())
    RETURNING id INTO _comm_id;
  UPDATE public.referrals SET status = 'subscribed', subscribed_at = now() WHERE id = _ref.id;
  UPDATE public.affiliates
    SET total_earned = total_earned + _commission,
        total_conversions = total_conversions + 1
    WHERE id = _aff.id;
  RETURN _comm_id;
END;
$$;
