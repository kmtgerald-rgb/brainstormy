import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, Lightbulb } from 'lucide-react';
import { Header } from '@/components/Header';
import { CategorySection } from '@/components/CategorySection';
import { CardLibraryHeader, ViewMode } from '@/components/CardLibraryHeader';
import { ShuffleArea } from '@/components/ShuffleArea';
import { TwistModal } from '@/components/TwistModal';
import { IdeaBoard } from '@/components/IdeaBoard';
import { CollaborativeIdeaBoard } from '@/components/CollaborativeIdeaBoard';
import { EditCardDialog } from '@/components/EditCardDialog';
import { ProblemStatementEditor } from '@/components/ProblemStatementEditor';
import { ProblemStatementBanner } from '@/components/ProblemStatementBanner';
import { GameHUD } from '@/components/GameHUD';
import { GameEndModal } from '@/components/GameEndModal';
import { useCards, FilterMode } from '@/hooks/useCards';
import { useSession } from '@/hooks/useSession';
import { useModerator } from '@/hooks/useModerator';
import { useGameMode } from '@/hooks/useGameMode';
import { Card, Category, defaultCards } from '@/data/defaultCards';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const categories: Category[] = ['insight', 'asset', 'tech', 'random'];

const STORAGE_KEY = 'mashup-preferred-mode';

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
    sessionHistory,
    removeFromHistory,
    createSession,
    joinSession,
    leaveSession,
    addIdea: addSessionIdea,
    deleteIdea: deleteSessionIdea,
    addWildcard: addSessionWildcard,
    deleteWildcard: deleteSessionWildcard,
    updateProblemStatement,
  } = useSession();

  const {
    isModeratorMode,
    toggleModeratorMode,
    updateCardText,
    resetCardText,
    getCardText,
    hasOverride,
    localProblemContext,
    localProblemStatement,
    updateLocalProblemStatement,
  } = useModerator();

  // Mode state with localStorage persistence
  const [mode, setMode] = useState<'solo' | 'collaborative'>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'collaborative' ? 'collaborative' : 'solo';
  });
  const [pendingModeChange, setPendingModeChange] = useState<'solo' | 'collaborative' | null>(null);

  // Game mode hook (needs mode variable to be defined first)
  const gameMode = useGameMode(mode === 'collaborative');

  // Persist mode preference
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  // Auto-switch to collaborative when joining/creating a session
  useEffect(() => {
    if (session && mode === 'solo') {
      setMode('collaborative');
    }
  }, [session, mode]);

  const handleModeChange = (newMode: 'solo' | 'collaborative') => {
    if (newMode === 'solo' && session) {
      // Show confirmation dialog
      setPendingModeChange(newMode);
    } else {
      setMode(newMode);
    }
  };

  const confirmModeChange = () => {
    if (pendingModeChange === 'solo') {
      leaveSession();
      setMode('solo');
    }
    setPendingModeChange(null);
  };

  const [categoryFilters, setCategoryFilters] = useState<Record<Category, FilterMode>>({
    insight: 'all',
    asset: 'all',
    tech: 'all',
    random: 'all',
  });

  const [isTwistOpen, setIsTwistOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isFocusEditorOpen, setIsFocusEditorOpen] = useState(false);
  
  // Card Library state
  const [libraryViewMode, setLibraryViewMode] = useState<ViewMode>('grid');
  const [librarySearchTerm, setLibrarySearchTerm] = useState('');
  const [showModifiedOnly, setShowModifiedOnly] = useState(false);

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

  // Get cards for library with modified-only filter
  const getLibraryCards = useCallback(
    (category: Category, filter: FilterMode): Card[] => {
      let cards = getCardsForCategory(category, filter);
      
      if (showModifiedOnly && isModeratorMode) {
        cards = cards.filter((card) => hasOverride(card.id));
      }
      
      return cards;
    },
    [getCardsForCategory, showModifiedOnly, isModeratorMode, hasOverride]
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

  const handleReplaceCard = (category: Category, card: Card) => {
    setSelectedCards((prev) => ({
      ...prev,
      [category]: card,
    }));
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
    // Increment ideas count for game mode
    gameMode.incrementIdeas();
  };

  const handleDeleteIdea = async (id: string) => {
    if (session) {
      await deleteSessionIdea(id);
    } else {
      deleteLocalIdea(id);
    }
  };

  const displayedIdeas = session ? sessionIdeas : localSavedIdeas;

  const handlePlayAgain = () => {
    gameMode.resetGame();
    gameMode.startGame();
  };

  const handleViewIdeas = () => {
    gameMode.closeEndModal();
    const ideasSection = document.getElementById('ideas-section');
    ideasSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        mode={mode}
        onModeChange={handleModeChange}
        session={session}
        participantCount={participantCount}
        isLoading={isLoading}
        sessionHistory={sessionHistory}
        onCreateSession={createSession}
        onJoinSession={joinSession}
        onLeaveSession={leaveSession}
        onRemoveFromHistory={removeFromHistory}
        isModeratorMode={isModeratorMode}
        onToggleModeratorMode={toggleModeratorMode}
        onSetFocus={() => setIsFocusEditorOpen(true)}
        // Game mode props
        gameMode={gameMode.mode}
        gameSettings={gameMode.settings}
        availableGameModes={gameMode.availableModes}
        isGameRunning={gameMode.isRunning}
        onGameModeChange={gameMode.changeMode}
        onGameSettingsChange={gameMode.updateSettings}
      />

      <main className="container mx-auto px-4 py-12 md:py-16 space-y-16">
        {/* Problem Statement Banner */}
        {(session?.problem_statement || localProblemStatement) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ProblemStatementBanner
              statement={session?.problem_statement || localProblemStatement}
              isModeratorMode={isModeratorMode}
              onEdit={() => setIsFocusEditorOpen(true)}
            />
          </motion.div>
        )}

        {/* Game HUD */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <GameHUD
            mode={gameMode.mode}
            settings={gameMode.settings}
            isRunning={gameMode.isRunning}
            isPaused={gameMode.isPaused}
            timeRemaining={gameMode.timeRemaining}
            ideasCount={gameMode.ideasCount}
            requiresStart={gameMode.requiresStart}
            formatTime={gameMode.formatTime}
            onStart={gameMode.startGame}
            onPause={gameMode.pauseGame}
            onResume={gameMode.resumeGame}
            onEnd={gameMode.endGame}
            onReset={gameMode.resetGame}
          />
        </motion.div>

        {/* Shuffle Canvas - Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ShuffleArea
            selectedCards={selectedCards}
            onShuffle={handleShuffle}
            onTwist={() => setIsTwistOpen(true)}
            onClear={clearSelection}
            problemStatement={session?.problem_statement || localProblemStatement}
            canPlay={gameMode.canPlay}
          />
        </motion.section>

        {/* Secondary Navigation */}
        <div className="flex justify-center gap-4 border-t border-border pt-12">
          <Sheet open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 font-mono text-xs uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                Browse Library
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle className="font-serif text-2xl">Card Library</SheetTitle>
                <p className="text-sm text-muted-foreground">
                  Browse all cards or create your own wildcards
                  {session && ' (shared with session)'}
                </p>
                {isModeratorMode && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-600 text-xs font-mono uppercase tracking-wider mt-2">
                    Moderator Mode: Click any card to edit
                  </div>
                )}
              </SheetHeader>
              
              {/* Library Header with Search and View Toggle */}
              <div className="mb-8">
                <CardLibraryHeader
                  searchTerm={librarySearchTerm}
                  onSearchChange={setLibrarySearchTerm}
                  viewMode={libraryViewMode}
                  onViewModeChange={setLibraryViewMode}
                  showModifiedOnly={showModifiedOnly}
                  onShowModifiedOnlyChange={setShowModifiedOnly}
                  isModeratorMode={isModeratorMode}
                />
              </div>
              
              <div className="space-y-10">
                {categories.map((category) => (
                  <CategorySection
                    key={category}
                    category={category}
                    cards={getLibraryCards(category, categoryFilters[category])}
                    allCards={allCardsForShuffle}
                    filter={categoryFilters[category]}
                    onFilterChange={(filter) => handleFilterChange(category, filter)}
                    onAddWildcard={handleAddWildcard}
                    onRemoveWildcard={handleRemoveWildcard}
                    isModeratorMode={isModeratorMode}
                    onEditCard={handleEditCard}
                    hasOverride={hasOverride}
                    viewMode={libraryViewMode}
                    searchTerm={librarySearchTerm}
                    onInlineEdit={handleSaveCardEdit}
                    onResetCard={handleResetCard}
                    problemStatement={session?.problem_statement || localProblemStatement}
                  />
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Button 
            variant="outline" 
            className="gap-2 font-mono text-xs uppercase tracking-wider"
            onClick={() => {
              const ideasSection = document.getElementById('ideas-section');
              ideasSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Lightbulb className="w-4 h-4" />
            View Ideas
            {displayedIdeas.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-foreground text-background rounded-full">
                {displayedIdeas.length}
              </span>
            )}
          </Button>
        </div>

        {/* Ideas Section */}
        <motion.section
          id="ideas-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="border-t border-border pt-12"
        >
          {session ? (
            <CollaborativeIdeaBoard ideas={sessionIdeas} onDelete={handleDeleteIdea} />
          ) : (
            <IdeaBoard ideas={localSavedIdeas} onDelete={handleDeleteIdea} />
          )}
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Don't evaluate yet. Combine.
          </p>
        </div>
      </footer>

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

      <ProblemStatementEditor
        isOpen={isFocusEditorOpen}
        onClose={() => setIsFocusEditorOpen(false)}
        currentContext={session?.problem_context ?? localProblemContext}
        currentStatement={session?.problem_statement ?? localProblemStatement}
        onSave={session ? updateProblemStatement : async (ctx, stmt) => updateLocalProblemStatement(ctx, stmt)}
      />

      <GameEndModal
        isOpen={gameMode.showEndModal}
        mode={gameMode.mode}
        settings={gameMode.settings}
        ideasCount={gameMode.ideasCount}
        elapsedTime={gameMode.getElapsedTime()}
        formatTime={gameMode.formatTime}
        onClose={gameMode.closeEndModal}
        onPlayAgain={handlePlayAgain}
        onViewIdeas={handleViewIdeas}
      />

      {/* Mode change confirmation dialog */}
      <AlertDialog open={!!pendingModeChange} onOpenChange={() => setPendingModeChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave current session?</AlertDialogTitle>
            <AlertDialogDescription>
              Switching to Solo mode will leave your current collaborative session. Your ideas will remain saved in the session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmModeChange}>Leave & Switch</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
