import { motion } from 'framer-motion';
import { RotateCcw, Pencil, X } from 'lucide-react';
import { Card, Category, categoryShortLabels } from '@/data/defaultCards';
import { cn } from '@/lib/utils';

interface MashupCardProps {
  card: Card;
  isSelected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  onEdit?: () => void;
  showCategory?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  delay?: number;
  isModeratorMode?: boolean;
  hasOverride?: boolean;
}

const categoryAccentStyles: Record<Category, string> = {
  insight: 'border-l-category-insight',
  asset: 'border-l-category-asset',
  tech: 'border-l-category-tech',
  random: 'border-l-category-random',
};

const categoryTextStyles: Record<Category, string> = {
  insight: 'text-category-insight',
  asset: 'text-category-asset',
  tech: 'text-category-tech',
  random: 'text-category-random',
};

export function MashupCard({
  card,
  isSelected = false,
  onClick,
  onRemove,
  onEdit,
  showCategory = true,
  size = 'md',
  animate = true,
  delay = 0,
  isModeratorMode = false,
  hasOverride = false,
}: MashupCardProps) {
  const sizeClasses = {
    sm: 'p-4 min-h-[100px]',
    md: 'p-5 min-h-[140px]',
    lg: 'p-6 min-h-[180px]',
  };

  const textSizes = {
    sm: 'text-sm leading-relaxed',
    md: 'text-base leading-relaxed',
    lg: 'text-lg leading-relaxed',
  };

  const CardContent = (
    <div
      className={cn(
        'relative bg-card border border-border border-l-[3px] transition-all duration-200 card-shadow',
        categoryAccentStyles[card.category],
        card.isWildcard && 'border-dashed border-l-solid',
        isSelected && 'ring-1 ring-foreground',
        hasOverride && 'ring-1 ring-amber-500/50',
        onClick && 'cursor-pointer hover:card-shadow-hover hover:-translate-y-0.5',
        isModeratorMode && 'cursor-pointer hover:card-shadow-hover hover:-translate-y-0.5',
        sizeClasses[size]
      )}
      onClick={isModeratorMode ? onEdit : onClick}
    >
      {/* Top-right actions */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {hasOverride && (
          <span title="Modified from original">
            <RotateCcw className="w-3 h-3 text-amber-500" />
          </span>
        )}
        {card.isWildcard && !isModeratorMode && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Wildcard
          </span>
        )}
        {isModeratorMode && (
          <Pencil
            className={cn('w-3 h-3', categoryTextStyles[card.category])}
          />
        )}
        {onRemove && !isModeratorMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 rounded bg-muted/80 hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      
      {showCategory && (
        <span className={cn(
          'font-mono text-[10px] uppercase tracking-wider mb-3 block',
          categoryTextStyles[card.category]
        )}>
          {categoryShortLabels[card.category]}
        </span>
      )}
      <p className={cn('font-serif', textSizes[size])}>{card.text}</p>
    </div>
  );

  if (!animate) return CardContent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {CardContent}
    </motion.div>
  );
}