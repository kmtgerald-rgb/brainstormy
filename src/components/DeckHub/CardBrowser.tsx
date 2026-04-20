import { useState, useMemo, useRef, useEffect } from 'react';
import { Edit2, Trash2, Plus, Sparkles, Star, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Category, categoryLabels } from '@/data/defaultCards';
import { DeckPreset } from '@/hooks/useDeckManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
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

const categoryColors: Record<Category, string> = {
  insight: 'border-l-[hsl(var(--category-insight))]',
  asset: 'border-l-[hsl(var(--category-asset))]',
  tech: 'border-l-[hsl(var(--category-tech))]',
  random: 'border-l-[hsl(var(--category-random))]',
};

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
  const [expertMode, setExpertMode] = useState(false);
  const [newCardText, setNewCardText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  const categories: Category[] = ['insight', 'asset', 'tech', 'random'];

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const categoryCards = useMemo(() => {
    const baseCards = getCardsForCategory(selectedCategory);
    const categoryWildcards = wildcards.filter((w) => w.category === selectedCategory);
    if (filter === 'default') return baseCards.filter((c) => !c.isWildcard && !c.isGenerated);
    if (filter === 'wildcards') return categoryWildcards;
    if (filter === 'generated') return baseCards.filter((c) => c.isGenerated);
    return [...baseCards, ...categoryWildcards];
  }, [selectedCategory, filter, getCardsForCategory, wildcards]);

  const handleAddWildcard = () => {
    if (!newCardText.trim()) return;
    onAddWildcard(newCardText.trim(), selectedCategory);
    setNewCardText('');
  };

  const handleStartEdit = (card: Card) => {
    setEditingId(card.id);
    setEditText(card.text);
  };

  const handleSaveEdit = () => {
    if (editingId && editText.trim()) {
      const editedCard = categoryCards.find((c) => c.id === editingId);
      if (editedCard && !editedCard.isWildcard && onEditWildcard) {
        onAddWildcard(editText.trim(), selectedCategory);
      } else if (onEditWildcard) {
        onEditWildcard(editingId, editText.trim());
      }
    }
    setEditingId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const getCardBadge = (card: Card) => {
    if (card.isGenerated) {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-mono uppercase tracking-wider rounded">
          <Sparkles className="w-2.5 h-2.5" />
          AI
        </span>
      );
    }
    if (card.isWildcard) {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/10 text-amber-600 text-[9px] font-mono uppercase tracking-wider rounded">
          <Star className="w-2.5 h-2.5" />
          Custom
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Expert Mode toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Switch id="expert-mode" checked={expertMode} onCheckedChange={setExpertMode} />
          <Label
            htmlFor="expert-mode"
            className="font-mono text-[10px] uppercase tracking-wider cursor-pointer"
          >
            Expert Mode
          </Label>
        </div>
        <span className="text-[10px] text-muted-foreground italic">
          {expertMode ? 'Spreadsheet view' : 'Card view'}
        </span>
      </div>

      {/* Filter chips (shared) */}
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

      {expertMode ? (
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
      ) : (
        <>
          {/* Category tabs */}
          <div className="flex border border-border overflow-hidden rounded-sm">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'flex-1 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors',
                  selectedCategory === cat
                    ? 'bg-foreground text-background'
                    : 'bg-background text-foreground hover:bg-muted',
                )}
              >
                {categoryLabels[cat].split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Add wildcard */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a custom card..."
              value={newCardText}
              onChange={(e) => setNewCardText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddWildcard()}
              className="h-8 text-sm"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddWildcard}
              disabled={!newCardText.trim()}
              className="h-8 px-3"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Card list */}
          <ScrollArea className="h-64">
            <div className="space-y-1">
              <AnimatePresence mode="popLayout">
                {categoryCards.map((card) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={cn(
                      'flex items-start gap-2 p-2 bg-background border-l-2 rounded-sm',
                      'text-xs hover:bg-muted/50 transition-colors group',
                      categoryColors[card.category],
                      editingId === card.id && 'bg-muted/50 ring-1 ring-primary/20',
                    )}
                  >
                    {editingId === card.id ? (
                      <div className="flex-1 space-y-2">
                        <Textarea
                          ref={editInputRef}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="min-h-[60px] text-xs resize-none"
                          placeholder="Card text..."
                        />
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancelEdit}
                            className="h-6 px-2 text-[10px]"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={!editText.trim()}
                            className="h-6 px-2 text-[10px]"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 leading-relaxed">{card.text}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {getCardBadge(card)}
                          <div className="flex gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleStartEdit(card)}
                              className="p-1 hover:bg-muted rounded transition-colors"
                              title="Edit card"
                            >
                              <Edit2 className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                            </button>
                            {card.isWildcard && (
                              <button
                                onClick={() => onRemoveWildcard(card.id)}
                                className="p-1 hover:bg-destructive/10 rounded transition-colors"
                                title="Delete card"
                              >
                                <Trash2 className="w-3 h-3 text-destructive/70 hover:text-destructive" />
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {categoryCards.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No cards match this filter
                </p>
              )}
            </div>
          </ScrollArea>

          <p className="text-[10px] text-muted-foreground text-center">
            {categoryCards.length} cards in {categoryLabels[selectedCategory]}
          </p>
        </>
      )}
    </div>
  );
}
