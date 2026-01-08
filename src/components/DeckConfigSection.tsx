import { useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  DeckConfig,
  InsightVariant,
  TechVariant,
  insightVariantLabels,
  catalystVariantLabels,
} from '@/data/deckVariants';

interface DeckConfigSectionProps {
  deckConfig: DeckConfig;
  isGenerating: boolean;
  onInsightVariantChange: (variant: InsightVariant, context?: string) => void;
  onTechVariantChange: (variant: TechVariant) => void;
  onGenerateDeck: (type: 'industry' | 'region', context: string, forceRegenerate?: boolean) => Promise<void>;
  hasGeneratedDeck: (type: 'industry' | 'region', context: string) => boolean;
}

export function DeckConfigSection({
  deckConfig,
  isGenerating,
  onInsightVariantChange,
  onTechVariantChange,
  onGenerateDeck,
  hasGeneratedDeck,
}: DeckConfigSectionProps) {
  const [industryInput, setIndustryInput] = useState(deckConfig.insight.industryName || '');
  const [regionInput, setRegionInput] = useState(deckConfig.insight.regionName || '');

  const handleInsightVariantChange = (variant: InsightVariant) => {
    if (variant === 'industry') {
      onInsightVariantChange(variant, industryInput);
    } else if (variant === 'region') {
      onInsightVariantChange(variant, regionInput);
    } else {
      onInsightVariantChange(variant);
    }
  };

  const handleGenerateIndustry = async (forceRegenerate = false) => {
    if (!industryInput.trim()) return;
    onInsightVariantChange('industry', industryInput);
    await onGenerateDeck('industry', industryInput, forceRegenerate);
  };

  const handleGenerateRegion = async (forceRegenerate = false) => {
    if (!regionInput.trim()) return;
    onInsightVariantChange('region', regionInput);
    await onGenerateDeck('region', regionInput, forceRegenerate);
  };

  const industryHasCache = industryInput.trim() && hasGeneratedDeck('industry', industryInput);
  const regionHasCache = regionInput.trim() && hasGeneratedDeck('region', regionInput);

  return (
    <div className="space-y-6">
      {/* Insight Deck Configuration */}
      <div className="space-y-3">
        <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Insight Deck
        </label>
        <RadioGroup
          value={deckConfig.insight.variant}
          onValueChange={(v) => handleInsightVariantChange(v as InsightVariant)}
          className="space-y-2"
        >
          {(Object.keys(insightVariantLabels) as InsightVariant[]).map((variant) => (
            <div key={variant} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={variant} id={`insight-${variant}`} />
                <Label
                  htmlFor={`insight-${variant}`}
                  className="font-mono text-xs uppercase tracking-wider cursor-pointer"
                >
                  {insightVariantLabels[variant]}
                </Label>
              </div>

              {/* Industry Input */}
              {variant === 'industry' && deckConfig.insight.variant === 'industry' && (
                <div className="ml-6 flex gap-2">
                  <Input
                    placeholder="e.g., Healthcare, Fintech..."
                    value={industryInput}
                    onChange={(e) => setIndustryInput(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateIndustry(!industryHasCache)}
                    disabled={!industryInput.trim() || isGenerating}
                    className="h-8 px-3"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : industryHasCache ? (
                      <RefreshCw className="h-3 w-3" />
                    ) : (
                      'Generate'
                    )}
                  </Button>
                </div>
              )}

              {/* Region Input */}
              {variant === 'region' && deckConfig.insight.variant === 'region' && (
                <div className="ml-6 flex gap-2">
                  <Input
                    placeholder="e.g., Japan, Southeast Asia..."
                    value={regionInput}
                    onChange={(e) => setRegionInput(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateRegion(!regionHasCache)}
                    disabled={!regionInput.trim() || isGenerating}
                    className="h-8 px-3"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : regionHasCache ? (
                      <RefreshCw className="h-3 w-3" />
                    ) : (
                      'Generate'
                    )}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Catalyst Deck Configuration */}
      <div className="space-y-3">
        <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Catalyst Deck
        </label>
        <RadioGroup
          value={deckConfig.tech.variant}
          onValueChange={(v) => onTechVariantChange(v as TechVariant)}
          className="space-y-2"
        >
          {(Object.keys(catalystVariantLabels) as TechVariant[]).map((variant) => (
            <div key={variant} className="flex items-center space-x-2">
              <RadioGroupItem value={variant} id={`tech-${variant}`} />
              <Label
                htmlFor={`tech-${variant}`}
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
