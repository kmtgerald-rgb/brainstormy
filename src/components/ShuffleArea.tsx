import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Sparkles, RotateCcw } from 'lucide-react';
import { Card, Category, categoryLabels } from '@/data/defaultCards';
import { MashupCard } from './MashupCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ShuffleAreaProps {
  selectedCards: Record<Category, Card | null>;
  onShuffle: () => void;
  onTwist: () => void;
  onClear: () => void;
}

const categories: Category[] = ['insight', 'asset', 'tech', 'random'];

const slotColors: Record<Category, string> = {
  insight: 'border-category-insight/30 bg-category-insight-light/50',
  asset: 'border-category-asset/30 bg-category-asset-light/50',
  tech: 'border-category-tech/30 bg-category-tech-light/50',
  random: 'border-category-random/30 bg-category-random-light/50',
};

export function ShuffleArea({ selectedCards, onShuffle, onTwist, onClear }: ShuffleAreaProps) {
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);
  const hasAllCards = categories.every((cat) => selectedCards[cat] !== null);
  const hasAnyCard = categories.some((cat) => selectedCards[cat] !== null);

  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      onShuffle();
      setShuffleKey((k) => k + 1);
      setIsShuffling(false);
    }, 300);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="font-display text-3xl font-bold">Draw Your Cards</h2>
        <p className="text-muted-foreground">
          Shuffle to randomly draw one card from each category
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <AnimatePresence mode="wait">
          {categories.map((category, index) => (
            <motion.div
              key={`${category}-${shuffleKey}`}
              initial={isShuffling ? { rotateY: 90, opacity: 0 } : false}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {selectedCards[category] ? (
                <MashupCard
                  card={selectedCards[category]!}
                  size="lg"
                  animate={true}
                  delay={index * 0.1}
                />
              ) : (
                <div
                  className={cn(
                    'rounded-lg border-2 border-dashed p-6 min-h-[160px] flex flex-col items-center justify-center',
                    slotColors[category]
                  )}
                >
                  <p className="text-sm font-medium text-muted-foreground text-center">
                    {categoryLabels[category]}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-4 flex-wrap">
        <Button
          size="lg"
          onClick={handleShuffle}
          disabled={isShuffling}
          className="gap-2 px-8"
        >
          <Shuffle className={cn('w-5 h-5', isShuffling && 'animate-spin')} />
          Shuffle Cards
        </Button>

        {hasAllCards && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Button
              size="lg"
              onClick={onTwist}
              className="gap-2 px-8 bg-gradient-to-r from-category-insight via-category-tech to-category-random text-primary-foreground hover:opacity-90"
            >
              <Sparkles className="w-5 h-5" />
              TWIST!
            </Button>
          </motion.div>
        )}

        {hasAnyCard && (
          <Button size="lg" variant="outline" onClick={onClear} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
