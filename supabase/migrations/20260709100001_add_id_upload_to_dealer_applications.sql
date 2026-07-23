-- Add ID file path column to dealer_applications
ALTER TABLE public.dealer_applications
  ADD COLUMN IF NOT EXISTS id_file_path TEXT;

-- Create storage bucket for dealer documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dealer-documents',
  'dealer-documents',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own ID
CREATE POLICY "Users can upload their own ID"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'dealer-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to view their own uploaded ID
CREATE POLICY "Users can view their own ID"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'dealer-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow admins to view all uploaded IDs
CREATE POLICY "Admins can view all uploaded IDs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'dealer-documents'
    AND public.has_role(auth.uid(), 'admin')
  );
