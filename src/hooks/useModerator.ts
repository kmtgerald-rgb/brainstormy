import { useState, useCallback } from 'react';

const MODERATOR_KEY = 'mashup-moderator-mode';
const CARD_OVERRIDES_KEY = 'mashup-card-overrides';

export interface CardOverride {
  id: string;
  text: string;
}

export function useModerator() {
  const [isModeratorMode, setIsModeratorMode] = useState<boolean>(() => {
    const stored = localStorage.getItem(MODERATOR_KEY);
    return stored === 'true';
  });

  const [cardOverrides, setCardOverrides] = useState<Record<string, string>>(() => {
    const stored = localStorage.getItem(CARD_OVERRIDES_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  const toggleModeratorMode = useCallback(() => {
    setIsModeratorMode((prev) => {
      const newValue = !prev;
      localStorage.setItem(MODERATOR_KEY, String(newValue));
      return newValue;
    });
  }, []);

  const updateCardText = useCallback((cardId: string, newText: string) => {
    setCardOverrides((prev) => {
      const updated = { ...prev, [cardId]: newText };
      localStorage.setItem(CARD_OVERRIDES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetCardText = useCallback((cardId: string) => {
    setCardOverrides((prev) => {
      const updated = { ...prev };
      delete updated[cardId];
      localStorage.setItem(CARD_OVERRIDES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetAllOverrides = useCallback(() => {
    setCardOverrides({});
    localStorage.removeItem(CARD_OVERRIDES_KEY);
  }, []);

  const getCardText = useCallback(
    (cardId: string, originalText: string): string => {
      return cardOverrides[cardId] ?? originalText;
    },
    [cardOverrides]
  );

  const hasOverride = useCallback(
    (cardId: string): boolean => {
      return cardId in cardOverrides;
    },
    [cardOverrides]
  );

  return {
    isModeratorMode,
    toggleModeratorMode,
    updateCardText,
    resetCardText,
    resetAllOverrides,
    getCardText,
    hasOverride,
    cardOverrides,
  };
}
