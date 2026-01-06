import { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Category, categoryLabels, categoryIcons } from '@/data/defaultCards';
import { MashupCard } from './MashupCard';
import { FilterMode } from '@/hooks/useCards';
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

interface CategorySectionProps {
  category: Category;
  cards: Card[];
  filter: FilterMode;
  onFilterChange: (filter: FilterMode) => void;
  onAddWildcard: (text: string, category: Category) => void;
  onRemoveWildcard: (id: string) => void;
  isModeratorMode?: boolean;
  onEditCard?: (card: Card) => void;
  hasOverride?: (cardId: string) => boolean;
}

const categoryBorderColors: Record<Category, string> = {
  insight: 'border-category-insight',
  asset: 'border-category-asset',
  tech: 'border-category-tech',
  random: 'border-category-random',
};

const categoryBgColors: Record<Category, string> = {
  insight: 'bg-category-insight',
  asset: 'bg-category-asset',
  tech: 'bg-category-tech',
  random: 'bg-category-random',
};

export function CategorySection({
  category,
  cards,
  filter,
  onFilterChange,
  onAddWildcard,
  onRemoveWildcard,
  isModeratorMode = false,
  onEditCard,
  hasOverride,
}: CategorySectionProps) {
  const [newCardText, setNewCardText] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddCard = () => {
    if (newCardText.trim()) {
      onAddWildcard(newCardText.trim(), category);
      setNewCardText('');
      setIsDialogOpen(false);
    }
  };

  const filterButtons: { value: FilterMode; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'default', label: 'Default' },
    { value: 'wildcards', label: 'Wildcards' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center text-xl',
              categoryBgColors[category],
              'text-primary-foreground'
            )}
          >
            {categoryIcons[category]}
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">{categoryLabels[category]}</h3>
            <p className="text-sm text-muted-foreground">{cards.length} cards</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => onFilterChange(btn.value)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium transition-colors',
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
              <Button size="sm" variant="outline" className={cn('gap-1', categoryBorderColors[category])}>
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Wildcard to {categoryLabels[category]}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Enter your card text..."
                  value={newCardText}
                  onChange={(e) => setNewCardText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCard()}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCard} disabled={!newCardText.trim()}>
                    Add Card
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <AnimatePresence mode="popLayout">
          {cards.map((card, index) => (
            <MashupCard
              key={card.id}
              card={card}
              size="sm"
              delay={index * 0.03}
              onRemove={card.isWildcard && !isModeratorMode ? () => onRemoveWildcard(card.id) : undefined}
              onEdit={onEditCard ? () => onEditCard(card) : undefined}
              isModeratorMode={isModeratorMode}
              hasOverride={hasOverride?.(card.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {cards.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No cards in this filter. Try switching to "All" or add some wildcards!
        </p>
      )}
    </div>
  );
}
