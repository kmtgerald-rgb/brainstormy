import { motion } from 'framer-motion';
import { Clock, Target, Zap, Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GameMode, GameSettings } from '@/hooks/useGameMode';
import { cn } from '@/lib/utils';

interface GameHUDProps {
  mode: GameMode;
  settings: GameSettings;
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number;
  ideasCount: number;
  requiresStart: boolean;
  formatTime: (seconds: number) => string;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onReset: () => void;
}

const modeConfig: Record<GameMode, { label: string; icon: typeof Zap }> = {
  freejam: { label: 'Freejam', icon: Zap },
  'time-attack': { label: 'Time Attack', icon: Clock },
  target: { label: 'Target', icon: Target },
};

export function GameHUD({
  mode,
  settings,
  isRunning,
  isPaused,
  timeRemaining,
  ideasCount,
  requiresStart,
  formatTime,
  onStart,
  onPause,
  onResume,
  onEnd,
}: GameHUDProps) {
  const config = modeConfig[mode];
  const Icon = config.icon;

  // For freejam mode, show nothing (return null)
  if (mode === 'freejam') {
    return null;
  }

  const showTimer = mode === 'time-attack';
  const showProgress = mode === 'target';
  const progress = showProgress ? (ideasCount / settings.targetCount) * 100 : 0;

  // Time warning states
  const isTimeWarning = showTimer && timeRemaining <= 60 && timeRemaining > 0;
  const isTimeCritical = showTimer && timeRemaining <= 10 && timeRemaining > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-6"
    >
      {/* Mode badge */}
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </div>

      {/* Timer or Progress */}
      {showTimer && (
        <div className={cn(
          'font-mono text-2xl font-semibold tabular-nums',
          isTimeCritical && 'text-destructive animate-pulse',
          isTimeWarning && !isTimeCritical && 'text-amber-600'
        )}>
          {formatTime(timeRemaining)}
        </div>
      )}

      {showProgress && (
        <div className="flex items-center gap-3">
          <Progress value={progress} className="w-32 h-2" />
          <span className="font-mono text-sm font-semibold">
            {ideasCount}/{settings.targetCount}
          </span>
        </div>
      )}

      {/* Controls */}
      {requiresStart && !isRunning && (
        <Button
          size="sm"
          onClick={onStart}
          className="gap-2 font-mono text-xs uppercase tracking-wider"
        >
          <Play className="w-3.5 h-3.5" />
          Start
        </Button>
      )}

      {isRunning && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={isPaused ? onResume : onPause}
            className="h-8 w-8"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEnd}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Square className="w-4 h-4" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}