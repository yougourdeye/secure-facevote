-- Drop the overly restrictive SELECT policy
DROP POLICY IF EXISTS "Votes are anonymous - no one can read individual votes" ON public.votes;

-- Create a new policy that allows admins to read votes for result counting
CREATE POLICY "Admins can read votes for results"
ON public.votes
FOR SELECT
USING (is_admin());