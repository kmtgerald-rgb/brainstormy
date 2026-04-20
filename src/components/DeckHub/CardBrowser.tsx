import { useState } from 'react';
import { Card, Category } from '@/data/defaultCards';
import { DeckPreset } from '@/hooks/useDeckManager';
import { Button } from '@/components/ui/button';
import { ExpertCardTable } from './ExpertCardTable';

type FilterType = 'all' | 'default' | 'wildcards' | 'generated';

interface CardBrowserProps {
  activePreset: DeckPreset;
  wildcards: Card[];
  getCardsForCategory: (category: Category) => Card[];
  onAddWildcard: (text: string, category: Category) => void;
  onRemoveWildcard: (id: string) => void;
  onEditWildcard?: (id: string, text: string) => void;
}

export function CardBrowser({
  activePreset,
  wildcards,
  getCardsForCategory,
  onAddWildcard,
  onRemoveWildcard,
  onEditWildcard,
}: CardBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('insight');
  const [filter, setFilter] = useState<FilterType>('all');

  return (
    <div className="space-y-3">
      {/* Filter chips */}
      <div className="flex gap-1 flex-wrap">
        {(['all', 'default', 'wildcards', 'generated'] as FilterType[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilter(f)}
            className="h-7 px-2 font-mono text-[10px] uppercase tracking-wider"
          >
            {f}
          </Button>
        ))}
      </div>

      <ExpertCardTable
        activePreset={activePreset}
        wildcards={wildcards}
        selectedCategory={selectedCategory}
        filter={filter}
        onCategoryChange={setSelectedCategory}
        getCardsForCategory={getCardsForCategory}
        onAddWildcard={onAddWildcard}
        onRemoveWildcard={onRemoveWildcard}
        onEditWildcard={onEditWildcard}
      />
    </div>
  );
}
