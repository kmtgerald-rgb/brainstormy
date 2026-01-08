import { motion } from 'framer-motion';
import { Check, Sparkles, Copy, Trash2 } from 'lucide-react';
import { DeckPreset } from '@/hooks/useDeckManager';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PresetCardProps {
  preset: DeckPreset;
  isActive: boolean;
  onActivate: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export function PresetCard({
  preset,
  isActive,
  onActivate,
  onDuplicate,
  onDelete,
}: PresetCardProps) {
  const hasAI = preset.generatedCards && preset.generatedCards.length > 0;
  
  return (
    <motion.button
      onClick={onActivate}
      className={cn(
        'relative w-full p-4 text-left rounded-md border transition-all',
        'hover:border-foreground/30 group',
        isActive 
          ? 'border-foreground bg-foreground/5' 
          : 'border-border bg-background'
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-3 right-3">
          <Check className="w-4 h-4 text-foreground" />
        </div>
      )}
      
      {/* Content */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{preset.name}</span>
          {hasAI && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-mono uppercase tracking-wider rounded">
              <Sparkles className="w-2.5 h-2.5" />
              AI
            </span>
          )}
          {preset.isDefault && (
            <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[9px] font-mono uppercase tracking-wider rounded">
              Default
            </span>
          )}
        </div>
        
        {preset.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {preset.description}
          </p>
        )}
        
        {preset.config.insight.context && (
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {preset.config.insight.variant}: {preset.config.insight.context}
          </p>
        )}
      </div>
      
      {/* Actions (on hover) */}
      {!preset.isDefault && (
        <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDuplicate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
            >
              <Copy className="w-3 h-3" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}
    </motion.button>
  );
}
