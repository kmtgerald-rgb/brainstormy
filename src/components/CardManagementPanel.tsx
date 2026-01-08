import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles, Eye, Edit2, RefreshCw, Loader2 } from 'lucide-react';
import { Card, Category, categoryLabels } from '@/data/defaultCards';
import { DeckConfig, InsightVariant, TechVariant, catalystVariantLabels, insightVariantLabels } from '@/data/deckVariants';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CardManagementPanelProps {
  deckConfig: DeckConfig;
  generatedInsightCards?: Card[];
  onEditCard?: (card: Card) => void;
  onRegenerateDeck?: (type: 'industry' | 'region', context: string, forceRegenerate?: boolean) => Promise<void>;
  isGenerating?: boolean;
}

const categoryColors: Record<Category, string> = {
  insight: 'border-l-[hsl(var(--category-insight))]',
  asset: 'border-l-[hsl(var(--category-asset))]',
  tech: 'border-l-[hsl(var(--category-tech))]',
  random: 'border-l-[hsl(var(--category-random))]',
};

export function CardManagementPanel({
  deckConfig,
  generatedInsightCards,
  onEditCard,
  onRegenerateDeck,
  isGenerating = false,
}: CardManagementPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'insight' | 'tech'>('insight');

  const insightVariant = deckConfig.insight.variant;
  const techVariant = deckConfig.tech.variant;

  const hasGeneratedCards = insightVariant !== 'general' && generatedInsightCards && generatedInsightCards.length > 0;

  const getCurrentLabel = () => {
    if (selectedCategory === 'insight') {
      return insightVariantLabels[insightVariant];
    }
    return catalystVariantLabels[techVariant];
  };

  const getContextInfo = () => {
    if (selectedCategory === 'insight') {
      if (insightVariant === 'industry' && deckConfig.insight.industryName) {
        return deckConfig.insight.industryName;
      }
      if (insightVariant === 'region' && deckConfig.insight.regionName) {
        return deckConfig.insight.regionName;
      }
    }
    return null;
  };

  const contextInfo = getContextInfo();

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between py-2 px-3 rounded-md',
          'text-left font-mono text-[10px] uppercase tracking-wider',
          'text-muted-foreground hover:text-foreground hover:bg-muted/50',
          'transition-colors'
        )}
      >
        <span className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5" />
          Preview Active Decks
        </span>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 py-3 px-3 bg-muted/30 rounded-md">
              {/* Category Tabs */}
              <div className="flex border border-border overflow-hidden rounded-sm">
                <button
                  onClick={() => setSelectedCategory('insight')}
                  className={cn(
                    'flex-1 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors',
                    selectedCategory === 'insight'
                      ? 'bg-foreground text-background'
                      : 'bg-background text-foreground hover:bg-muted'
                  )}
                >
                  Insight
                </button>
                <button
                  onClick={() => setSelectedCategory('tech')}
                  className={cn(
                    'flex-1 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors',
                    selectedCategory === 'tech'
                      ? 'bg-foreground text-background'
                      : 'bg-background text-foreground hover:bg-muted'
                  )}
                >
                  Catalyst
                </button>
              </div>

              {/* Current Deck Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{getCurrentLabel()}</span>
                    {contextInfo && (
                      <span className="text-xs text-muted-foreground">({contextInfo})</span>
                    )}
                    {selectedCategory === 'insight' && insightVariant !== 'general' && hasGeneratedCards && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-mono uppercase tracking-wider rounded">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI
                      </span>
                    )}
                  </div>
                  
                  {/* Regenerate button for AI decks */}
                  {selectedCategory === 'insight' && insightVariant !== 'general' && onRegenerateDeck && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const context = insightVariant === 'industry' 
                          ? deckConfig.insight.industryName 
                          : deckConfig.insight.regionName;
                        if (context) {
                          onRegenerateDeck(insightVariant as 'industry' | 'region', context, true);
                        }
                      }}
                      disabled={isGenerating}
                      className="h-7 px-2"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Card Preview */}
                {selectedCategory === 'insight' && hasGeneratedCards && (
                  <ScrollArea className="h-40">
                    <div className="space-y-1">
                      {generatedInsightCards?.slice(0, 10).map((card, index) => (
                        <div
                          key={card.id}
                          className={cn(
                            'flex items-center justify-between p-2 bg-background border-l-2 rounded-sm',
                            'text-xs hover:bg-muted/50 transition-colors group',
                            categoryColors[card.category]
                          )}
                        >
                          <span className="flex-1 truncate pr-2">{card.text}</span>
                          {onEditCard && (
                            <button
                              onClick={() => onEditCard(card)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                            >
                              <Edit2 className="w-3 h-3 text-muted-foreground" />
                            </button>
                          )}
                        </div>
                      ))}
                      {generatedInsightCards && generatedInsightCards.length > 10 && (
                        <p className="text-[10px] text-muted-foreground text-center py-2">
                          +{generatedInsightCards.length - 10} more cards
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                )}

                {selectedCategory === 'insight' && insightVariant === 'general' && (
                  <p className="text-xs text-muted-foreground">
                    Using default human truth insights. Select Industry or Regional variant in Deck Configuration to generate custom cards.
                  </p>
                )}

                {selectedCategory === 'insight' && insightVariant !== 'general' && !hasGeneratedCards && (
                  <p className="text-xs text-muted-foreground">
                    No cards generated yet. Enter a context and click Generate above.
                  </p>
                )}

                {selectedCategory === 'tech' && (
                  <p className="text-xs text-muted-foreground">
                    Using static {catalystVariantLabels[techVariant].toLowerCase()} cards. Edit individual cards in the Card Library.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
