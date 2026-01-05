import { useState, useCallback, useMemo } from 'react';
import { Card, Category, defaultCards } from '@/data/defaultCards';

const WILDCARDS_KEY = 'mashup-wildcards';
const SAVED_IDEAS_KEY = 'mashup-saved-ideas';

export interface SavedIdea {
  id: string;
  title: string;
  description: string;
  cards: Card[];
  author?: string;
  createdAt: Date;
}

export type FilterMode = 'all' | 'default' | 'wildcards';

export function useCards() {
  const [wildcards, setWildcards] = useState<Card[]>(() => {
    const stored = localStorage.getItem(WILDCARDS_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>(() => {
    const stored = localStorage.getItem(SAVED_IDEAS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((idea: SavedIdea) => ({
        ...idea,
        createdAt: new Date(idea.createdAt),
      }));
    }
    return [];
  });

  const [selectedCards, setSelectedCards] = useState<Record<Category, Card | null>>({
    insight: null,
    asset: null,
    tech: null,
    random: null,
  });

  const allCards = useMemo(() => [...defaultCards, ...wildcards], [wildcards]);

  const getCardsByCategory = useCallback(
    (category: Category, filter: FilterMode = 'all'): Card[] => {
      const categoryCards = allCards.filter((c) => c.category === category);
      if (filter === 'default') return categoryCards.filter((c) => !c.isWildcard);
      if (filter === 'wildcards') return categoryCards.filter((c) => c.isWildcard);
      return categoryCards;
    },
    [allCards]
  );

  const addWildcard = useCallback((text: string, category: Category) => {
    const newCard: Card = {
      id: `w-${Date.now()}`,
      text,
      category,
      isWildcard: true,
    };
    setWildcards((prev) => {
      const updated = [...prev, newCard];
      localStorage.setItem(WILDCARDS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeWildcard = useCallback((id: string) => {
    setWildcards((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      localStorage.setItem(WILDCARDS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const shuffleCards = useCallback(() => {
    const categories: Category[] = ['insight', 'asset', 'tech', 'random'];
    const newSelection: Record<Category, Card | null> = {
      insight: null,
      asset: null,
      tech: null,
      random: null,
    };

    categories.forEach((category) => {
      const categoryCards = allCards.filter((c) => c.category === category);
      if (categoryCards.length > 0) {
        const randomIndex = Math.floor(Math.random() * categoryCards.length);
        newSelection[category] = categoryCards[randomIndex];
      }
    });

    setSelectedCards(newSelection);
    return newSelection;
  }, [allCards]);

  const saveIdea = useCallback(
    (title: string, description: string, author?: string) => {
      const cards = Object.values(selectedCards).filter((c): c is Card => c !== null);
      if (cards.length !== 4) return null;

      const newIdea: SavedIdea = {
        id: `idea-${Date.now()}`,
        title,
        description,
        cards,
        author,
        createdAt: new Date(),
      };

      setSavedIdeas((prev) => {
        const updated = [newIdea, ...prev];
        localStorage.setItem(SAVED_IDEAS_KEY, JSON.stringify(updated));
        return updated;
      });

      return newIdea;
    },
    [selectedCards]
  );

  const deleteIdea = useCallback((id: string) => {
    setSavedIdeas((prev) => {
      const updated = prev.filter((idea) => idea.id !== id);
      localStorage.setItem(SAVED_IDEAS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCards({
      insight: null,
      asset: null,
      tech: null,
      random: null,
    });
  }, []);

  return {
    allCards,
    wildcards,
    savedIdeas,
    selectedCards,
    getCardsByCategory,
    addWildcard,
    removeWildcard,
    shuffleCards,
    saveIdea,
    deleteIdea,
    clearSelection,
    setSelectedCards,
  };
}
