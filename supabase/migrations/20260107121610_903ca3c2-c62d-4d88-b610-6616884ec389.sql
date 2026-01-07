-- Add game state columns to sessions table
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS game_mode TEXT DEFAULT 'freejam',
ADD COLUMN IF NOT EXISTS game_settings JSONB DEFAULT '{"duration": 300, "targetCount": 10}'::jsonb,
ADD COLUMN IF NOT EXISTS game_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS game_ends_at TIMESTAMPTZ;

-- Create session_scores table for competition leaderboard
CREATE TABLE IF NOT EXISTS public.session_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, participant_name)
);

-- Enable RLS on session_scores
ALTER TABLE public.session_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies for session_scores
CREATE POLICY "Anyone can view session scores"
ON public.session_scores
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create session scores"
ON public.session_scores
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update session scores"
ON public.session_scores
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete session scores"
ON public.session_scores
FOR DELETE
USING (true);

-- Enable realtime for session_scores
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_scores;