import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, RotateCcw, Wand2, Loader2, X, ArrowRight } from 'lucide-react';
import { Card, Category, categoryShortLabels } from '@/data/defaultCards';
import { MashupCard } from './MashupCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAISuggestion } from '@/hooks/useAISuggestion';
import { useCardExplanation } from '@/hooks/useCardExplanation';
import { useCardRegeneration } from '@/hooks/useCardRegeneration';

interface ShuffleAreaProps {
  selectedCards: Record<Category, Card | null>;
  allCards: Card[];
  onShuffle: () => void;
  onTwist: () => void;
  onClear: () => void;
  onReplaceCard: (category: Category, card: Card) => void;
  problemStatement?: string | null;
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
  allCards,
  onShuffle, 
  onTwist, 
  onClear, 
  onReplaceCard,
  problemStatement 
}: ShuffleAreaProps) {
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);
  const hasAllCards = categories.every((cat) => selectedCards[cat] !== null);
  const hasAnyCard = categories.some((cat) => selectedCards[cat] !== null);
  
  const { suggestion, isLoading: isAILoading, getSuggestion, clearSuggestion } = useAISuggestion();
  const { getExplanation, getState, prefetchExplanations } = useCardExplanation();
  const { isRegenerating, regenerateCard } = useCardRegeneration();

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

  const handleRegenerate = async (category: Category) => {
    const newCard = await regenerateCard(category, allCards, problemStatement);
    if (newCard) {
      onReplaceCard(category, newCard);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <h2 className="font-serif text-4xl md:text-5xl">Draw the unexpected.</h2>
        <p className="text-muted-foreground">
          Four forces. One idea.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
                  onRegenerate={() => handleRegenerate(category)}
                  isRegenerating={isRegenerating[category]}
                />
              ) : (
                <div
                  className={cn(
                    'border border-dashed border-border/60 border-l-[3px] border-l-solid p-6 min-h-[180px] flex flex-col justify-end bg-muted/30',
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
            <div className="space-y-3">
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

      {/* Actions */}
      <div className="flex justify-center gap-4 flex-wrap">
        <Button
          size="lg"
          onClick={handleShuffle}
          disabled={isShuffling}
          className="gap-3 px-8 h-14 text-base font-sans font-medium tracking-wide uppercase"
        >
          <Shuffle className={cn('w-5 h-5', isShuffling && 'animate-spin')} />
          Shuffle
        </Button>

        {hasAllCards && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="lg"
                variant="outline"
                onClick={handleGetSuggestion}
                disabled={isAILoading}
                className="gap-3 px-6 h-14 text-base font-sans font-medium"
              >
                {isAILoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Wand2 className="w-5 h-5" />
                )}
                {isAILoading ? 'Thinking...' : 'AI Suggest'}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.05 }}
            >
              <Button
                size="lg"
                onClick={onTwist}
                className="gap-3 px-8 h-14 text-base font-sans font-medium tracking-wide uppercase bg-foreground text-background hover:bg-foreground/90 animate-twist-pulse"
              >
                TWIST
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </>
        )}

        {hasAnyCard && (
          <Button 
            size="lg" 
            variant="ghost" 
            onClick={handleClear} 
            className="gap-2 h-14 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
