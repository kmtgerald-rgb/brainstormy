import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { Card, categoryLabels, categoryShortLabels } from '@/data/defaultCards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const categoryTextStyles = {
  insight: 'text-category-insight',
  asset: 'text-category-asset',
  tech: 'text-category-tech',
  random: 'text-category-random',
};

interface EditCardDialogProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardId: string, newText: string) => void;
  onReset?: (cardId: string) => void;
  hasOverride?: boolean;
  originalText?: string;
}

export function EditCardDialog({
  card,
  isOpen,
  onClose,
  onSave,
  onReset,
  hasOverride,
  originalText,
}: EditCardDialogProps) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (card) {
      setText(card.text);
    }
  }, [card]);

  const handleSave = () => {
    if (card && text.trim()) {
      onSave(card.id, text.trim());
      onClose();
    }
  };

  const handleReset = () => {
    if (card && onReset) {
      onReset(card.id);
      onClose();
    }
  };

  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <span className={cn('font-mono text-xs uppercase tracking-wider', categoryTextStyles[card.category])}>
              {categoryShortLabels[card.category]}
            </span>
            Edit Card
          </DialogTitle>
          <DialogDescription>
            {card.isWildcard ? 'Edit this wildcard' : 'Override this default card text'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            placeholder="Enter card text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="border-border"
          />
          {hasOverride && originalText && (
            <p className="text-sm text-muted-foreground">
              Original: "{originalText}"
            </p>
          )}
          <div className="flex justify-between">
            <div>
              {hasOverride && onReset && (
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset to original
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!text.trim()}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}