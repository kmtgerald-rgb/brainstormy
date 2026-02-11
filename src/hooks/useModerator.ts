import { useState, useCallback } from 'react';
import { FocusType } from '@/data/focusTypes';

const MODERATOR_KEY = 'mashup-moderator-mode';
const CARD_OVERRIDES_KEY = 'mashup-card-overrides';
const PROBLEM_CONTEXT_KEY = 'mashup-local-problem-context';
const PROBLEM_STATEMENT_KEY = 'mashup-local-problem-statement';
const FOCUS_TYPE_KEY = 'mashup-focus-type';

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

  const [localProblemContext, setLocalProblemContext] = useState<string | null>(() => {
    return localStorage.getItem(PROBLEM_CONTEXT_KEY);
  });

  const [localProblemStatement, setLocalProblemStatement] = useState<string | null>(() => {
    return localStorage.getItem(PROBLEM_STATEMENT_KEY);
  });

  const [focusType, setFocusTypeState] = useState<FocusType>(() => {
    return (localStorage.getItem(FOCUS_TYPE_KEY) as FocusType) || 'hmw';
  });

  const setFocusType = useCallback((type: FocusType) => {
    localStorage.setItem(FOCUS_TYPE_KEY, type);
    setFocusTypeState(type);
  }, []);

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

  const resetProblemStatement = useCallback(() => {
    localStorage.removeItem(PROBLEM_CONTEXT_KEY);
    localStorage.removeItem(PROBLEM_STATEMENT_KEY);
    localStorage.removeItem(FOCUS_TYPE_KEY);
    setLocalProblemContext(null);
    setLocalProblemStatement(null);
    setFocusTypeState('hmw');
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

  const updateLocalProblemStatement = useCallback((context: string, statement: string) => {
    if (context) {
      localStorage.setItem(PROBLEM_CONTEXT_KEY, context);
    } else {
      localStorage.removeItem(PROBLEM_CONTEXT_KEY);
    }
    if (statement) {
      localStorage.setItem(PROBLEM_STATEMENT_KEY, statement);
    } else {
      localStorage.removeItem(PROBLEM_STATEMENT_KEY);
    }
    setLocalProblemContext(context || null);
    setLocalProblemStatement(statement || null);
  }, []);

  return {
    isModeratorMode,
    toggleModeratorMode,
    updateCardText,
    resetCardText,
    resetAllOverrides,
    resetProblemStatement,
    getCardText,
    hasOverride,
    cardOverrides,
    localProblemContext,
    localProblemStatement,
    updateLocalProblemStatement,
    focusType,
    setFocusType,
  };
}
