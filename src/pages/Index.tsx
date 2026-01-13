import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { CategorySection } from '@/components/CategorySection';
import { CardLibraryHeader, ViewMode } from '@/components/CardLibraryHeader';
import { ShuffleArea } from '@/components/ShuffleArea';
import { FloatingActionBar } from '@/components/FloatingActionBar';
import { IdeaBoard } from '@/components/IdeaBoard';
import { CollaborativeIdeaBoard } from '@/components/CollaborativeIdeaBoard';
import { EditCardDialog } from '@/components/EditCardDialog';
import { ProblemStatementEditor } from '@/components/ProblemStatementEditor';
import { ProblemStatementBanner } from '@/components/ProblemStatementBanner';
import { GameHUD } from '@/components/GameHUD';
import { GameEndModal } from '@/components/GameEndModal';
import { CompetitionEndModal } from '@/components/CompetitionEndModal';
import { IdeasTray } from '@/components/IdeasTray';
import { useDeckManager } from '@/hooks/useDeckManager';
import { useSession } from '@/hooks/useSession';
import { useModerator } from '@/hooks/useModerator';
import { useGameMode } from '@/hooks/useGameMode';
import { useCollaborativeGameMode } from '@/hooks/useCollaborativeGameMode';
import { useAISuggestion } from '@/hooks/useAISuggestion';
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
import { FilterMode } from '@/hooks/useCards';

const categories: Category[] = ['insight', 'asset', 'tech', 'random'];

const STORAGE_KEY = 'mashup-preferred-mode';
const SAVED_IDEAS_KEY = 'mashup-saved-ideas';

interface SavedIdea {
  id: string;
  title: string;
  description: string;
  cards: Card[];
  author?: string;
  createdAt: Date;
  isAIGenerated?: boolean;
}

const Index = () => {
  // Use the new unified deck manager
  const deckManager = useDeckManager();

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
    resetAllOverrides,
    resetProblemStatement,
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

  // Game mode hook
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

  // Local saved ideas state
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

  const [categoryFilters, setCategoryFilters] = useState<Record<Category, FilterMode>>({
    insight: 'all',
    asset: 'all',
    tech: 'all',
    random: 'all',
  });

  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isFocusEditorOpen, setIsFocusEditorOpen] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [participantName, setParticipantName] = useState(() => {
    return localStorage.getItem('brainstormy-participant-name') || '';
  });
  
  // AI suggestion hook
  const { suggestion, isLoading: isAILoading, getSuggestion, clearSuggestion } = useAISuggestion();
  
  // Card Library state
  const [libraryViewMode, setLibraryViewMode] = useState<ViewMode>('grid');
  const [librarySearchTerm, setLibrarySearchTerm] = useState('');
  const [showModifiedOnly, setShowModifiedOnly] = useState(false);

  // Collaborative game mode hook
  const collabGame = useCollaborativeGameMode(session?.id || null, participantName);

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

  // Get cards for category (includes session wildcards when in session)
  const getCardsForCategory = useCallback(
    (category: Category, filter: FilterMode = 'all'): Card[] => {
      const baseCards = deckManager.getCardsForCategory(category);
      const categoryWildcards = deckManager.wildcards.filter(w => w.category === category);

      let cards = [...baseCards, ...categoryWildcards];

      if (session) {
        const sessionCards = sessionWildcards
          .filter((w) => w.category === category)
          .map((w) => ({
            id: w.id,
            text: w.text,
            category: w.category,
            isWildcard: true,
          }));
        cards = [...cards, ...sessionCards];
      }

      if (filter === 'default') {
        cards = cards.filter(c => !c.isWildcard && !c.isGenerated);
      } else if (filter === 'wildcards') {
        cards = cards.filter(c => c.isWildcard);
      }

      return applyOverrides(cards);
    },
    [deckManager, session, sessionWildcards, applyOverrides]
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

  // All cards for shuffling with overrides applied
  const allCardsForShuffle = useMemo(() => {
    const cards: Card[] = [];
    categories.forEach(cat => {
      cards.push(...getCardsForCategory(cat, 'all'));
    });
    return cards;
  }, [getCardsForCategory]);

  // Find original text for a card
  const getOriginalText = useCallback(
    (cardId: string): string | undefined => {
      const defaultCard = defaultCards.find((c) => c.id === cardId);
      if (defaultCard) return defaultCard.text;
      const wildcardCard = deckManager.wildcards.find((c) => c.id === cardId);
      return wildcardCard?.text;
    },
    [deckManager.wildcards]
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
      deckManager.addWildcard(text, category);
    }
  };

  const handleRemoveWildcard = async (id: string) => {
    if (session && sessionWildcards.some((w) => w.id === id)) {
      await deleteSessionWildcard(id);
    } else {
      deckManager.removeWildcard(id);
    }
  };

  const handleShuffle = () => {
    setIsShuffling(true);
    clearSuggestion();
    
    setTimeout(() => {
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
      setShuffleKey((k) => k + 1);
      setIsShuffling(false);
    }, 200);
  };

  const handleClear = () => {
    clearSuggestion();
    setSelectedCards({
      insight: null,
      asset: null,
      tech: null,
      random: null,
    });
  };

  const handleGetSuggestion = () => {
    getSuggestion(selectedCards, session?.problem_statement || localProblemStatement);
  };

  // Derive card states
  const hasAnyCard = categories.some((cat) => selectedCards[cat] !== null);
  const hasAllCards = categories.every((cat) => selectedCards[cat] !== null);

  const saveLocalIdea = useCallback((title: string, description: string, author?: string, isAIGenerated?: boolean) => {
    const cards = Object.values(selectedCards).filter((c): c is Card => c !== null);
    if (cards.length !== 4) return null;

    const newIdea: SavedIdea = {
      id: `idea-${Date.now()}`,
      title,
      description,
      cards,
      author,
      createdAt: new Date(),
      isAIGenerated: isAIGenerated || false,
    };

    setSavedIdeas((prev) => {
      const updated = [newIdea, ...prev];
      localStorage.setItem(SAVED_IDEAS_KEY, JSON.stringify(updated));
      return updated;
    });

    return newIdea;
  }, [selectedCards]);

  const deleteLocalIdea = useCallback((id: string) => {
    setSavedIdeas((prev) => {
      const updated = prev.filter((idea) => idea.id !== id);
      localStorage.setItem(SAVED_IDEAS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleSaveIdea = async (title: string, description: string, author?: string, isAIGenerated?: boolean) => {
    if (author && author !== participantName) {
      setParticipantName(author);
      localStorage.setItem('brainstormy-participant-name', author);
    }

    if (session) {
      const cards = {
        insight: selectedCards.insight?.text || '',
        asset: selectedCards.asset?.text || '',
        tech: selectedCards.tech?.text || '',
        random: selectedCards.random?.text || '',
      };
      await addSessionIdea(title, description, author, cards);
      if (collabGame.mode === 'competition' && collabGame.isRunning) {
        await collabGame.incrementScore();
      }
    } else {
      saveLocalIdea(title, description, author, isAIGenerated);
    }
    gameMode.incrementIdeas();
    clearSuggestion();
  };

  // Direct save of AI suggestion to ideas
  const handleAddSuggestionToIdeas = useCallback(async () => {
    if (!suggestion) return;
    
    if (session) {
      const cards = {
        insight: selectedCards.insight?.text || '',
        asset: selectedCards.asset?.text || '',
        tech: selectedCards.tech?.text || '',
        random: selectedCards.random?.text || '',
      };
      await addSessionIdea(suggestion.title, suggestion.description, participantName || undefined, cards);
      if (collabGame.mode === 'competition' && collabGame.isRunning) {
        await collabGame.incrementScore();
      }
    } else {
      saveLocalIdea(suggestion.title, suggestion.description, undefined, true);
    }
    gameMode.incrementIdeas();
    clearSuggestion();
  }, [suggestion, session, selectedCards, participantName, addSessionIdea, collabGame, saveLocalIdea, gameMode, clearSuggestion]);

  const handleDeleteIdea = async (id: string) => {
    if (session) {
      await deleteSessionIdea(id);
    } else {
      deleteLocalIdea(id);
    }
  };

  const displayedIdeas = session ? sessionIdeas : savedIdeas;

  const handlePlayAgain = () => {
    gameMode.resetGame();
    gameMode.startGame();
  };

  const handleViewIdeas = () => {
    gameMode.closeEndModal();
  };

  // Global reset function - clears deck, ideas, problem focus, and card overrides
  const handleGlobalReset = useCallback(() => {
    // Reset deck manager (presets, wildcards, generated cards)
    deckManager.resetAll();
    // Reset saved ideas
    setSavedIdeas([]);
    localStorage.removeItem(SAVED_IDEAS_KEY);
    // Reset problem statement
    resetProblemStatement();
    // Reset card overrides
    resetAllOverrides();
    // Clear current cards
    handleClear();
  }, [deckManager, resetProblemStatement, resetAllOverrides, handleClear]);

  // Determine active game mode and canPlay
  const activeGameMode = session ? collabGame.mode : gameMode.mode;
  const activeCanPlay = session 
    ? (collabGame.mode === 'freejam' || collabGame.isRunning) 
    : gameMode.canPlay;

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
        gameMode={session ? collabGame.mode : gameMode.mode}
        gameSettings={session ? collabGame.settings : gameMode.settings}
        availableGameModes={session ? ['freejam', 'time-attack', 'target', 'competition'] : gameMode.availableModes}
        isGameRunning={session ? collabGame.isRunning : gameMode.isRunning}
        onGameModeChange={session ? collabGame.updateGameMode : gameMode.changeMode}
        onGameSettingsChange={session ? collabGame.updateGameSettings : gameMode.updateSettings}
        // Deck Hub props
        deckPresets={deckManager.presets}
        activeDeckPreset={deckManager.activePreset}
        deckWildcards={deckManager.wildcards}
        isDeckGenerating={deckManager.isGenerating}
        onActivateDeckPreset={deckManager.activatePreset}
        onCreateDeckPreset={(name) => deckManager.createPreset(name, deckManager.activePreset.config)}
        onDuplicateDeckPreset={deckManager.duplicatePreset}
        onDeleteDeckPreset={deckManager.deletePreset}
        onInsightChange={deckManager.setInsightVariant}
        onCatalystChange={deckManager.setCatalystVariant}
        onGenerateDeck={deckManager.generateCards}
        onAddWildcard={handleAddWildcard}
        onRemoveWildcard={handleRemoveWildcard}
        onEditWildcard={deckManager.updateWildcard}
        getCardsForCategory={deckManager.getCardsForCategory}
        onExportPresets={deckManager.exportPresets}
        onImportPresets={deckManager.importPresets}
        onResetDeck={handleGlobalReset}
        participantName={participantName}
        onParticipantNameChange={(name) => {
          setParticipantName(name);
          localStorage.setItem('brainstormy-participant-name', name);
        }}
      />

      <main className="flex-1 container mx-auto px-4 py-12 md:py-16 space-y-8">
        {/* Game HUD - minimal, only shows for timed modes */}
        {activeGameMode !== 'freejam' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {session ? (
              <GameHUD
                mode={collabGame.mode}
                settings={collabGame.settings}
                isRunning={collabGame.isRunning}
                isPaused={false}
                timeRemaining={collabGame.timeRemaining}
                ideasCount={sessionIdeas.length}
                requiresStart={collabGame.mode !== 'freejam'}
                formatTime={collabGame.formatTime}
                onStart={collabGame.startGame}
                onPause={() => {}}
                onResume={() => {}}
                onEnd={collabGame.endGame}
                onReset={() => {}}
                scores={collabGame.scores}
                currentParticipant={participantName}
                isCollaborative
              />
            ) : (
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
            )}
          </motion.div>
        )}

        {/* Shuffle Canvas */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ShuffleArea
            selectedCards={selectedCards}
            shuffleKey={shuffleKey}
            isShuffling={isShuffling}
            problemStatement={session?.problem_statement || localProblemStatement}
            onEditProblem={() => setIsFocusEditorOpen(true)}
            onSaveIdea={handleSaveIdea}
            onAISuggest={handleGetSuggestion}
            aiSuggestion={suggestion}
            isAILoading={isAILoading}
            isCollaborative={!!session}
            participantName={participantName}
          />
        </motion.section>

      </main>

      {/* Ideas Tray - collapsible footer */}
      <IdeasTray
        ideas={displayedIdeas}
        onDelete={handleDeleteIdea}
        isCollaborative={!!session}
      />

      {/* Floating Action Bar */}
      <FloatingActionBar
        hasAnyCard={hasAnyCard}
        isShuffling={isShuffling}
        canPlay={activeCanPlay}
        onShuffle={handleShuffle}
        onClear={handleClear}
      />

      {/* Footer - add padding for floating bar */}
      <footer className="border-t border-border/50 py-6 pb-24">
        <div className="container mx-auto px-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Don't evaluate yet. Combine.
          </p>
        </div>
      </footer>

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
        isOpen={gameMode.showEndModal && !session}
        mode={gameMode.mode}
        settings={gameMode.settings}
        ideasCount={gameMode.ideasCount}
        elapsedTime={gameMode.getElapsedTime()}
        formatTime={gameMode.formatTime}
        onClose={gameMode.closeEndModal}
        onPlayAgain={handlePlayAgain}
        onViewIdeas={handleViewIdeas}
      />

      <CompetitionEndModal
        isOpen={collabGame.showEndModal && !!session}
        scores={collabGame.scores}
        currentParticipant={participantName}
        onClose={collabGame.closeEndModal}
        onViewIdeas={collabGame.closeEndModal}
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
