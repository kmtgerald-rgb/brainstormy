import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Target, Zap, Trophy, Play, Pause, RotateCcw, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GameMode, GameSettings } from '@/hooks/useGameMode';
import { SessionScore } from '@/hooks/useCollaborativeGameMode';
import { CompetitionLeaderboard } from './CompetitionLeaderboard';
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
  // Competition mode props
  scores?: SessionScore[];
  currentParticipant?: string;
  isCollaborative?: boolean;
}

const modeLabels: Record<GameMode, string> = {
  freejam: 'FREEJAM',
  'time-attack': 'TIME ATTACK',
  target: 'TARGET',
  competition: 'COMPETITION',
};

const modeIcons: Record<GameMode, typeof Zap> = {
  freejam: Zap,
  'time-attack': Clock,
  target: Target,
  competition: Trophy,
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
  onReset,
  scores = [],
  currentParticipant = '',
  isCollaborative = false,
}: GameHUDProps) {
  const Icon = modeIcons[mode];

  // Calculate progress based on mode
  const getProgress = () => {
    if (mode === 'time-attack' || mode === 'competition') {
      return ((settings.duration - timeRemaining) / settings.duration) * 100;
    }
    if (mode === 'target') {
      return (ideasCount / settings.targetCount) * 100;
    }
    return 0;
  };

  // Time warning states
  const isTimeWarning = (mode === 'time-attack' || mode === 'competition') && timeRemaining <= 60 && timeRemaining > 0;
  const isTimeCritical = (mode === 'time-attack' || mode === 'competition') && timeRemaining <= 10 && timeRemaining > 0;

  if (mode === 'freejam') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-sm">
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {modeLabels[mode]}
            </span>
          </div>
          <div className="font-mono text-sm">
            Ideas: <span className="font-semibold">{ideasCount}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4" />
            <span className="font-mono text-xs uppercase tracking-wider">
              {modeLabels[mode]}
              {mode === 'target' && `: ${settings.targetCount} IDEAS`}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer display for time-based modes */}
            {(mode === 'time-attack' || mode === 'competition') && (
              <div
                className={cn(
                  'flex items-center gap-2 font-mono text-lg tabular-nums',
                  isTimeCritical && 'text-destructive animate-pulse',
                  isTimeWarning && !isTimeCritical && 'text-amber-600'
                )}
              >
                <Clock className="w-4 h-4" />
                {formatTime(timeRemaining)}
              </div>
            )}

            {/* Ideas count */}
            <div className="font-mono text-sm">
              {mode === 'target' ? (
                <span>
                  <span className="text-lg font-semibold">{ideasCount}</span>
                  <span className="text-muted-foreground"> / {settings.targetCount}</span>
                </span>
              ) : mode === 'competition' ? (
                <span>
                  Your score: <span className="font-semibold">{scores.find(s => s.participant_name === currentParticipant)?.score || 0}</span>
                </span>
              ) : (
                <span>
                  Ideas: <span className="font-semibold">{ideasCount}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Competition Leaderboard */}
        {mode === 'competition' && isCollaborative && scores.length > 0 && (
          <div className="px-4 pb-3 border-t border-border pt-3">
            <CompetitionLeaderboard
              scores={scores}
              currentParticipant={currentParticipant}
              compact
            />
          </div>
        )}

        {/* Progress bar */}
        {isRunning && mode !== 'competition' && (
          <div className="px-4 pb-3">
            <Progress value={getProgress()} className="h-1.5" />
          </div>
        )}

        {/* Controls */}
        <AnimatePresence>
          {requiresStart && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border"
            >
              <div className="flex items-center justify-center gap-2 px-4 py-3">
                {!isRunning ? (
                  <Button
                    onClick={onStart}
                    size="sm"
                    className="gap-2 font-mono text-xs uppercase tracking-wider"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {mode === 'competition' ? 'Start Competition' : 'Start'}
                  </Button>
                ) : (
                  <>
                    {!isCollaborative && isPaused ? (
                      <Button
                        onClick={onResume}
                        size="sm"
                        variant="outline"
                        className="gap-2 font-mono text-xs uppercase tracking-wider"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Resume
                      </Button>
                    ) : !isCollaborative ? (
                      <Button
                        onClick={onPause}
                        size="sm"
                        variant="outline"
                        className="gap-2 font-mono text-xs uppercase tracking-wider"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        Pause
                      </Button>
                    ) : null}
                    <Button
                      onClick={onEnd}
                      size="sm"
                      variant="ghost"
                      className="gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      <Square className="w-3.5 h-3.5" />
                      End
                    </Button>
                    {!isCollaborative && (
                      <Button
                        onClick={onReset}
                        size="sm"
                        variant="ghost"
                        className="gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                      </Button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
