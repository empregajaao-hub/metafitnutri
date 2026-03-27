INSERT INTO storage.buckets (id, name, public) VALUES ('meal-images', 'meal-images', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload meal images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'meal-images');

CREATE POLICY "Public can view meal images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'meal-images');