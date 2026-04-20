import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, RotateCcw, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingActionBarProps {
  hasAnyCard: boolean;
  isShuffling: boolean;
  canPlay: boolean;
  onShuffle: () => void;
  onClear: () => void;
}

export function FloatingActionBar({
  hasAnyCard,
  isShuffling,
  canPlay,
  onShuffle,
  onClear,
}: FloatingActionBarProps) {
  const { t } = useTranslation();
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
                  {t('shuffle.shuffle')}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="action-group"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-2"
              >
                {/* Reshuffle */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onShuffle}
                  disabled={isShuffling || !canPlay}
                  className="gap-2 font-mono text-xs uppercase tracking-wider"
                >
                  <RotateCcw className={cn('w-4 h-4', isShuffling && 'animate-spin')} />
                  <span className="hidden sm:inline">{t('shuffle.reshuffle')}</span>
                </Button>

                {/* Clear */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClear}
                  disabled={isShuffling}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
