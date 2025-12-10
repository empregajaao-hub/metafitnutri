-- Make the Docs bucket private to prevent public URL access
UPDATE storage.buckets SET public = false WHERE id = 'Docs';

-- Remove the public access policy since bucket is now private
DROP POLICY IF EXISTS "Public can view receipts" ON storage.objects;