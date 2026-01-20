-- Add face_descriptor column to store the 128-dimensional face embedding
ALTER TABLE public.voters ADD COLUMN IF NOT EXISTS face_descriptor JSONB;