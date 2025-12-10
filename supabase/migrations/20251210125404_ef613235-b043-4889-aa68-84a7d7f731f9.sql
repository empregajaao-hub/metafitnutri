-- Create storage policies for the Docs bucket to allow receipt uploads

-- Policy for users to upload their own receipts
CREATE POLICY "Users can upload their own receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'Docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to view their own receipts
CREATE POLICY "Users can view their own receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'Docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for admins to view all receipts
CREATE POLICY "Admins can view all receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'Docs' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Policy for public access to receipts (since bucket is public)
CREATE POLICY "Public can view receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'Docs');