import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Layers } from 'lucide-react';
import { Card, Category, categoryShortLabels } from '@/data/defaultCards';
import { InsightVariant, TechVariant } from '@/data/deckVariants';
import { MashupCard } from './MashupCard';
import { InlineIdeaCapture } from './InlineIdeaCapture';
import { DeckSwitcher } from './DeckSwitcher';
import { DeckBrowserSheet } from './DeckBrowserSheet';
import { DeckPreset } from '@/hooks/useDeckManager';
import { cn } from '@/lib/utils';
import { useCardExplanation } from '@/hooks/useCardExplanation';

interface ShuffleAreaProps {
  selectedCards: Record<Category, Card | null>;
  shuffleKey: number;
  isShuffling: boolean;
  problemStatement?: string | null;
  onEditProblem?: () => void;
  // Inline idea capture props
  onSaveIdea?: (title: string, description: string, author?: string, isAIGenerated?: boolean) => void;
  onAISuggest?: () => void;
  aiSuggestion?: { title: string; description: string } | null;
  isAILoading?: boolean;
  autoAISuggest?: boolean;
  onAutoAISuggestChange?: (enabled: boolean) => void;
  // Deck switcher props
  insightVariant?: InsightVariant;
  insightContext?: string;
  catalystVariant?: TechVariant;
  hasGeneratedInsightCards?: boolean;
  isDeckGenerating?: boolean;
  onInsightChange?: (variant: InsightVariant, context?: string) => void;
  onCatalystChange?: (variant: TechVariant) => void;
  onGenerateDeck?: (forceRegenerate?: boolean, variant?: InsightVariant, context?: string) => void;
  // Deck browser props
  activePreset?: DeckPreset;
  wildcards?: Card[];
  getCardsForCategory?: (category: Category) => Card[];
  onAddWildcard?: (text: string, category: Category) => void;
  onRemoveWildcard?: (id: string) => void;
  onEditWildcard?: (id: string, text: string) => void;
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
  problemStatement,
  onEditProblem,
  onSaveIdea,
  onAISuggest,
  aiSuggestion,
  isAILoading = false,
  autoAISuggest = false,
  onAutoAISuggestChange,
  // Deck switcher props
  insightVariant = 'general',
  insightContext,
  catalystVariant = 'technology',
  hasGeneratedInsightCards = false,
  isDeckGenerating = false,
  onInsightChange,
  onCatalystChange,
  onGenerateDeck,
  // Deck browser props
  activePreset,
  wildcards = [],
  getCardsForCategory,
  onAddWildcard,
  onRemoveWildcard,
  onEditWildcard,
}: ShuffleAreaProps) {
  const hasAnyCard = categories.some((cat) => selectedCards[cat] !== null);
  const hasAllCards = categories.every((cat) => selectedCards[cat] !== null);
  
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
    <div className="text-center space-y-3 md:space-y-4">
      {/* Hero text + Problem Focus */}
      <div className="space-y-2">
        <AnimatePresence>
          {!hasAnyCard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <h2 className="font-serif text-4xl md:text-5xl">Draw the unexpected.</h2>
              <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
                Four forces. One idea.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inline Problem Focus */}
        <motion.button
          onClick={onEditProblem}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all max-w-xl',
            'font-mono text-xs uppercase tracking-wider',
            problemStatement 
              ? 'bg-foreground/5 text-foreground hover:bg-foreground/10 border border-border/50' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {problemStatement ? (
            <>
              <span className="max-w-lg text-center line-clamp-2 break-words">{problemStatement}</span>
              <Pencil className="w-3 h-3 flex-shrink-0 opacity-60" />
            </>
          ) : (
            <>
              <span>Free Brainstorm</span>
              <span className="text-muted-foreground/60">· Click to set focus</span>
            </>
          )}
        </motion.button>

        {/* Deck Browser - inline trigger */}
        {activePreset && getCardsForCategory && onAddWildcard && onRemoveWildcard && (
          <div className="flex justify-center">
            <DeckBrowserSheet
              activePreset={activePreset}
              wildcards={wildcards}
              getCardsForCategory={getCardsForCategory}
              onAddWildcard={onAddWildcard}
              onRemoveWildcard={onRemoveWildcard}
              onEditWildcard={onEditWildcard}
            />
          </div>
        )}
      </div>

      {/* Cards Grid - fixed height to prevent layout shift */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 max-w-5xl mx-auto min-h-[140px] md:min-h-[240px]">
        <AnimatePresence mode="popLayout">
          {categories.map((category, index) => (
            <motion.div
              key={`${category}-${shuffleKey}`}
              initial={isShuffling ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className="flex flex-col"
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
                    'aspect-[4/3] md:aspect-[3/4] border border-dashed border-border/40 border-l-[3px] border-l-solid p-4 flex flex-col justify-end bg-muted/20',
                    categoryAccentStyles[category]
                  )}
                >
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    {categoryShortLabels[category]}
                  </span>
                </div>
              )}
              
              {/* Deck Switcher - only for insight (index 0) and tech (index 2) */}
              {category === 'insight' && (
                <div className="mt-1 flex justify-center">
                  <DeckSwitcher
                    type="insight"
                    insightVariant={insightVariant}
                    insightContext={insightContext}
                    hasGeneratedCards={hasGeneratedInsightCards}
                    isGenerating={isDeckGenerating}
                    onInsightChange={onInsightChange}
                    onGenerate={onGenerateDeck}
                  />
                </div>
              )}
              {category === 'tech' && (
                <div className="mt-1 flex justify-center">
                  <DeckSwitcher
                    type="catalyst"
                    catalystVariant={catalystVariant}
                    onCatalystChange={onCatalystChange}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Inline Idea Capture */}
      {onSaveIdea && onAISuggest && (
        <InlineIdeaCapture
          isVisible={hasAllCards && !isShuffling}
          onSave={onSaveIdea}
          onAISuggest={onAISuggest}
          suggestion={aiSuggestion}
          isAILoading={isAILoading}
          autoAISuggest={autoAISuggest}
          onAutoAISuggestChange={onAutoAISuggestChange}
        />
      )}
    </div>
  );
}