import { useState, useCallback } from 'react';
import i18n from '@/i18n';
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
    // Check if already cached or loading
    if (explanations[card.id]?.text || explanations[card.id]?.loading) {
      return explanations[card.id].text;
    }

    // Set loading state
    setExplanations(prev => ({
      ...prev,
      [card.id]: { text: null, loading: true, error: null }
    }));

    try {
      const { data, error } = await supabase.functions.invoke('explain-card', {
        body: { cardText: card.text, category: card.category, language: i18n.language }
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

  // Pre-fetch explanations for multiple cards
  const prefetchExplanations = useCallback((cards: Card[]) => {
    cards.forEach(card => {
      if (!explanations[card.id]?.text && !explanations[card.id]?.loading) {
        getExplanation(card);
      }
    });
  }, [explanations, getExplanation]);

  const getState = useCallback((cardId: string): ExplanationState => {
    return explanations[cardId] || { text: null, loading: false, error: null };
  }, [explanations]);

  return { getExplanation, getState, prefetchExplanations };
}
