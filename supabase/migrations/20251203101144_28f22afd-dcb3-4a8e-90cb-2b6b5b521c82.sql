-- Create table for favorite recipes
CREATE TABLE public.favorite_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipe_name TEXT NOT NULL,
  recipe_description TEXT,
  difficulty TEXT,
  time_minutes INTEGER,
  ingredients TEXT[],
  steps TEXT[],
  calories INTEGER,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  why_recommended TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.favorite_recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own favorite recipes"
ON public.favorite_recipes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorite recipes"
ON public.favorite_recipes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorite recipes"
ON public.favorite_recipes
FOR DELETE
USING (auth.uid() = user_id);