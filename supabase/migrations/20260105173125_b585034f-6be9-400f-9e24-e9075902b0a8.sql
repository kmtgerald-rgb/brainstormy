-- Create sessions table for brainstorming sessions
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session ideas table
CREATE TABLE public.session_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  author_name TEXT,
  card_insight TEXT NOT NULL,
  card_asset TEXT NOT NULL,
  card_tech TEXT NOT NULL,
  card_random TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wildcards table for shared wildcards in a session
CREATE TABLE public.session_wildcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('insight', 'asset', 'tech', 'random')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_session_ideas_session_id ON public.session_ideas(session_id);
CREATE INDEX idx_session_wildcards_session_id ON public.session_wildcards(session_id);
CREATE INDEX idx_sessions_code ON public.sessions(code);

-- Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_wildcards ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for this collaborative tool)
CREATE POLICY "Anyone can view sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can create sessions" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sessions" ON public.sessions FOR UPDATE USING (true);

CREATE POLICY "Anyone can view session ideas" ON public.session_ideas FOR SELECT USING (true);
CREATE POLICY "Anyone can create session ideas" ON public.session_ideas FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete session ideas" ON public.session_ideas FOR DELETE USING (true);

CREATE POLICY "Anyone can view session wildcards" ON public.session_wildcards FOR SELECT USING (true);
CREATE POLICY "Anyone can create session wildcards" ON public.session_wildcards FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete session wildcards" ON public.session_wildcards FOR DELETE USING (true);

-- Enable realtime for live collaboration
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_ideas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_wildcards;

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for sessions updated_at
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();