import { motion } from 'framer-motion';
import { Star, X, Pencil, RotateCcw } from 'lucide-react';
import { Card, Category, categoryIcons } from '@/data/defaultCards';
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

const categoryStyles: Record<Category, string> = {
  insight: 'border-category-insight bg-category-insight-light',
  asset: 'border-category-asset bg-category-asset-light',
  tech: 'border-category-tech bg-category-tech-light',
  random: 'border-category-random bg-category-random-light',
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
    sm: 'p-3 min-h-[80px]',
    md: 'p-4 min-h-[120px]',
    lg: 'p-6 min-h-[160px]',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const CardContent = (
    <div
      className={cn(
        'relative rounded-lg border-2 transition-all duration-200 card-shadow',
        categoryStyles[card.category],
        card.isWildcard && 'border-dashed',
        isSelected && 'ring-2 ring-foreground ring-offset-2',
        hasOverride && 'ring-1 ring-amber-500',
        onClick && 'cursor-pointer hover:card-shadow-hover hover:scale-[1.02]',
        isModeratorMode && 'cursor-pointer hover:card-shadow-hover hover:scale-[1.02]',
        sizeClasses[size]
      )}
      onClick={isModeratorMode ? onEdit : onClick}
    >
      {/* Top-right icons */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {hasOverride && (
          <span title="Modified from original">
            <RotateCcw className="w-3 h-3 text-amber-500" />
          </span>
        )}
        {card.isWildcard && !isModeratorMode && (
          <Star
            className={cn('w-4 h-4', categoryTextStyles[card.category])}
            fill="currentColor"
          />
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
            className="p-1 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      
      {showCategory && (
        <span className={cn('text-lg mb-2 block', categoryTextStyles[card.category])}>
          {categoryIcons[card.category]}
        </span>
      )}
      <p className={cn('font-medium leading-snug', textSizes[size])}>{card.text}</p>
    </div>
  );

  if (!animate) return CardContent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateY: -15 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {CardContent}
    </motion.div>
  );
}
