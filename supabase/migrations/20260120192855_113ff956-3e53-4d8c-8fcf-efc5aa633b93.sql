-- Create storage bucket for candidate photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-photos', 'candidate-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view candidate photos
CREATE POLICY "Anyone can view candidate photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'candidate-photos');

-- Allow admins to upload candidate photos
CREATE POLICY "Admins can upload candidate photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'candidate-photos' AND public.is_admin());

-- Allow admins to update candidate photos
CREATE POLICY "Admins can update candidate photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'candidate-photos' AND public.is_admin());

-- Allow admins to delete candidate photos
CREATE POLICY "Admins can delete candidate photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'candidate-photos' AND public.is_admin());