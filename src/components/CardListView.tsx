import { useState, useRef, useEffect } from 'react';
import { Pencil, Trash2, RotateCcw, Check, X, Sparkles, Loader2 } from 'lucide-react';
import { Card, Category } from '@/data/defaultCards';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCardRegeneration } from '@/hooks/useCardRegeneration';

interface CardListViewProps {
  cards: Card[];
  category: Category;
  allCards: Card[];
  isModeratorMode?: boolean;
  onEditCard?: (card: Card) => void;
  onRemoveWildcard?: (id: string) => void;
  hasOverride?: (cardId: string) => boolean;
  onInlineEdit?: (cardId: string, newText: string) => void;
  onResetCard?: (cardId: string) => void;
  searchTerm?: string;
  onAddWildcard?: (text: string, category: Category) => void;
  problemStatement?: string | null;
}

const categoryAccentColors: Record<Category, string> = {
  insight: 'bg-category-insight',
  asset: 'bg-category-asset',
  tech: 'bg-category-tech',
  random: 'bg-category-random',
};

export function CardListView({
  cards,
  category,
  allCards,
  isModeratorMode = false,
  onRemoveWildcard,
  hasOverride,
  onInlineEdit,
  onResetCard,
  searchTerm = '',
  onAddWildcard,
  problemStatement,
}: CardListViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { isRegenerating, regenerateCard } = useCardRegeneration();

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleStartEdit = (card: Card) => {
    setEditingId(card.id);
    setEditText(card.text);
  };

  const handleSaveEdit = () => {
    if (editingId && editText.trim() && onInlineEdit) {
      onInlineEdit(editingId, editText.trim());
    }
    setEditingId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleGenerateNew = async () => {
    const newCard = await regenerateCard(category, allCards, problemStatement);
    if (newCard && onAddWildcard) {
      onAddWildcard(newCard.text, category);
    }
  };

  const highlightMatch = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-primary/20 text-foreground px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (cards.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-muted-foreground text-sm">
          No cards match your criteria.
        </p>
        {onAddWildcard && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateNew}
            disabled={isRegenerating[category]}
            className="gap-2 font-mono text-[10px] uppercase tracking-wider"
          >
            {isRegenerating[category] ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {isRegenerating[category] ? 'Generating...' : 'Generate New Card'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="border border-border divide-y divide-border">
        {cards.map((card) => {
          const isEditing = editingId === card.id;
          const isOverridden = hasOverride?.(card.id);
          const canRemove = card.isWildcard && !isModeratorMode;
          const canEdit = isModeratorMode && onInlineEdit;
          const canReset = isModeratorMode && isOverridden && onResetCard;

          return (
            <div
              key={card.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50',
                isOverridden && 'bg-amber-500/5',
                card.isWildcard && 'bg-muted/30'
              )}
            >
              {/* Category indicator */}
              <div
                className={cn(
                  'w-1 h-8 rounded-full shrink-0',
                  categoryAccentColors[category]
                )}
              />

              {/* Card text or edit input */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <Input
                    ref={inputRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-8 text-sm"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm leading-relaxed truncate">
                      {highlightMatch(card.text, searchTerm)}
                    </span>
                    {card.isWildcard && (
                      <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider border border-dashed border-muted-foreground/40 text-muted-foreground">
                        Wildcard
                      </span>
                    )}
                    {card.isGenerated && (
                      <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-primary/10 text-primary">
                        AI
                      </span>
                    )}
                    {isOverridden && (
                      <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-amber-500/20 text-amber-600">
                        Edited
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {isEditing ? (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={handleSaveEdit}
                    >
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={handleCancelEdit}
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </>
                ) : (
                  <>
                    {canEdit && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleStartEdit(card)}
                      >
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    )}
                    {canReset && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => onResetCard(card.id)}
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                      </Button>
                    )}
                    {canRemove && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => onRemoveWildcard?.(card.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Generate button at bottom */}
      {onAddWildcard && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerateNew}
            disabled={isRegenerating[category]}
            className="gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            {isRegenerating[category] ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {isRegenerating[category] ? 'Generating...' : 'Generate New'}
          </Button>
        </div>
      )}
    </div>
  );
}
