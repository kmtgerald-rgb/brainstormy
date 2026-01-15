import { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DeckPreset } from '@/hooks/useDeckManager';
import { 
  InsightVariant, 
  TechVariant,
  insightVariantLabels,
  catalystVariantLabels,
} from '@/data/deckVariants';
import { cn } from '@/lib/utils';

interface DeckConfiguratorProps {
  activePreset: DeckPreset;
  isGenerating: boolean;
  onInsightChange: (variant: InsightVariant, context?: string) => void;
  onCatalystChange: (variant: TechVariant) => void;
  onGenerate: (forceRegenerate?: boolean) => void;
}

export function DeckConfigurator({
  activePreset,
  isGenerating,
  onInsightChange,
  onCatalystChange,
  onGenerate,
}: DeckConfiguratorProps) {
  const [contextInput, setContextInput] = useState(activePreset.config.insight.context || '');
  
  const insightVariant = activePreset.config.insight.variant;
  const catalystVariant = activePreset.config.catalyst.variant;
  const hasGeneratedCards = Boolean(activePreset.generatedCards?.length);
  
  // Sync input with preset when it changes
  useEffect(() => {
    setContextInput(activePreset.config.insight.context || '');
  }, [activePreset.id, activePreset.config.insight.context]);

  const handleInsightVariantChange = (variant: InsightVariant) => {
    // When switching variants, only update the variant - don't pass stale context
    // Context will be submitted when user clicks Generate
    if (variant === 'general') {
      onInsightChange(variant);
    } else {
      // Just switch variant, clear local context if switching between industry/region
      if (variant !== insightVariant) {
        setContextInput('');
      }
      onInsightChange(variant);
    }
  };

  const handleGenerate = (force = false) => {
    if (!contextInput.trim()) return;
    onInsightChange(insightVariant, contextInput);
    onGenerate(force);
  };

  const needsContext = insightVariant === 'industry' || insightVariant === 'region';
  const canGenerate = needsContext && contextInput.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Insight Deck */}
      <div className="space-y-3">
        <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Insight Deck
        </label>
        <RadioGroup
          value={insightVariant}
          onValueChange={(v) => handleInsightVariantChange(v as InsightVariant)}
          className="space-y-2"
        >
          {(Object.keys(insightVariantLabels) as InsightVariant[]).map((variant) => (
            <div key={variant} className="flex items-center space-x-2">
              <RadioGroupItem value={variant} id={`insight-${variant}`} />
              <Label
                htmlFor={`insight-${variant}`}
                className="font-mono text-xs uppercase tracking-wider cursor-pointer"
              >
                {insightVariantLabels[variant]}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {/* Context input for industry/region */}
        {needsContext && (
          <div className="ml-6 space-y-2">
            <Input
              placeholder={
                insightVariant === 'industry' 
                  ? 'e.g., Healthcare, Fintech...'
                  : 'e.g., Japan, Southeast Asia...'
              }
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              className="h-8 text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={hasGeneratedCards ? 'outline' : 'default'}
                onClick={() => handleGenerate(!hasGeneratedCards)}
                disabled={!canGenerate || isGenerating}
                className={cn(
                  'h-8 gap-2',
                  !hasGeneratedCards && 'bg-primary hover:bg-primary/90'
                )}
              >
                {isGenerating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : hasGeneratedCards ? (
                  <>
                    <RefreshCw className="h-3 w-3" />
                    Regenerate
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    Generate
                  </>
                )}
              </Button>
            </div>
            {hasGeneratedCards && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-primary" />
                {activePreset.generatedCards?.length} AI cards ready
              </p>
            )}
          </div>
        )}
      </div>

      {/* Catalyst Deck */}
      <div className="space-y-3">
        <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Catalyst Deck
        </label>
        <RadioGroup
          value={catalystVariant}
          onValueChange={(v) => onCatalystChange(v as TechVariant)}
          className="space-y-2"
        >
          {(Object.keys(catalystVariantLabels) as TechVariant[]).map((variant) => (
            <div key={variant} className="flex items-center space-x-2">
              <RadioGroupItem value={variant} id={`catalyst-${variant}`} />
              <Label
                htmlFor={`catalyst-${variant}`}
                className="font-mono text-xs uppercase tracking-wider cursor-pointer"
              >
                {catalystVariantLabels[variant]}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
