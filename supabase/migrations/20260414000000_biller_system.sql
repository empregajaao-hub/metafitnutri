-- Create biller_transactions table to track payments from mobile wallets
CREATE TABLE IF NOT EXISTS public.biller_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    wallet_type TEXT NOT NULL, -- 'unitel_money', 'afrimoney', 'ekwanza', 'paypay'
    reference_id TEXT UNIQUE, -- ID from the wallet provider
    amount DECIMAL NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
    phone_number TEXT,
    plan_id TEXT NOT NULL,
    months INTEGER DEFAULT 1,
    callback_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.biller_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own biller transactions"
    ON public.biller_transactions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Ensure the 'Pagamentos' table exists if it doesn't (since it's used in the app but not found in migrations)
-- Using the structure found in src/integrations/supabase/types.ts
CREATE TABLE IF NOT EXISTS public."Pagamentos" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plano subscription_plan NOT NULL,
    "Valor" DECIMAL NOT NULL,
    receipt_url TEXT,
    estado payment_status DEFAULT 'pending',
    "Forma de Pag" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Pagamentos
ALTER TABLE public."Pagamentos" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Pagamentos
CREATE POLICY "Users can view own payments"
    ON public."Pagamentos" FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
    ON public."Pagamentos" FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create a log table for the Biller system
CREATE TABLE IF NOT EXISTS public.biller_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    message TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only admins should see logs (assuming a role system exists or just for system use)
ALTER TABLE public.biller_logs ENABLE ROW LEVEL SECURITY;
