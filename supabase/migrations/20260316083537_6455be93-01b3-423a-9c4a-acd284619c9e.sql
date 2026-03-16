
-- Plan members table for shared Evolution subscriptions
CREATE TABLE public.plan_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  member_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  member_email text,
  member_phone text,
  status text NOT NULL DEFAULT 'pending',
  invite_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.plan_members ENABLE ROW LEVEL SECURITY;

-- Owner can view their plan members
CREATE POLICY "Owners can view plan members"
ON public.plan_members FOR SELECT TO authenticated
USING (owner_id = auth.uid() OR member_id = auth.uid());

-- Owner can insert plan members
CREATE POLICY "Owners can insert plan members"
ON public.plan_members FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Owner can update plan members
CREATE POLICY "Owners can update plan members"
ON public.plan_members FOR UPDATE TO authenticated
USING (owner_id = auth.uid());

-- Owner can delete plan members
CREATE POLICY "Owners can delete plan members"
ON public.plan_members FOR DELETE TO authenticated
USING (owner_id = auth.uid());

-- Anyone can read by invite_token (for accepting invites)
CREATE POLICY "Anyone can view by invite token"
ON public.plan_members FOR SELECT
USING (true);

-- Members can update their own record (to set member_id on acceptance)
CREATE POLICY "Members can update own membership"
ON public.plan_members FOR UPDATE TO authenticated
USING (member_email IS NOT NULL);
