import { useState } from 'react';
import { Card, Category } from '@/data/defaultCards';
import { toast } from 'sonner';

interface AISuggestion {
  title: string;
  description: string;
}

export function useAISuggestion() {
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getSuggestion = async (
    selectedCards: Record<Category, Card | null>,
    problemStatement?: string | null
  ) => {
    const { insight, asset, tech, random } = selectedCards;
    
    if (!insight || !asset || !tech || !random) {
      toast.error('Please shuffle to select all four cards first');
      return;
    }

    setIsLoading(true);
    setSuggestion(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/suggest-idea`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            cards: {
              insight: insight.text,
              asset: asset.text,
              tech: tech.text,
              random: random.text,
            },
            problemStatement: problemStatement || undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please wait a moment and try again.');
          return;
        }
        if (response.status === 402) {
          toast.error('AI credits exhausted. Please add funds to continue.');
          return;
        }
        throw new Error(errorData.error || 'Failed to get AI suggestion');
      }

      const data = await response.json();
      setSuggestion(data);
      toast.success('AI suggestion generated!');
    } catch (error) {
      console.error('AI suggestion error:', error);
      toast.error('Failed to generate AI suggestion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearSuggestion = () => {
    setSuggestion(null);
  };

  return {
    suggestion,
    isLoading,
    getSuggestion,
    clearSuggestion,
  };
}
