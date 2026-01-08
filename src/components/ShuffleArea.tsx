import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Card, Category, categoryShortLabels } from '@/data/defaultCards';
import { MashupCard } from './MashupCard';
import { cn } from '@/lib/utils';
import { useCardExplanation } from '@/hooks/useCardExplanation';

interface ShuffleAreaProps {
  selectedCards: Record<Category, Card | null>;
  shuffleKey: number;
  isShuffling: boolean;
  suggestion?: { title: string; description: string } | null;
  onClearSuggestion: () => void;
  onAddSuggestionToIdeas?: () => void;
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
  shuffleKey,
  isShuffling,
  suggestion,
  onClearSuggestion,
  onAddSuggestionToIdeas,
}: ShuffleAreaProps) {
  const hasAnyCard = categories.some((cat) => selectedCards[cat] !== null);
  
  const { getExplanation, getState, prefetchExplanations } = useCardExplanation();

  // Pre-fetch explanations when cards are drawn
  useEffect(() => {
    const cards = Object.values(selectedCards).filter((card): card is Card => card !== null);
    if (cards.length > 0) {
      prefetchExplanations(cards);
    }
  }, [selectedCards, prefetchExplanations]);

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
              onClick={onClearSuggestion}
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
              {onAddSuggestionToIdeas && (
                <button
                  onClick={onAddSuggestionToIdeas}
                  className="mt-2 font-mono text-xs uppercase tracking-wider text-foreground/70 hover:text-foreground underline underline-offset-4 transition-colors"
                >
                  + Add to Ideas
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
