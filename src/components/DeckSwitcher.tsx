import { useState, useEffect } from 'react';
import { ChevronDown, Loader2, Sparkles } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { InsightVariant, TechVariant, insightVariantLabels, catalystVariantLabels } from '@/data/deckVariants';

interface DeckSwitcherProps {
  type: 'insight' | 'catalyst';
  insightVariant?: InsightVariant;
  insightContext?: string;
  catalystVariant?: TechVariant;
  hasGeneratedCards?: boolean;
  isGenerating?: boolean;
  onInsightChange?: (variant: InsightVariant, context?: string) => void;
  onCatalystChange?: (variant: TechVariant) => void;
  onGenerate?: () => void;
}

export function DeckSwitcher({
  type,
  insightVariant = 'general',
  insightContext,
  catalystVariant = 'technology',
  hasGeneratedCards = false,
  isGenerating = false,
  onInsightChange,
  onCatalystChange,
  onGenerate,
}: DeckSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [localVariant, setLocalVariant] = useState<InsightVariant | TechVariant>(
    type === 'insight' ? insightVariant : catalystVariant
  );
  const [contextInput, setContextInput] = useState(insightContext || '');
  const [wasGenerating, setWasGenerating] = useState(false);

  // Track generation completion to auto-close
  useEffect(() => {
    if (wasGenerating && !isGenerating && hasGeneratedCards) {
      setOpen(false);
    }
    setWasGenerating(isGenerating);
  }, [isGenerating, hasGeneratedCards, wasGenerating]);

  // Sync local state with props
  useEffect(() => {
    if (type === 'insight') {
      setLocalVariant(insightVariant);
      setContextInput(insightContext || '');
    } else {
      setLocalVariant(catalystVariant);
    }
  }, [type, insightVariant, insightContext, catalystVariant]);

  const needsInput = type === 'insight' && (localVariant === 'industry' || localVariant === 'region');
  const canGenerate = needsInput && contextInput.trim().length > 0;

  const handleVariantChange = (value: string) => {
    setLocalVariant(value as InsightVariant | TechVariant);
    
    if (type === 'catalyst') {
      onCatalystChange?.(value as TechVariant);
      setOpen(false);
    } else if (value === 'general') {
      onInsightChange?.('general');
      setOpen(false);
    }
  };

  const handleGenerate = () => {
    if (type === 'insight' && needsInput && canGenerate) {
      onInsightChange?.(localVariant as InsightVariant, contextInput.trim());
      onGenerate?.();
    }
  };

  // Get display label
  const getDisplayLabel = () => {
    if (type === 'insight') {
      if (insightVariant === 'general') {
        return 'Human Truth';
      }
      if (insightContext) {
        return `${insightContext} Insights`;
      }
      return insightVariantLabels[insightVariant];
    }
    return catalystVariantLabels[catalystVariant];
  };

  const accentColor = type === 'insight' ? 'category-insight' : 'category-tech';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded transition-colors',
            'font-mono text-[10px] uppercase tracking-wider text-muted-foreground',
            'hover:bg-muted/50 hover:text-foreground',
            open && 'bg-muted/50 text-foreground'
          )}
        >
          <span className="truncate max-w-[120px]">{getDisplayLabel()}</span>
          <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-3 bg-card border-border shadow-lg" 
        align="start"
        sideOffset={8}
      >
        {type === 'insight' ? (
          <div className="space-y-3">
            <RadioGroup
              value={localVariant}
              onValueChange={handleVariantChange}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="general" id="general" />
                <Label htmlFor="general" className="text-sm cursor-pointer">
                  Human Truth
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="industry" id="industry" />
                <Label htmlFor="industry" className="text-sm cursor-pointer">
                  Industry Insight
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="region" id="region" />
                <Label htmlFor="region" className="text-sm cursor-pointer">
                  Regional Insight
                </Label>
              </div>
            </RadioGroup>

            {needsInput && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <Input
                  placeholder={localVariant === 'industry' ? 'e.g., Healthcare, Fintech' : 'e.g., Japan, Middle East'}
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  className="h-8 text-sm"
                  disabled={isGenerating}
                />
                <Button
                  size="sm"
                  className="w-full h-8"
                  onClick={handleGenerate}
                  disabled={!canGenerate || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>Generate Deck</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <RadioGroup
            value={localVariant}
            onValueChange={handleVariantChange}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="technology" id="technology" />
              <Label htmlFor="technology" className="text-sm cursor-pointer">
                New Technology
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="format" id="format" />
              <Label htmlFor="format" className="text-sm cursor-pointer">
                Content Format
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="channel" id="channel" />
              <Label htmlFor="channel" className="text-sm cursor-pointer">
                Channel
              </Label>
            </div>
          </RadioGroup>
        )}
      </PopoverContent>
    </Popover>
  );
}
