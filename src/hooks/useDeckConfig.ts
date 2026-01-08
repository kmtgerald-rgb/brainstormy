import { useState, useCallback, useMemo } from 'react';
import { Card } from '@/data/defaultCards';
import { 
  DeckConfig, 
  InsightVariant, 
  TechVariant, 
  defaultDeckConfig,
  contentFormatCards,
  channelCards,
} from '@/data/deckVariants';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DECK_CONFIG_KEY = 'mashup-deck-config';
const GENERATED_DECKS_KEY = 'mashup-generated-decks';

interface GeneratedDeck {
  key: string; // e.g., "industry:healthcare" or "region:japan"
  cards: Card[];
  generatedAt: string;
}

export function useDeckConfig() {
  const [deckConfig, setDeckConfig] = useState<DeckConfig>(() => {
    const stored = localStorage.getItem(DECK_CONFIG_KEY);
    return stored ? JSON.parse(stored) : defaultDeckConfig;
  });

  const [generatedDecks, setGeneratedDecks] = useState<GeneratedDeck[]>(() => {
    const stored = localStorage.getItem(GENERATED_DECKS_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const updateDeckConfig = useCallback((updates: Partial<DeckConfig>) => {
    setDeckConfig((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(DECK_CONFIG_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setInsightVariant = useCallback((variant: InsightVariant, context?: string) => {
    const updates: DeckConfig['insight'] = { variant };
    if (variant === 'industry') {
      updates.industryName = context || '';
    } else if (variant === 'region') {
      updates.regionName = context || '';
    }
    updateDeckConfig({ insight: updates });
  }, [updateDeckConfig]);

  const setTechVariant = useCallback((variant: TechVariant) => {
    updateDeckConfig({ tech: { variant } });
  }, [updateDeckConfig]);

  const getGeneratedDeckKey = useCallback((type: 'industry' | 'region', context: string): string => {
    return `${type}:${context.toLowerCase().trim()}`;
  }, []);

  const findGeneratedDeck = useCallback((key: string): GeneratedDeck | undefined => {
    return generatedDecks.find((d) => d.key === key);
  }, [generatedDecks]);

  const generateDeck = useCallback(async (
    type: 'industry' | 'region',
    context: string,
    forceRegenerate = false
  ): Promise<Card[]> => {
    const key = getGeneratedDeckKey(type, context);
    
    // Check cache first
    if (!forceRegenerate) {
      const cached = findGeneratedDeck(key);
      if (cached) return cached.cards;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-deck', {
        body: { type, context },
      });

      if (error) throw error;

      const cards: Card[] = (data.cards || []).map((text: string, idx: number) => ({
        id: `gen-${type}-${idx}`,
        text,
        category: 'insight' as const,
        isWildcard: false,
        isGenerated: true,
      }));

      // Update cache
      setGeneratedDecks((prev) => {
        const filtered = prev.filter((d) => d.key !== key);
        const updated = [...filtered, { key, cards, generatedAt: new Date().toISOString() }];
        localStorage.setItem(GENERATED_DECKS_KEY, JSON.stringify(updated));
        return updated;
      });

      toast.success(`Generated ${cards.length} ${type} insights for "${context}"`);
      return cards;
    } catch (error) {
      console.error('Error generating deck:', error);
      toast.error('Failed to generate deck');
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, [getGeneratedDeckKey, findGeneratedDeck]);

  // Get tech variant cards
  const getTechVariantCards = useCallback((): Card[] | null => {
    const { variant } = deckConfig.tech;
    if (variant === 'format') return contentFormatCards;
    if (variant === 'channel') return channelCards;
    return null; // Use default tech cards
  }, [deckConfig.tech]);

  // Get insight variant cards (may require generation)
  const getInsightVariantCards = useCallback((): Card[] | null => {
    const { variant, industryName, regionName } = deckConfig.insight;
    
    if (variant === 'general') return null; // Use default insight cards
    
    if (variant === 'industry' && industryName) {
      const key = getGeneratedDeckKey('industry', industryName);
      const cached = findGeneratedDeck(key);
      return cached?.cards || null;
    }
    
    if (variant === 'region' && regionName) {
      const key = getGeneratedDeckKey('region', regionName);
      const cached = findGeneratedDeck(key);
      return cached?.cards || null;
    }
    
    return null;
  }, [deckConfig.insight, getGeneratedDeckKey, findGeneratedDeck]);

  return {
    deckConfig,
    isGenerating,
    setInsightVariant,
    setTechVariant,
    generateDeck,
    getTechVariantCards,
    getInsightVariantCards,
    findGeneratedDeck,
    getGeneratedDeckKey,
  };
}
