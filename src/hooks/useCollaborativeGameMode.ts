import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GameMode, GameSettings } from './useGameMode';

export interface SessionScore {
  id: string;
  session_id: string;
  participant_name: string;
  score: number;
  created_at: string;
  updated_at: string;
}

export interface CollaborativeGameState {
  mode: GameMode;
  settings: GameSettings;
  startedAt: Date | null;
  endsAt: Date | null;
}

export function useCollaborativeGameMode(sessionId: string | null, participantName: string) {
  const [gameState, setGameState] = useState<CollaborativeGameState | null>(null);
  const [scores, setScores] = useState<SessionScore[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch current game state from session
  const fetchGameState = useCallback(async () => {
    if (!sessionId) return;

    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('game_mode, game_settings, game_started_at, game_ends_at')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      // Cast the data since types might not be updated yet
      const sessionData = data as unknown as {
        game_mode: string;
        game_settings: GameSettings;
        game_started_at: string | null;
        game_ends_at: string | null;
      };

      setGameState({
        mode: (sessionData.game_mode || 'freejam') as GameMode,
        settings: sessionData.game_settings || { duration: 300, targetCount: 10 },
        startedAt: sessionData.game_started_at ? new Date(sessionData.game_started_at) : null,
        endsAt: sessionData.game_ends_at ? new Date(sessionData.game_ends_at) : null,
      });
    } catch (error) {
      console.error('Error fetching game state:', error);
    }
  }, [sessionId]);

  // Fetch scores
  const fetchScores = useCallback(async () => {
    if (!sessionId) return;

    try {
      const { data, error } = await supabase
        .from('session_scores')
        .select('*')
        .eq('session_id', sessionId)
        .order('score', { ascending: false });

      if (error) throw error;
      setScores((data as SessionScore[]) || []);
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  }, [sessionId]);

  // Update game mode for the session (moderator action)
  const updateGameMode = useCallback(
    async (mode: GameMode) => {
      if (!sessionId) return;

      try {
        const updateData = { game_mode: mode } as Record<string, unknown>;
        const { error } = await supabase
          .from('sessions')
          .update(updateData as never)
          .eq('id', sessionId);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating game mode:', error);
        toast.error('Failed to update game mode');
      }
    },
    [sessionId]
  );

  // Update game settings
  const updateGameSettings = useCallback(
    async (settings: Partial<GameSettings>) => {
      if (!sessionId || !gameState) return;

      try {
        const newSettings = { ...gameState.settings, ...settings };
        const updateData = { game_settings: newSettings } as Record<string, unknown>;
        const { error } = await supabase
          .from('sessions')
          .update(updateData as never)
          .eq('id', sessionId);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating game settings:', error);
        toast.error('Failed to update settings');
      }
    },
    [sessionId, gameState]
  );

  // Start the game
  const startGame = useCallback(async () => {
    if (!sessionId || !gameState) return;

    const now = new Date();
    const endsAt =
      gameState.mode === 'time-attack' || gameState.mode === 'competition'
        ? new Date(now.getTime() + gameState.settings.duration * 1000)
        : null;

    try {
      // Clear previous scores
      await supabase.from('session_scores').delete().eq('session_id', sessionId);

      const updateData = {
        game_started_at: now.toISOString(),
        game_ends_at: endsAt?.toISOString() || null,
      } as Record<string, unknown>;

      const { error } = await supabase
        .from('sessions')
        .update(updateData as never)
        .eq('id', sessionId);

      if (error) throw error;
      toast.success('Game started!');
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error('Failed to start game');
    }
  }, [sessionId, gameState]);

  // End the game
  const endGame = useCallback(async () => {
    if (!sessionId) return;

    try {
      const updateData = {
        game_started_at: null,
        game_ends_at: null,
      } as Record<string, unknown>;

      const { error } = await supabase
        .from('sessions')
        .update(updateData as never)
        .eq('id', sessionId);

      if (error) throw error;
      setShowEndModal(true);
    } catch (error) {
      console.error('Error ending game:', error);
      toast.error('Failed to end game');
    }
  }, [sessionId]);

  // Increment score for participant
  const incrementScore = useCallback(async () => {
    if (!sessionId || !participantName) return;

    try {
      // Try to upsert the score
      const { data: existing } = await supabase
        .from('session_scores')
        .select('id, score')
        .eq('session_id', sessionId)
        .eq('participant_name', participantName)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('session_scores')
          .update({ score: existing.score + 1, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase.from('session_scores').insert({
          session_id: sessionId,
          participant_name: participantName,
          score: 1,
        });
      }
    } catch (error) {
      console.error('Error incrementing score:', error);
    }
  }, [sessionId, participantName]);

  // Close end modal
  const closeEndModal = useCallback(() => {
    setShowEndModal(false);
  }, []);

  // Timer logic
  useEffect(() => {
    if (!gameState?.startedAt || !gameState?.endsAt) {
      setTimeRemaining(0);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const remaining = Math.max(0, Math.floor((gameState.endsAt!.getTime() - now.getTime()) / 1000));
      setTimeRemaining(remaining);

      if (remaining <= 0 && gameState.startedAt) {
        // Game ended
        setShowEndModal(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState?.startedAt, gameState?.endsAt]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!sessionId) return;

    fetchGameState();
    fetchScores();

    // Subscribe to session updates for game state
    const sessionChannel = supabase
      .channel(`session-game-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const updated = payload.new as {
            game_mode: string;
            game_settings: GameSettings;
            game_started_at: string | null;
            game_ends_at: string | null;
          };

          const wasRunning = gameState?.startedAt !== null;
          const isNowRunning = updated.game_started_at !== null;

          setGameState({
            mode: (updated.game_mode || 'freejam') as GameMode,
            settings: updated.game_settings || { duration: 300, targetCount: 10 },
            startedAt: updated.game_started_at ? new Date(updated.game_started_at) : null,
            endsAt: updated.game_ends_at ? new Date(updated.game_ends_at) : null,
          });

          // Show toast when game starts
          if (!wasRunning && isNowRunning) {
            toast.success('Game started!');
          }
        }
      )
      .subscribe();

    // Subscribe to scores updates
    const scoresChannel = supabase
      .channel(`session-scores-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_scores',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          fetchScores();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(scoresChannel);
    };
  }, [sessionId, fetchGameState, fetchScores]);

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Derived state
  const isRunning = gameState?.startedAt !== null && (gameState?.endsAt === null || timeRemaining > 0);
  const myScore = scores.find((s) => s.participant_name === participantName)?.score || 0;
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  return {
    // State
    mode: gameState?.mode || 'freejam',
    settings: gameState?.settings || { duration: 300, targetCount: 10 },
    isRunning,
    timeRemaining,
    scores: sortedScores,
    myScore,
    showEndModal,

    // Actions
    updateGameMode,
    updateGameSettings,
    startGame,
    endGame,
    incrementScore,
    closeEndModal,

    // Helpers
    formatTime,
  };
}
