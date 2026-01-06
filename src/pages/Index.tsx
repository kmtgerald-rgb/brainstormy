import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Layers, Lightbulb, Shuffle } from 'lucide-react';
import { Header } from '@/components/Header';
import { CategorySection } from '@/components/CategorySection';
import { ShuffleArea } from '@/components/ShuffleArea';
import { TwistModal } from '@/components/TwistModal';
import { IdeaBoard } from '@/components/IdeaBoard';
import { CollaborativeIdeaBoard } from '@/components/CollaborativeIdeaBoard';
import { EditCardDialog } from '@/components/EditCardDialog';
import { useCards, FilterMode } from '@/hooks/useCards';
import { useSession } from '@/hooks/useSession';
import { useModerator } from '@/hooks/useModerator';
import { Card, Category, defaultCards } from '@/data/defaultCards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const categories: Category[] = ['insight', 'asset', 'tech', 'random'];

const Index = () => {
  const {
    getCardsByCategory,
    addWildcard: addLocalWildcard,
    removeWildcard: removeLocalWildcard,
    selectedCards,
    setSelectedCards,
    clearSelection,
    saveIdea: saveLocalIdea,
    savedIdeas: localSavedIdeas,
    deleteIdea: deleteLocalIdea,
    wildcards: localWildcards,
  } = useCards();

  const {
    session,
    ideas: sessionIdeas,
    wildcards: sessionWildcards,
    isLoading,
    participantCount,
    createSession,
    joinSession,
    leaveSession,
    addIdea: addSessionIdea,
    deleteIdea: deleteSessionIdea,
    addWildcard: addSessionWildcard,
    deleteWildcard: deleteSessionWildcard,
  } = useSession();

  const {
    isModeratorMode,
    toggleModeratorMode,
    updateCardText,
    resetCardText,
    getCardText,
    hasOverride,
  } = useModerator();

  const [categoryFilters, setCategoryFilters] = useState<Record<Category, FilterMode>>({
    insight: 'all',
    asset: 'all',
    tech: 'all',
    random: 'all',
  });

  const [isTwistOpen, setIsTwistOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  // Apply card overrides to cards
  const applyOverrides = useCallback(
    (cards: Card[]): Card[] => {
      return cards.map((card) => ({
        ...card,
        text: getCardText(card.id, card.text),
      }));
    },
    [getCardText]
  );

  // Combine default cards with session wildcards when in a session
  const getCardsForCategory = useCallback(
    (category: Category, filter: FilterMode): Card[] => {
      const baseCards = getCardsByCategory(category, filter);

      if (session && filter !== 'default') {
        const sessionCards = sessionWildcards
          .filter((w) => w.category === category)
          .map((w) => ({
            id: w.id,
            text: w.text,
            category: w.category,
            isWildcard: true,
          }));

        if (filter === 'wildcards') {
          return applyOverrides([...baseCards.filter((c) => c.isWildcard), ...sessionCards]);
        }
        return applyOverrides([...baseCards, ...sessionCards]);
      }

      return applyOverrides(baseCards);
    },
    [getCardsByCategory, session, sessionWildcards, applyOverrides]
  );

  // All cards for shuffling (include session wildcards) with overrides applied
  const allCardsForShuffle = useMemo(() => {
    const base = [...defaultCards, ...localWildcards].map((card) => ({
      ...card,
      text: getCardText(card.id, card.text),
    }));
    if (session) {
      const sessionCards = sessionWildcards.map((w) => ({
        id: w.id,
        text: w.text,
        category: w.category,
        isWildcard: true,
      }));
      return [...base, ...sessionCards];
    }
    return base;
  }, [localWildcards, session, sessionWildcards, getCardText]);

  // Find original text for a card
  const getOriginalText = useCallback(
    (cardId: string): string | undefined => {
      const defaultCard = defaultCards.find((c) => c.id === cardId);
      if (defaultCard) return defaultCard.text;
      const wildcardCard = localWildcards.find((c) => c.id === cardId);
      return wildcardCard?.text;
    },
    [localWildcards]
  );

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
  };

  const handleSaveCardEdit = (cardId: string, newText: string) => {
    updateCardText(cardId, newText);
  };

  const handleResetCard = (cardId: string) => {
    resetCardText(cardId);
  };

  const handleFilterChange = (category: Category, filter: FilterMode) => {
    setCategoryFilters((prev) => ({ ...prev, [category]: filter }));
  };

  const handleAddWildcard = async (text: string, category: Category) => {
    if (session) {
      await addSessionWildcard(text, category);
    } else {
      addLocalWildcard(text, category);
    }
  };

  const handleRemoveWildcard = async (id: string) => {
    if (session && sessionWildcards.some((w) => w.id === id)) {
      await deleteSessionWildcard(id);
    } else {
      removeLocalWildcard(id);
    }
  };

  const handleShuffle = () => {
    const newSelection: Record<Category, Card | null> = {
      insight: null,
      asset: null,
      tech: null,
      random: null,
    };

    categories.forEach((category) => {
      const categoryCards = allCardsForShuffle.filter((c) => c.category === category);
      if (categoryCards.length > 0) {
        const randomIndex = Math.floor(Math.random() * categoryCards.length);
        newSelection[category] = categoryCards[randomIndex];
      }
    });

    setSelectedCards(newSelection);
  };

  const handleSaveIdea = async (title: string, description: string, author?: string) => {
    if (session) {
      const cards = {
        insight: selectedCards.insight?.text || '',
        asset: selectedCards.asset?.text || '',
        tech: selectedCards.tech?.text || '',
        random: selectedCards.random?.text || '',
      };
      await addSessionIdea(title, description, author, cards);
    } else {
      saveLocalIdea(title, description, author);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    if (session) {
      await deleteSessionIdea(id);
    } else {
      deleteLocalIdea(id);
    }
  };

  const displayedIdeas = session ? sessionIdeas : localSavedIdeas;

  return (
    <div className="min-h-screen bg-background">
      <Header
        session={session}
        participantCount={participantCount}
        isLoading={isLoading}
        onCreateSession={createSession}
        onJoinSession={joinSession}
        onLeaveSession={leaveSession}
        isModeratorMode={isModeratorMode}
        onToggleModeratorMode={toggleModeratorMode}
      />

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="shuffle" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="shuffle" className="gap-2">
              <Shuffle className="w-4 h-4" />
              Shuffle
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <Layers className="w-4 h-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="ideas" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Ideas
              {displayedIdeas.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-foreground text-background rounded-full">
                  {displayedIdeas.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shuffle">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ShuffleArea
                selectedCards={selectedCards}
                onShuffle={handleShuffle}
                onTwist={() => setIsTwistOpen(true)}
                onClear={clearSelection}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="library">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-12"
            >
              <div className="text-center space-y-2">
                <h2 className="font-display text-3xl font-bold">Card Library</h2>
                <p className="text-muted-foreground">
                  Browse all cards or create your own wildcards
                  {session && ' (shared with session)'}
                </p>
              </div>

              {isModeratorMode && (
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-sm">
                    ✏️ Moderator Mode: Click any card to edit
                  </span>
                </div>
              )}

              {categories.map((category) => (
                <CategorySection
                  key={category}
                  category={category}
                  cards={getCardsForCategory(category, categoryFilters[category])}
                  filter={categoryFilters[category]}
                  onFilterChange={(filter) => handleFilterChange(category, filter)}
                  onAddWildcard={handleAddWildcard}
                  onRemoveWildcard={handleRemoveWildcard}
                  isModeratorMode={isModeratorMode}
                  onEditCard={handleEditCard}
                  hasOverride={hasOverride}
                />
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="ideas">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {session ? (
                <CollaborativeIdeaBoard ideas={sessionIdeas} onDelete={handleDeleteIdea} />
              ) : (
                <IdeaBoard ideas={localSavedIdeas} onDelete={handleDeleteIdea} />
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      <TwistModal
        isOpen={isTwistOpen}
        onClose={() => setIsTwistOpen(false)}
        selectedCards={selectedCards}
        onSave={handleSaveIdea}
        isCollaborative={!!session}
      />

      <EditCardDialog
        card={editingCard}
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        onSave={handleSaveCardEdit}
        onReset={handleResetCard}
        hasOverride={editingCard ? hasOverride(editingCard.id) : false}
        originalText={editingCard ? getOriginalText(editingCard.id) : undefined}
      />
    </div>
  );
};

export default Index;
