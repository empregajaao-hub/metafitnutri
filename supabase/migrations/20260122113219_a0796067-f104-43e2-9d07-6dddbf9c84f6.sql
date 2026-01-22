-- Create receipts bucket (private) for bank proof uploads (idempotent)
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- Create storage policies idempotently (Postgres has no CREATE POLICY IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can upload own receipts'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Users can upload own receipts"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'receipts'
        AND auth.uid()::text = (storage.foldername(name))[1]
      )
    $p$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can view own receipts'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Users can view own receipts"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = 'receipts'
        AND auth.uid()::text = (storage.foldername(name))[1]
      )
    $p$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admins can view all receipts'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins can view all receipts"
      ON storage.objects FOR SELECT
      USING (
        bucket_id = 'receipts'
        AND public.has_role(auth.uid(), 'admin'::app_role)
      )
    $p$;
  END IF;
END $$;
