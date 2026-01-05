import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Session {
  id: string;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface SessionIdea {
  id: string;
  session_id: string;
  title: string;
  description: string | null;
  author_name: string | null;
  card_insight: string;
  card_asset: string;
  card_tech: string;
  card_random: string;
  created_at: string;
}

export interface SessionWildcard {
  id: string;
  session_id: string;
  text: string;
  category: 'insight' | 'asset' | 'tech' | 'random';
  created_at: string;
}

const generateSessionCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ideas, setIdeas] = useState<SessionIdea[]>([]);
  const [wildcards, setWildcards] = useState<SessionWildcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);

  // Create a new session
  const createSession = useCallback(async (name: string) => {
    setIsLoading(true);
    try {
      const code = generateSessionCode();
      const { data, error } = await supabase
        .from('sessions')
        .insert({ name, code })
        .select()
        .single();

      if (error) throw error;
      setSession(data);
      toast.success(`Session "${name}" created!`);
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Join an existing session
  const joinSession = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('code', code.toUpperCase())
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error('Session not found');
        return null;
      }

      setSession(data);
      toast.success(`Joined "${data.name}"!`);
      return data;
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error('Failed to join session');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Leave the current session
  const leaveSession = useCallback(() => {
    setSession(null);
    setIdeas([]);
    setWildcards([]);
    setParticipantCount(1);
  }, []);

  // Fetch session data
  const fetchSessionData = useCallback(async () => {
    if (!session) return;

    try {
      const [ideasResult, wildcardsResult] = await Promise.all([
        supabase
          .from('session_ideas')
          .select('*')
          .eq('session_id', session.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('session_wildcards')
          .select('*')
          .eq('session_id', session.id)
          .order('created_at', { ascending: true }),
      ]);

      if (ideasResult.data) setIdeas(ideasResult.data);
      if (wildcardsResult.data) {
        setWildcards(wildcardsResult.data.map(w => ({
          ...w,
          category: w.category as 'insight' | 'asset' | 'tech' | 'random'
        })));
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
    }
  }, [session]);

  // Add idea to session
  const addIdea = useCallback(
    async (
      title: string,
      description: string,
      authorName: string | undefined,
      cards: { insight: string; asset: string; tech: string; random: string }
    ) => {
      if (!session) return null;

      try {
        const { data, error } = await supabase
          .from('session_ideas')
          .insert({
            session_id: session.id,
            title,
            description: description || null,
            author_name: authorName || null,
            card_insight: cards.insight,
            card_asset: cards.asset,
            card_tech: cards.tech,
            card_random: cards.random,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error adding idea:', error);
        toast.error('Failed to save idea');
        return null;
      }
    },
    [session]
  );

  // Delete idea from session
  const deleteIdea = useCallback(async (ideaId: string) => {
    try {
      const { error } = await supabase
        .from('session_ideas')
        .delete()
        .eq('id', ideaId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast.error('Failed to delete idea');
    }
  }, []);

  // Add wildcard to session
  const addWildcard = useCallback(
    async (text: string, category: 'insight' | 'asset' | 'tech' | 'random') => {
      if (!session) return null;

      try {
        const { data, error } = await supabase
          .from('session_wildcards')
          .insert({
            session_id: session.id,
            text,
            category,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error adding wildcard:', error);
        toast.error('Failed to add wildcard');
        return null;
      }
    },
    [session]
  );

  // Delete wildcard from session
  const deleteWildcard = useCallback(async (wildcardId: string) => {
    try {
      const { error } = await supabase
        .from('session_wildcards')
        .delete()
        .eq('id', wildcardId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting wildcard:', error);
      toast.error('Failed to delete wildcard');
    }
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!session) return;

    fetchSessionData();

    // Subscribe to ideas changes
    const ideasChannel = supabase
      .channel(`session-ideas-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_ideas',
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          console.log('Ideas change:', payload);
          if (payload.eventType === 'INSERT') {
            setIdeas((prev) => [payload.new as SessionIdea, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setIdeas((prev) => prev.filter((i) => i.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Subscribe to wildcards changes
    const wildcardsChannel = supabase
      .channel(`session-wildcards-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_wildcards',
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          console.log('Wildcards change:', payload);
          if (payload.eventType === 'INSERT') {
            const newWildcard = payload.new as SessionWildcard;
            setWildcards((prev) => [...prev, {
              ...newWildcard,
              category: newWildcard.category as 'insight' | 'asset' | 'tech' | 'random'
            }]);
          } else if (payload.eventType === 'DELETE') {
            setWildcards((prev) => prev.filter((w) => w.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Presence for participant count
    const presenceChannel = supabase
      .channel(`session-presence-${session.id}`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const count = Object.keys(state).reduce(
          (sum, key) => sum + state[key].length,
          0
        );
        setParticipantCount(Math.max(1, count));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(ideasChannel);
      supabase.removeChannel(wildcardsChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [session, fetchSessionData]);

  return {
    session,
    ideas,
    wildcards,
    isLoading,
    participantCount,
    createSession,
    joinSession,
    leaveSession,
    addIdea,
    deleteIdea,
    addWildcard,
    deleteWildcard,
  };
}
