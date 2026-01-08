import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Lightbulb, Wand2, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingActionBarProps {
  hasAnyCard: boolean;
  hasAllCards: boolean;
  isShuffling: boolean;
  isAILoading: boolean;
  canPlay: boolean;
  onShuffle: () => void;
  onTwist: () => void;
  onAISuggest: () => void;
  onClear: () => void;
}

export function FloatingActionBar({
  hasAnyCard,
  hasAllCards,
  isShuffling,
  isAILoading,
  canPlay,
  onShuffle,
  onTwist,
  onAISuggest,
  onClear,
}: FloatingActionBarProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-background/95 backdrop-blur-sm border-t border-border',
        'px-4 py-3 safe-area-pb'
      )}
    >
      <div className="container mx-auto max-w-lg">
        <div className="flex items-center justify-center gap-2">
          <AnimatePresence mode="wait">
            {!hasAnyCard ? (
              <motion.div
                key="shuffle-primary"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1"
              >
                <Button
                  size="lg"
                  onClick={onShuffle}
                  disabled={isShuffling || !canPlay}
                  className="w-full gap-3 py-6 text-base font-mono uppercase tracking-wider"
                >
                  <Shuffle className={cn('w-5 h-5', isShuffling && 'animate-spin')} />
                  Shuffle
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="action-group"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-2 w-full"
              >
                {/* Reshuffle */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onShuffle}
                  disabled={isShuffling || !canPlay}
                  className="gap-2 font-mono text-xs uppercase tracking-wider flex-shrink-0"
                >
                  <Shuffle className={cn('w-4 h-4', isShuffling && 'animate-spin')} />
                  <span className="hidden sm:inline">Reshuffle</span>
                </Button>

                {/* TWIST - Primary action when all cards are drawn */}
                {hasAllCards && (
                  <Button
                    size="lg"
                    onClick={onTwist}
                    className="gap-2 flex-1 py-6 font-mono uppercase tracking-wider bg-foreground text-background hover:bg-foreground/90"
                  >
                    <Lightbulb className="w-5 h-5" />
                    TWIST
                  </Button>
                )}

                {/* AI Suggest */}
                {hasAllCards && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onAISuggest}
                    disabled={isAILoading}
                    className="gap-2 font-mono text-xs uppercase tracking-wider flex-shrink-0"
                  >
                    {isAILoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">AI</span>
                  </Button>
                )}

                {/* Clear */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClear}
                  className="flex-shrink-0 text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
