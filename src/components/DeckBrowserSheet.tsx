import { useState } from 'react';
import { Layers } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CardBrowser } from './DeckHub/CardBrowser';
import { DeckPreset } from '@/hooks/useDeckManager';
import { Card, Category } from '@/data/defaultCards';

interface DeckBrowserSheetProps {
  activePreset: DeckPreset;
  wildcards: Card[];
  getCardsForCategory: (category: Category) => Card[];
  onAddWildcard: (text: string, category: Category) => void;
  onRemoveWildcard: (id: string) => void;
  onEditWildcard?: (id: string, text: string) => void;
}

export function DeckBrowserSheet({
  activePreset,
  wildcards,
  getCardsForCategory,
  onAddWildcard,
  onRemoveWildcard,
  onEditWildcard,
}: DeckBrowserSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                     bg-muted/50 hover:bg-muted border border-border/50 
                     font-mono text-[10px] uppercase tracking-wider text-muted-foreground
                     hover:text-foreground transition-colors"
        >
          <Layers className="w-3 h-3" />
          <span>Browse Decks</span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="font-serif text-xl flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Card Library
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <p className="text-xs text-muted-foreground mb-4">
            Browse and edit cards in your deck. Click any card to customize it.
          </p>
          <CardBrowser
            activePreset={activePreset}
            wildcards={wildcards}
            getCardsForCategory={getCardsForCategory}
            onAddWildcard={onAddWildcard}
            onRemoveWildcard={onRemoveWildcard}
            onEditWildcard={onEditWildcard}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
