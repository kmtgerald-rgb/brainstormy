import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, RotateCcw, Wand2, Loader2, X, ArrowRight, Lightbulb } from 'lucide-react';
import { Card, Category, categoryShortLabels } from '@/data/defaultCards';
import { MashupCard } from './MashupCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAISuggestion } from '@/hooks/useAISuggestion';
import { useCardExplanation } from '@/hooks/useCardExplanation';

interface ShuffleAreaProps {
  selectedCards: Record<Category, Card | null>;
  onShuffle: () => void;
  onTwist: () => void;
  onClear: () => void;
  problemStatement?: string | null;
  canPlay?: boolean;
}

const categories: Category[] = ['insight', 'asset', 'tech', 'random'];

const categoryAccentStyles: Record<Category, string> = {
  insight: 'border-l-[hsl(var(--category-insight))]',
  asset: 'border-l-[hsl(var(--category-asset))]',
  tech: 'border-l-[hsl(var(--category-tech))]',
  random: 'border-l-[hsl(var(--category-random))]',
};

export function ShuffleArea({ 
  selectedCards, 
  onShuffle, 
  onTwist, 
  onClear, 
  problemStatement,
  canPlay = true
}: ShuffleAreaProps) {
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);
  const hasAllCards = categories.every((cat) => selectedCards[cat] !== null);
  const hasAnyCard = categories.some((cat) => selectedCards[cat] !== null);
  
  const { suggestion, isLoading: isAILoading, getSuggestion, clearSuggestion } = useAISuggestion();
  const { getExplanation, getState, prefetchExplanations } = useCardExplanation();

  // Pre-fetch explanations when cards are drawn
  useEffect(() => {
    const cards = Object.values(selectedCards).filter((card): card is Card => card !== null);
    if (cards.length > 0) {
      prefetchExplanations(cards);
    }
  }, [selectedCards, prefetchExplanations]);

  const handleShuffle = () => {
    setIsShuffling(true);
    clearSuggestion();
    setTimeout(() => {
      onShuffle();
      setShuffleKey((k) => k + 1);
      setIsShuffling(false);
    }, 200);
  };

  const handleClear = () => {
    clearSuggestion();
    onClear();
  };

  const handleGetSuggestion = () => {
    getSuggestion(selectedCards, problemStatement);
  };

  const handleCardFlip = (card: Card) => {
    getExplanation(card);
  };

  return (
    <div className="text-center space-y-12">
      {/* Hero text - only show when no cards */}
      <AnimatePresence>
        {!hasAnyCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h2 className="font-serif text-4xl md:text-5xl">Draw the unexpected.</h2>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
              Four forces. One idea.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {categories.map((category, index) => (
            <motion.div
              key={`${category}-${shuffleKey}`}
              initial={isShuffling ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
            >
              {selectedCards[category] ? (
                <MashupCard
                  card={selectedCards[category]!}
                  size="lg"
                  animate={true}
                  delay={index * 0.08}
                  flippable={true}
                  explanation={getState(selectedCards[category]!.id).text}
                  explanationLoading={getState(selectedCards[category]!.id).loading}
                  onFlip={() => handleCardFlip(selectedCards[category]!)}
                />
              ) : (
                <div
                  className={cn(
                    'aspect-[3/4] border border-dashed border-border/60 border-l-[3px] border-l-solid p-6 flex flex-col justify-end bg-muted/30',
                    categoryAccentStyles[category]
                  )}
                >
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {categoryShortLabels[category]}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* AI Suggestion Display */}
      <AnimatePresence>
        {suggestion && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="relative mx-auto max-w-2xl p-6 bg-card border border-border card-shadow"
          >
            <button
              onClick={clearSuggestion}
              className="absolute top-4 right-4 p-1 rounded hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="space-y-3 text-left">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                AI Suggestion
              </span>
              <h3 className="font-serif text-2xl">
                {suggestion.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {suggestion.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Action */}
      <div className="flex flex-col items-center gap-4">
        {!hasAnyCard ? (
          <Button
            size="lg"
            onClick={handleShuffle}
            disabled={isShuffling || !canPlay}
            className="gap-3 px-12 py-6 text-lg font-mono uppercase tracking-wider"
          >
            <Shuffle className={cn('w-5 h-5', isShuffling && 'animate-spin')} />
            Shuffle
          </Button>
        ) : (
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {hasAllCards && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button
                  size="lg"
                  onClick={onTwist}
                  className="gap-3 px-10 py-6 text-lg font-mono uppercase tracking-wider bg-foreground text-background hover:bg-foreground/90"
                >
                  <Lightbulb className="w-5 h-5" />
                  TWIST
                </Button>
              </motion.div>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={handleShuffle}
              disabled={isShuffling || !canPlay}
              className="gap-2 font-mono text-xs uppercase tracking-wider"
            >
              <Shuffle className={cn('w-4 h-4', isShuffling && 'animate-spin')} />
              Reshuffle
            </Button>
            {hasAllCards && (
              <Button
                variant="ghost"
                size="lg"
                onClick={handleGetSuggestion}
                disabled={isAILoading}
                className="gap-2 font-mono text-xs uppercase tracking-wider"
              >
                {isAILoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                AI Suggest
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
