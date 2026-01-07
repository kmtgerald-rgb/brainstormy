import { motion } from 'framer-motion';
import { Clock, Target, Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { GameMode, GameSettings } from '@/hooks/useGameMode';

interface GameEndModalProps {
  isOpen: boolean;
  mode: GameMode;
  settings: GameSettings;
  ideasCount: number;
  elapsedTime: number;
  formatTime: (seconds: number) => string;
  onClose: () => void;
  onPlayAgain: () => void;
  onViewIdeas: () => void;
}

export function GameEndModal({
  isOpen,
  mode,
  settings,
  ideasCount,
  elapsedTime,
  formatTime,
  onClose,
  onPlayAgain,
  onViewIdeas,
}: GameEndModalProps) {
  const isTargetMode = mode === 'target';
  const targetReached = isTargetMode && ideasCount >= settings.targetCount;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 border-border overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-12 px-8 text-center space-y-8"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="w-20 h-20 mx-auto rounded-full bg-foreground flex items-center justify-center"
          >
            {isTargetMode ? (
              targetReached ? (
                <Target className="w-10 h-10 text-background" />
              ) : (
                <Target className="w-10 h-10 text-background opacity-50" />
              )
            ) : (
              <Clock className="w-10 h-10 text-background" />
            )}
          </motion.div>

          {/* Title */}
          <div className="space-y-2">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-serif text-3xl"
            >
              {isTargetMode
                ? targetReached
                  ? '🎯 Target Hit'
                  : 'Session Ended'
                : "Time's Up"}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground"
            >
              {isTargetMode
                ? targetReached
                  ? `${ideasCount} ideas in ${formatTime(elapsedTime)}`
                  : `${ideasCount} of ${settings.targetCount} ideas generated`
                : `You generated ${ideasCount} idea${ideasCount !== 1 ? 's' : ''}`}
            </motion.p>

            {mode === 'time-attack' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="font-mono text-sm text-muted-foreground"
              >
                in {settings.duration / 60} minutes
              </motion.p>
            )}
          </div>

          {/* Stats card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-muted/50 rounded-sm p-4"
          >
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="font-serif text-3xl">{ideasCount}</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Ideas
                </div>
              </div>
              <div className="text-center">
                <div className="font-serif text-3xl">{formatTime(elapsedTime)}</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Time
                </div>
              </div>
              {ideasCount > 0 && (
                <div className="text-center">
                  <div className="font-serif text-3xl">
                    {Math.round(elapsedTime / ideasCount)}s
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Per Idea
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-3"
          >
            <Button
              variant="outline"
              onClick={onPlayAgain}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </Button>
            <Button
              onClick={onViewIdeas}
              className="gap-2"
            >
              View Ideas
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
