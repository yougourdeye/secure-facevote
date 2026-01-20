-- Enable realtime for votes table to allow real-time result updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;