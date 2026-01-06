import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/data/defaultCards';

interface ExplanationState {
  text: string | null;
  loading: boolean;
  error: string | null;
}

export function useCardExplanation() {
  const [explanations, setExplanations] = useState<Record<string, ExplanationState>>({});

  const getExplanation = useCallback(async (card: Card) => {
    // Check if already cached
    if (explanations[card.id]?.text) {
      return explanations[card.id].text;
    }

    // Set loading state
    setExplanations(prev => ({
      ...prev,
      [card.id]: { text: null, loading: true, error: null }
    }));

    try {
      const { data, error } = await supabase.functions.invoke('explain-card', {
        body: { cardText: card.text, category: card.category }
      });

      if (error) throw error;

      const explanation = data?.explanation || 'No explanation available.';
      
      setExplanations(prev => ({
        ...prev,
        [card.id]: { text: explanation, loading: false, error: null }
      }));

      return explanation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load explanation';
      
      setExplanations(prev => ({
        ...prev,
        [card.id]: { text: null, loading: false, error: errorMessage }
      }));

      return null;
    }
  }, [explanations]);

  const getState = useCallback((cardId: string): ExplanationState => {
    return explanations[cardId] || { text: null, loading: false, error: null };
  }, [explanations]);

  return { getExplanation, getState };
}
