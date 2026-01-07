import { useState, useCallback, useEffect, useRef } from 'react';

export type GameMode = 'freejam' | 'time-attack' | 'target' | 'competition';
export type SoloGameMode = Exclude<GameMode, 'competition'>;

export interface GameSettings {
  duration: number; // seconds
  targetCount: number;
}

export interface GameState {
  mode: GameMode;
  settings: GameSettings;
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number;
  ideasCount: number;
  startedAt: Date | null;
  endedAt: Date | null;
}

const DEFAULT_SETTINGS: GameSettings = {
  duration: 300, // 5 minutes
  targetCount: 10,
};

export function useGameMode(isCollaborative: boolean = false) {
  const [mode, setMode] = useState<GameMode>('freejam');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [ideasCount, setIdeasCount] = useState(0);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [endedAt, setEndedAt] = useState<Date | null>(null);
  const [showEndModal, setShowEndModal] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Available modes based on solo/collaborative
  const availableModes: GameMode[] = isCollaborative
    ? ['freejam', 'time-attack', 'target', 'competition']
    : ['freejam', 'time-attack', 'target'];

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused && (mode === 'time-attack' || mode === 'competition')) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up!
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isRunning, isPaused, mode]);

  const changeMode = useCallback((newMode: GameMode) => {
    if (isRunning) return; // Can't change mode while game is running
    setMode(newMode);
    setIdeasCount(0);
    setTimeRemaining(0);
    setStartedAt(null);
    setEndedAt(null);
  }, [isRunning]);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    if (isRunning) return;
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, [isRunning]);

  const startGame = useCallback(() => {
    if (mode === 'freejam') return; // Freejam doesn't need starting
    
    setIsRunning(true);
    setIsPaused(false);
    setIdeasCount(0);
    setStartedAt(new Date());
    setEndedAt(null);
    setShowEndModal(false);

    if (mode === 'time-attack' || mode === 'competition') {
      setTimeRemaining(settings.duration);
    }
  }, [mode, settings.duration]);

  const pauseGame = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeGame = useCallback(() => {
    setIsPaused(false);
  }, []);

  const endGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setEndedAt(new Date());
    setShowEndModal(true);
  }, []);

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(0);
    setIdeasCount(0);
    setStartedAt(null);
    setEndedAt(null);
    setShowEndModal(false);
  }, []);

  const incrementIdeas = useCallback(() => {
    setIdeasCount((prev) => {
      const newCount = prev + 1;
      // Check if target reached in target mode
      if (mode === 'target' && newCount >= settings.targetCount && isRunning) {
        setTimeout(() => endGame(), 100);
      }
      return newCount;
    });
  }, [mode, settings.targetCount, isRunning, endGame]);

  const closeEndModal = useCallback(() => {
    setShowEndModal(false);
  }, []);

  // Calculate elapsed time for display
  const getElapsedTime = useCallback(() => {
    if (!startedAt) return 0;
    const end = endedAt || new Date();
    return Math.floor((end.getTime() - startedAt.getTime()) / 1000);
  }, [startedAt, endedAt]);

  // Format time for display (mm:ss)
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Check if game requires start button
  const requiresStart = mode !== 'freejam';

  // Check if game is in a "playable" state (can shuffle/twist)
  const canPlay = mode === 'freejam' || isRunning;

  return {
    // State
    mode,
    settings,
    isRunning,
    isPaused,
    timeRemaining,
    ideasCount,
    startedAt,
    endedAt,
    showEndModal,
    availableModes,
    requiresStart,
    canPlay,

    // Actions
    changeMode,
    updateSettings,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    resetGame,
    incrementIdeas,
    closeEndModal,

    // Helpers
    getElapsedTime,
    formatTime,
  };
}
