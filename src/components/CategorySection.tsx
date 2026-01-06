import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Category, categoryLabels } from '@/data/defaultCards';
import { MashupCard } from './MashupCard';
import { CardListView } from './CardListView';
import { FilterMode } from '@/hooks/useCards';
import { ViewMode } from './CardLibraryHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useCardRegeneration } from '@/hooks/useCardRegeneration';

interface CategorySectionProps {
  category: Category;
  cards: Card[];
  allCards: Card[];
  filter: FilterMode;
  onFilterChange: (filter: FilterMode) => void;
  onAddWildcard: (text: string, category: Category) => void;
  onRemoveWildcard: (id: string) => void;
  isModeratorMode?: boolean;
  onEditCard?: (card: Card) => void;
  hasOverride?: (cardId: string) => boolean;
  viewMode?: ViewMode;
  searchTerm?: string;
  onInlineEdit?: (cardId: string, newText: string) => void;
  onResetCard?: (cardId: string) => void;
  problemStatement?: string | null;
}

const categoryAccentColors: Record<Category, string> = {
  insight: 'bg-category-insight',
  asset: 'bg-category-asset',
  tech: 'bg-category-tech',
  random: 'bg-category-random',
};

export function CategorySection({
  category,
  cards,
  allCards,
  filter,
  onFilterChange,
  onAddWildcard,
  onRemoveWildcard,
  isModeratorMode = false,
  onEditCard,
  hasOverride,
  viewMode = 'grid',
  searchTerm = '',
  onInlineEdit,
  onResetCard,
  problemStatement,
}: CategorySectionProps) {
  const [newCardText, setNewCardText] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isRegenerating, regenerateCard } = useCardRegeneration();

  const handleAddCard = () => {
    if (newCardText.trim()) {
      onAddWildcard(newCardText.trim(), category);
      setNewCardText('');
      setIsDialogOpen(false);
    }
  };

  const handleRegenerate = async () => {
    const newCard = await regenerateCard(category, allCards, problemStatement);
    if (newCard) {
      // Add generated card as a wildcard
      onAddWildcard(newCard.text, category);
    }
  };

  const filterButtons: { value: FilterMode; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'default', label: 'Default' },
    { value: 'wildcards', label: 'Wildcards' },
  ];

  // Filter cards by search term
  const filteredCards = searchTerm
    ? cards.filter((card) =>
        card.text.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : cards;

  // Empty state messages
  const getEmptyMessage = () => {
    if (searchTerm) {
      return `No cards match "${searchTerm}".`;
    }
    if (filter === 'wildcards') {
      return "No wildcards yet. Click 'Add' or 'Generate' to create custom cards.";
    }
    return 'No cards in this filter. Try switching to "All" or add some wildcards.';
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-1 h-8 rounded-full',
              categoryAccentColors[category]
            )}
          />
          <div>
            <h3 className="font-serif text-xl">{categoryLabels[category]}</h3>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {filteredCards.length} card{filteredCards.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border border-border overflow-hidden">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => onFilterChange(btn.value)}
                className={cn(
                  'px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors',
                  filter === btn.value
                    ? 'bg-foreground text-background'
                    : 'bg-background text-foreground hover:bg-muted'
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1 font-mono text-[10px] uppercase tracking-wider">
                <Plus className="w-3.5 h-3.5" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="border-border">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">
                  Add Wildcard to {categoryLabels[category]}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Enter your card text..."
                  value={newCardText}
                  onChange={(e) => setNewCardText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCard()}
                  className="border-border"
                />
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    onClick={handleRegenerate}
                    disabled={isRegenerating[category]}
                    className="gap-2 font-mono text-[10px] uppercase tracking-wider"
                  >
                    {isRegenerating[category] ? 'Generating...' : '✨ AI Generate'}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCard} disabled={!newCardText.trim()}>
                      Add Card
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {viewMode === 'list' ? (
        <CardListView
          cards={filteredCards}
          category={category}
          allCards={allCards}
          isModeratorMode={isModeratorMode}
          onRemoveWildcard={onRemoveWildcard}
          hasOverride={hasOverride}
          onInlineEdit={onInlineEdit}
          onResetCard={onResetCard}
          searchTerm={searchTerm}
          onAddWildcard={onAddWildcard}
          problemStatement={problemStatement}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card, index) => (
              <MashupCard
                key={card.id}
                card={card}
                size="sm"
                delay={index * 0.02}
                onRemove={card.isWildcard && !isModeratorMode ? () => onRemoveWildcard(card.id) : undefined}
                onEdit={onEditCard ? () => onEditCard(card) : undefined}
                isModeratorMode={isModeratorMode}
                hasOverride={hasOverride?.(card.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredCards.length === 0 && (
        <p className="text-center text-muted-foreground py-12 text-sm">
          {getEmptyMessage()}
        </p>
      )}
    </div>
  );
}
