
-- Social media posts table
CREATE TABLE public.social_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT,
  image_url TEXT,
  post_type TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view posts" ON public.social_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own posts" ON public.social_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.social_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Likes table
CREATE TABLE public.social_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.social_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view likes" ON public.social_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own likes" ON public.social_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.social_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Public storage bucket for social posts images
INSERT INTO storage.buckets (id, name, public) VALUES ('social-posts', 'social-posts', true);

CREATE POLICY "Authenticated users can upload social images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'social-posts');
CREATE POLICY "Anyone can view social images" ON storage.objects FOR SELECT USING (bucket_id = 'social-posts');
CREATE POLICY "Users can delete own social images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'social-posts' AND (storage.foldername(name))[1] = auth.uid()::text);
