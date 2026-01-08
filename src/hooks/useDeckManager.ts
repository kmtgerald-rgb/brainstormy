import { useState, useCallback, useMemo } from 'react';
import { Card, Category, defaultCards } from '@/data/defaultCards';
import { 
  InsightVariant, 
  TechVariant,
  contentFormatCards,
  channelCards,
  insightVariantLabels,
  catalystVariantLabels,
} from '@/data/deckVariants';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DECK_MANAGER_KEY = 'mashup-deck-manager';

// Preset configuration
export interface DeckPreset {
  id: string;
  name: string;
  description?: string;
  config: {
    insight: {
      variant: InsightVariant;
      context?: string; // industry name or region name
    };
    catalyst: {
      variant: TechVariant;
    };
  };
  generatedCards?: Card[]; // Cached AI-generated cards
  createdAt: string;
  isDefault?: boolean;
}

// Manager state stored in localStorage
interface DeckManagerState {
  activePresetId: string;
  presets: DeckPreset[];
  wildcards: Card[]; // Global wildcards (not preset-specific)
}

// Default presets
const createDefaultPresets = (): DeckPreset[] => [
  {
    id: 'preset-general',
    name: 'General Mix',
    description: 'Human truths + New technology',
    config: {
      insight: { variant: 'general' },
      catalyst: { variant: 'technology' },
    },
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'preset-content',
    name: 'Content Creator',
    description: 'Human truths + Content formats',
    config: {
      insight: { variant: 'general' },
      catalyst: { variant: 'format' },
    },
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
  {
    id: 'preset-media',
    name: 'Media Planner',
    description: 'Human truths + Channels',
    config: {
      insight: { variant: 'general' },
      catalyst: { variant: 'channel' },
    },
    createdAt: new Date().toISOString(),
    isDefault: true,
  },
];

const getInitialState = (): DeckManagerState => {
  const stored = localStorage.getItem(DECK_MANAGER_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fall through to default
    }
  }
  return {
    activePresetId: 'preset-general',
    presets: createDefaultPresets(),
    wildcards: [],
  };
};

export function useDeckManager() {
  const [state, setState] = useState<DeckManagerState>(getInitialState);
  const [isGenerating, setIsGenerating] = useState(false);

  // Persist state
  const persistState = useCallback((newState: DeckManagerState) => {
    localStorage.setItem(DECK_MANAGER_KEY, JSON.stringify(newState));
  }, []);

  // Get active preset
  const activePreset = useMemo(() => {
    return state.presets.find(p => p.id === state.activePresetId) || state.presets[0];
  }, [state.presets, state.activePresetId]);

  // Activate a preset
  const activatePreset = useCallback((presetId: string) => {
    setState(prev => {
      const updated = { ...prev, activePresetId: presetId };
      persistState(updated);
      return updated;
    });
  }, [persistState]);

  // Create a new preset
  const createPreset = useCallback((
    name: string,
    config: DeckPreset['config'],
    description?: string
  ): DeckPreset => {
    const newPreset: DeckPreset = {
      id: `preset-${Date.now()}`,
      name,
      description,
      config,
      createdAt: new Date().toISOString(),
    };
    
    setState(prev => {
      const updated = {
        ...prev,
        presets: [...prev.presets, newPreset],
        activePresetId: newPreset.id,
      };
      persistState(updated);
      return updated;
    });
    
    toast.success(`Created preset "${name}"`);
    return newPreset;
  }, [persistState]);

  // Update a preset
  const updatePreset = useCallback((presetId: string, updates: Partial<DeckPreset>) => {
    setState(prev => {
      const updated = {
        ...prev,
        presets: prev.presets.map(p => 
          p.id === presetId ? { ...p, ...updates } : p
        ),
      };
      persistState(updated);
      return updated;
    });
  }, [persistState]);

  // Delete a preset
  const deletePreset = useCallback((presetId: string) => {
    setState(prev => {
      const preset = prev.presets.find(p => p.id === presetId);
      if (preset?.isDefault) {
        toast.error("Can't delete default presets");
        return prev;
      }
      
      const updated = {
        ...prev,
        presets: prev.presets.filter(p => p.id !== presetId),
        activePresetId: prev.activePresetId === presetId 
          ? 'preset-general' 
          : prev.activePresetId,
      };
      persistState(updated);
      toast.success('Preset deleted');
      return updated;
    });
  }, [persistState]);

  // Duplicate a preset
  const duplicatePreset = useCallback((presetId: string) => {
    const source = state.presets.find(p => p.id === presetId);
    if (!source) return;
    
    createPreset(
      `${source.name} (Copy)`,
      JSON.parse(JSON.stringify(source.config)),
      source.description
    );
  }, [state.presets, createPreset]);

  // Update active preset config
  const updateActiveConfig = useCallback((updates: Partial<DeckPreset['config']>) => {
    if (!activePreset) return;
    
    setState(prev => {
      const updated = {
        ...prev,
        presets: prev.presets.map(p => 
          p.id === prev.activePresetId 
            ? { ...p, config: { ...p.config, ...updates } }
            : p
        ),
      };
      persistState(updated);
      return updated;
    });
  }, [activePreset, persistState]);

  // Set insight variant for active preset
  const setInsightVariant = useCallback((variant: InsightVariant, context?: string) => {
    updateActiveConfig({ insight: { variant, context } });
  }, [updateActiveConfig]);

  // Set catalyst variant for active preset
  const setCatalystVariant = useCallback((variant: TechVariant) => {
    updateActiveConfig({ catalyst: { variant } });
  }, [updateActiveConfig]);

  // Generate AI cards for active preset
  const generateCards = useCallback(async (forceRegenerate = false): Promise<Card[]> => {
    if (!activePreset) return [];
    
    const { variant, context } = activePreset.config.insight;
    if (variant === 'general' || !context) {
      toast.error('Select an industry or region first');
      return [];
    }
    
    // Check cache
    if (!forceRegenerate && activePreset.generatedCards?.length) {
      return activePreset.generatedCards;
    }
    
    setIsGenerating(true);
    try {
      const type = variant === 'industry' ? 'industry' : 'region';
      const { data, error } = await supabase.functions.invoke('generate-deck', {
        body: { type, context },
      });

      if (error) throw error;

      const cards: Card[] = (data.cards || []).map((text: string, idx: number) => ({
        id: `gen-${variant}-${idx}`,
        text,
        category: 'insight' as const,
        isWildcard: false,
        isGenerated: true,
      }));

      // Update preset with generated cards
      updatePreset(activePreset.id, { generatedCards: cards });
      
      toast.success(`Generated ${cards.length} ${type} insights for "${context}"`);
      return cards;
    } catch (error) {
      console.error('Error generating deck:', error);
      toast.error('Failed to generate deck');
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, [activePreset, updatePreset]);

  // Wildcard management
  const addWildcard = useCallback((text: string, category: Category) => {
    const newCard: Card = {
      id: `w-${Date.now()}`,
      text,
      category,
      isWildcard: true,
    };
    setState(prev => {
      const updated = { ...prev, wildcards: [...prev.wildcards, newCard] };
      persistState(updated);
      return updated;
    });
  }, [persistState]);

  const removeWildcard = useCallback((id: string) => {
    setState(prev => {
      const updated = { ...prev, wildcards: prev.wildcards.filter(w => w.id !== id) };
      persistState(updated);
      return updated;
    });
  }, [persistState]);

  const updateWildcard = useCallback((id: string, text: string) => {
    setState(prev => {
      const updated = {
        ...prev,
        wildcards: prev.wildcards.map(w => w.id === id ? { ...w, text } : w),
      };
      persistState(updated);
      return updated;
    });
  }, [persistState]);

  // Get cards for a category based on active preset
  const getCardsForCategory = useCallback((category: Category): Card[] => {
    if (!activePreset) return defaultCards.filter(c => c.category === category);
    
    const { insight, catalyst } = activePreset.config;
    
    if (category === 'insight') {
      if (insight.variant !== 'general' && activePreset.generatedCards?.length) {
        return activePreset.generatedCards;
      }
      return defaultCards.filter(c => c.category === 'insight');
    }
    
    if (category === 'tech') {
      if (catalyst.variant === 'format') return contentFormatCards;
      if (catalyst.variant === 'channel') return channelCards;
      return defaultCards.filter(c => c.category === 'tech');
    }
    
    return defaultCards.filter(c => c.category === category);
  }, [activePreset]);

  // Get all cards for shuffling (includes wildcards)
  const getAllCardsForShuffle = useCallback((): Card[] => {
    const categories: Category[] = ['insight', 'asset', 'tech', 'random'];
    const cards: Card[] = [];
    
    categories.forEach(cat => {
      cards.push(...getCardsForCategory(cat));
      cards.push(...state.wildcards.filter(w => w.category === cat));
    });
    
    return cards;
  }, [getCardsForCategory, state.wildcards]);

  // Get display info for active preset
  const getActivePresetInfo = useCallback(() => {
    if (!activePreset) return null;
    
    const { insight, catalyst } = activePreset.config;
    
    return {
      insightLabel: insightVariantLabels[insight.variant],
      insightContext: insight.context,
      catalystLabel: catalystVariantLabels[catalyst.variant],
      hasGeneratedCards: Boolean(activePreset.generatedCards?.length),
      generatedCardsCount: activePreset.generatedCards?.length || 0,
    };
  }, [activePreset]);

  // Export/Import
  const exportPresets = useCallback(() => {
    const exportData = {
      version: 1,
      presets: state.presets.filter(p => !p.isDefault),
      wildcards: state.wildcards,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(exportData, null, 2);
  }, [state]);

  const importPresets = useCallback((json: string) => {
    try {
      const data = JSON.parse(json);
      if (data.version !== 1) throw new Error('Invalid version');
      
      setState(prev => {
        const existingIds = new Set(prev.presets.map(p => p.id));
        const newPresets = (data.presets || []).map((p: DeckPreset) => ({
          ...p,
          id: existingIds.has(p.id) ? `${p.id}-${Date.now()}` : p.id,
        }));
        
        const updated = {
          ...prev,
          presets: [...prev.presets, ...newPresets],
          wildcards: [...prev.wildcards, ...(data.wildcards || [])],
        };
        persistState(updated);
        return updated;
      });
      
      toast.success('Presets imported successfully');
    } catch (error) {
      toast.error('Failed to import presets');
    }
  }, [persistState]);

  // Reset everything to defaults
  const resetAll = useCallback(() => {
    const defaultState: DeckManagerState = {
      activePresetId: 'preset-general',
      presets: createDefaultPresets(),
      wildcards: [],
    };
    setState(defaultState);
    persistState(defaultState);
    toast.success('Reset to defaults');
  }, [persistState]);

  return {
    // State
    presets: state.presets,
    activePreset,
    wildcards: state.wildcards,
    isGenerating,
    
    // Preset actions
    activatePreset,
    createPreset,
    updatePreset,
    deletePreset,
    duplicatePreset,
    
    // Config actions
    setInsightVariant,
    setCatalystVariant,
    generateCards,
    
    // Wildcard actions
    addWildcard,
    removeWildcard,
    updateWildcard,
    
    // Card getters
    getCardsForCategory,
    getAllCardsForShuffle,
    getActivePresetInfo,
    
    // Export/Import
    exportPresets,
    importPresets,
    
    // Reset
    resetAll,
  };
}
