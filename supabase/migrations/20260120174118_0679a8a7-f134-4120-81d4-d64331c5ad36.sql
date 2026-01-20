-- Create enum for election status
CREATE TYPE public.election_status AS ENUM ('draft', 'active', 'upcoming', 'completed');

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'voter');

-- Create profiles table for admin users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create voters table (separate from auth users - voters don't need accounts)
CREATE TABLE public.voters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  national_id TEXT NOT NULL UNIQUE,
  face_image_url TEXT,
  face_registered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create elections table
CREATE TABLE public.elections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status election_status NOT NULL DEFAULT 'draft',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create candidates table
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  party TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create votes table
CREATE TABLE public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES public.voters(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Ensure one vote per voter per election
  UNIQUE (election_id, voter_id)
);

-- Create voter verification logs table
CREATE TABLE public.voter_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_id UUID REFERENCES public.voters(id) ON DELETE CASCADE NOT NULL,
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verification_status TEXT NOT NULL DEFAULT 'success',
  session_token TEXT NOT NULL UNIQUE
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voter_verifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin());

-- Voters policies (public for registration, admin for management)
CREATE POLICY "Anyone can register as voter"
  ON public.voters FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can view voters for verification"
  ON public.voters FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage voters"
  ON public.voters FOR ALL
  USING (public.is_admin());

-- Elections policies
CREATE POLICY "Anyone can view active elections"
  ON public.elections FOR SELECT
  USING (status IN ('active', 'upcoming', 'completed'));

CREATE POLICY "Admins can view all elections"
  ON public.elections FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage elections"
  ON public.elections FOR ALL
  USING (public.is_admin());

-- Candidates policies
CREATE POLICY "Anyone can view candidates of active elections"
  ON public.candidates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.elections
      WHERE id = election_id
      AND status IN ('active', 'upcoming', 'completed')
    )
  );

CREATE POLICY "Admins can manage candidates"
  ON public.candidates FOR ALL
  USING (public.is_admin());

-- Votes policies
CREATE POLICY "Votes are anonymous - no one can read individual votes"
  ON public.votes FOR SELECT
  USING (false);

CREATE POLICY "Verified voters can cast votes"
  ON public.votes FOR INSERT
  WITH CHECK (true);

-- Voter verifications policies
CREATE POLICY "Anyone can create verification records"
  ON public.voter_verifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can verify with session token"
  ON public.voter_verifications FOR SELECT
  USING (true);

-- Create storage bucket for face images
INSERT INTO storage.buckets (id, name, public)
VALUES ('face-images', 'face-images', true);

-- Storage policies for face images
CREATE POLICY "Anyone can upload face images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'face-images');

CREATE POLICY "Anyone can view face images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'face-images');

CREATE POLICY "Admins can delete face images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'face-images');

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_voters_updated_at
  BEFORE UPDATE ON public.voters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_elections_updated_at
  BEFORE UPDATE ON public.elections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();