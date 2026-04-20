import { useState, useCallback } from 'react';
import i18n from '@/i18n';
import { supabase } from '@/integrations/supabase/client';
import { Card, Category } from '@/data/defaultCards';
import { toast } from 'sonner';

interface RegenerationState {
  isRegenerating: Record<Category, boolean>;
  regenerateCard: (
    category: Category,
    existingCards: Card[],
    problemStatement?: string | null
  ) => Promise<Card | null>;
}

export function useCardRegeneration(): RegenerationState {
  const [isRegenerating, setIsRegenerating] = useState<Record<Category, boolean>>({
    insight: false,
    asset: false,
    tech: false,
    random: false,
  });

  const regenerateCard = useCallback(
    async (
      category: Category,
      existingCards: Card[],
      problemStatement?: string | null
    ): Promise<Card | null> => {
      setIsRegenerating((prev) => ({ ...prev, [category]: true }));

      try {
        const categoryCards = existingCards
          .filter((c) => c.category === category)
          .map((c) => c.text);

        const { data, error } = await supabase.functions.invoke('generate-card', {
          body: {
            category,
            existingCards: categoryCards,
            problemStatement: problemStatement || undefined,
            language: i18n.language,
          },
        });

        if (error) {
          console.error('Regeneration error:', error);
          toast.error('Failed to generate new card');
          return null;
        }

        if (data?.error) {
          if (data.error.includes('Rate limit')) {
            toast.error('Too many requests. Please wait a moment.');
          } else {
            toast.error(data.error);
          }
          return null;
        }

        const generatedText = data?.text;
        if (!generatedText) {
          toast.error('No content generated');
          return null;
        }

        const newCard: Card = {
          id: `gen-${Date.now()}`,
          text: generatedText,
          category,
          isWildcard: false,
          isGenerated: true,
        };

        toast.success('New card generated!');
        return newCard;
      } catch (err) {
        console.error('Regeneration exception:', err);
        toast.error('Failed to generate card');
        return null;
      } finally {
        setIsRegenerating((prev) => ({ ...prev, [category]: false }));
      }
    },
    []
  );

  return {
    isRegenerating,
    regenerateCard,
  };
}
