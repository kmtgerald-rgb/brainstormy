import { motion } from 'framer-motion';
import { Star, X, Pencil, RotateCcw } from 'lucide-react';
import { Card, Category, categoryTypes, getCardIndex } from '@/data/defaultCards';
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

const typeClasses: Record<Category, string> = {
  insight: 'dex-card-psychic',
  asset: 'dex-card-steel',
  tech: 'dex-card-electric',
  random: 'dex-card-ghost',
};

const typeBadgeClasses: Record<Category, string> = {
  insight: 'type-badge-psychic',
  asset: 'type-badge-steel',
  tech: 'type-badge-electric',
  random: 'type-badge-ghost',
};

const typeTextColors: Record<Category, string> = {
  insight: 'text-[hsl(var(--type-psychic-glow))]',
  asset: 'text-[hsl(var(--type-steel-glow))]',
  tech: 'text-[hsl(var(--type-electric-glow))]',
  random: 'text-[hsl(var(--type-ghost-glow))]',
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
    sm: 'p-3 min-h-[100px]',
    md: 'p-4 min-h-[140px]',
    lg: 'p-5 min-h-[180px]',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const CardContent = (
    <div
      className={cn(
        'dex-card relative transition-all duration-300',
        typeClasses[card.category],
        card.isWildcard && 'border-dashed',
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        hasOverride && 'ring-1 ring-amber-500/50',
        (onClick || isModeratorMode) && 'cursor-pointer hover:scale-[1.02] hover:card-shadow-hover',
        sizeClasses[size]
      )}
      onClick={isModeratorMode ? onEdit : onClick}
    >
      {/* Index number - top left */}
      <div className="absolute top-2 left-3">
        <span className="card-index font-mono-display text-[10px]">
          {getCardIndex(card)}
        </span>
      </div>

      {/* Top-right icons */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {hasOverride && (
          <span title="Modified from original">
            <RotateCcw className="w-3 h-3 text-amber-500" />
          </span>
        )}
        {card.isWildcard && !isModeratorMode && (
          <Star
            className={cn('w-3 h-3', typeTextColors[card.category])}
            fill="currentColor"
          />
        )}
        {isModeratorMode && (
          <Pencil
            className={cn('w-3 h-3', typeTextColors[card.category])}
          />
        )}
        {onRemove && !isModeratorMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Card content */}
      <div className="flex flex-col h-full pt-4">
        {showCategory && (
          <div className="mb-2">
            <span className={cn('type-badge', typeBadgeClasses[card.category])}>
              {categoryTypes[card.category]}
            </span>
          </div>
        )}
        <p className={cn(
          'font-medium leading-snug flex-1',
          textSizes[size],
          'text-foreground/90'
        )}>
          {card.text}
        </p>
      </div>

      {/* Subtle scanlines overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none rounded-lg" />
    </div>
  );

  if (!animate) return CardContent;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, filter: 'brightness(1.5) blur(4px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'brightness(1) blur(0px)' }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {CardContent}
    </motion.div>
  );
}