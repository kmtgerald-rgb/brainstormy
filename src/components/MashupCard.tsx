import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Pencil, X, RotateCw } from 'lucide-react';
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
  flippable?: boolean;
  explanation?: string | null;
  explanationLoading?: boolean;
  onFlip?: () => void;
}

const categoryAccentStyles: Record<Category, string> = {
  insight: 'border-l-[hsl(var(--category-insight))]',
  asset: 'border-l-[hsl(var(--category-asset))]',
  tech: 'border-l-[hsl(var(--category-tech))]',
  random: 'border-l-[hsl(var(--category-random))]',
};

const categoryTextStyles: Record<Category, string> = {
  insight: 'text-category-insight',
  asset: 'text-category-asset',
  tech: 'text-category-tech',
  random: 'text-category-random',
};

const categoryBackgroundStyles: Record<Category, string> = {
  insight: 'bg-[hsl(var(--category-insight)/0.08)]',
  asset: 'bg-[hsl(var(--category-asset)/0.08)]',
  tech: 'bg-[hsl(var(--category-tech)/0.08)]',
  random: 'bg-[hsl(var(--category-random)/0.08)]',
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
  flippable = false,
  explanation,
  explanationLoading = false,
  onFlip,
}: MashupCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

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

  const handleFlip = (e: React.MouseEvent) => {
    if (!flippable) return;
    e.stopPropagation();
    
    if (!isFlipped && onFlip) {
      onFlip();
    }
    setIsFlipped(!isFlipped);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (flippable) {
      handleFlip(e);
    } else if (isModeratorMode && onEdit) {
      onEdit();
    } else if (onClick) {
      onClick();
    }
  };

  const baseCardClasses = cn(
    'relative bg-card border border-border border-l-[3px] transition-all duration-200 card-shadow backface-hidden',
    categoryAccentStyles[card.category],
    card.isWildcard && 'border-dashed border-l-solid',
    isSelected && 'ring-1 ring-foreground',
    hasOverride && 'ring-1 ring-amber-500/50',
    (onClick || flippable || isModeratorMode) && 'cursor-pointer hover:card-shadow-hover hover:-translate-y-0.5',
    sizeClasses[size]
  );

  const FrontFace = (
    <div className={cn(baseCardClasses, 'absolute inset-0')}>
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
        {flippable && !isModeratorMode && (
          <RotateCw className={cn('w-3 h-3', categoryTextStyles[card.category])} />
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

  const BackFace = (
    <div 
      className={cn(
        baseCardClasses,
        categoryBackgroundStyles[card.category],
        'absolute inset-0 rotate-y-180'
      )}
      style={{ transform: 'rotateY(180deg)' }}
    >
      <div className="absolute top-3 right-3">
        <RotateCw className={cn('w-3 h-3', categoryTextStyles[card.category])} />
      </div>

      <span className={cn(
        'font-mono text-[10px] uppercase tracking-wider mb-3 block',
        categoryTextStyles[card.category]
      )}>
        About this card
      </span>

      {explanationLoading ? (
        <div className="space-y-2">
          <div className="h-3 bg-muted/50 rounded animate-pulse w-full" />
          <div className="h-3 bg-muted/50 rounded animate-pulse w-4/5" />
          <div className="h-3 bg-muted/50 rounded animate-pulse w-3/5" />
        </div>
      ) : explanation ? (
        <p className={cn('font-serif text-sm leading-relaxed text-muted-foreground')}>
          {explanation}
        </p>
      ) : (
        <p className="font-serif text-sm text-muted-foreground italic">
          Tap to reveal insight...
        </p>
      )}

      <span className="absolute bottom-3 right-3 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60">
        Tap to flip
      </span>
    </div>
  );

  const CardContainer = (
    <div 
      className="relative w-full h-full"
      style={{ 
        perspective: '1000px',
        minHeight: size === 'sm' ? '100px' : size === 'md' ? '140px' : '180px'
      }}
    >
      <div
        onClick={handleCardClick}
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {FrontFace}
        {flippable && BackFace}
      </div>
    </div>
  );

  if (!animate) return CardContainer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {CardContainer}
    </motion.div>
  );
}
