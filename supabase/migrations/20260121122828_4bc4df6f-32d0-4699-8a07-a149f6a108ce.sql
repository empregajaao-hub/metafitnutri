-- Add trial_start_date to user_subscriptions if not exists
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS trial_start_date timestamp with time zone DEFAULT now();

-- Add subscription_plan values for new plans
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'essential' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_plan')) THEN
    ALTER TYPE subscription_plan ADD VALUE 'essential';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'evolution' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_plan')) THEN
    ALTER TYPE subscription_plan ADD VALUE 'evolution';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'personal_trainer' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'subscription_plan')) THEN
    ALTER TYPE subscription_plan ADD VALUE 'personal_trainer';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;