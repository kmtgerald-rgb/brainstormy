import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { ShuffleArea } from '@/components/ShuffleArea';
import { FloatingActionBar } from '@/components/FloatingActionBar';
import { EditCardDialog } from '@/components/EditCardDialog';
import { ProblemStatementEditor } from '@/components/ProblemStatementEditor';
import { GameHUD } from '@/components/GameHUD';
import { GameEndModal } from '@/components/GameEndModal';
import { IdeasTray } from '@/components/IdeasTray';
import { DeckBrowserSheet } from '@/components/DeckBrowserSheet';
import { useDeckManager } from '@/hooks/useDeckManager';
import { useModerator } from '@/hooks/useModerator';
import { useGameMode } from '@/hooks/useGameMode';
import { useAISuggestion } from '@/hooks/useAISuggestion';
import { useCardRegeneration } from '@/hooks/useCardRegeneration';
import { Card, Category, defaultCards } from '@/data/defaultCards';
import { FilterMode } from '@/hooks/useCards';

const categories: Category[] = ['insight', 'asset', 'tech', 'random'];

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
  // Use the unified deck manager
  const deckManager = useDeckManager();

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

  // Game mode hook
  const gameMode = useGameMode();

  // Card regeneration hook
  const { isRegenerating, regenerateCard } = useCardRegeneration();

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
  
  // AI suggestion hook
  const { suggestion, isLoading: isAILoading, getSuggestion, clearSuggestion } = useAISuggestion();
  const [autoAISuggest, setAutoAISuggest] = useState(() => {
    return localStorage.getItem('brainstormy-auto-ai-suggest') === 'true';
  });

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

  // Get cards for category
  const getCardsForCategory = useCallback(
    (category: Category, filter: FilterMode = 'all'): Card[] => {
      const baseCards = deckManager.getCardsForCategory(category);
      const categoryWildcards = deckManager.wildcards.filter(w => w.category === category);

      let cards = [...baseCards, ...categoryWildcards];

      if (filter === 'default') {
        cards = cards.filter(c => !c.isWildcard && !c.isGenerated);
      } else if (filter === 'wildcards') {
        cards = cards.filter(c => c.isWildcard);
      }

      return applyOverrides(cards);
    },
    [deckManager, applyOverrides]
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

  const handleRegenerateCard = useCallback(async (category: Category) => {
    const result = await regenerateCard(category, allCardsForShuffle, localProblemStatement);
    if (result) {
      setSelectedCards((prev) => ({ ...prev, [category]: result }));
    }
  }, [regenerateCard, allCardsForShuffle, localProblemStatement]);

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
    deckManager.addWildcard(text, category);
  };

  const handleRemoveWildcard = async (id: string) => {
    deckManager.removeWildcard(id);
  };

  const handleShuffle = useCallback(() => {
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

      // Auto-trigger AI suggestion if enabled
      if (autoAISuggest) {
        setTimeout(() => {
          getSuggestion(newSelection, localProblemStatement);
        }, 400);
      }
    }, 200);
  }, [allCardsForShuffle, clearSuggestion, autoAISuggest, getSuggestion, localProblemStatement]);

  const handleAutoAISuggestChange = useCallback((enabled: boolean) => {
    setAutoAISuggest(enabled);
    localStorage.setItem('brainstormy-auto-ai-suggest', enabled ? 'true' : 'false');
  }, []);

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
    getSuggestion(selectedCards, localProblemStatement);
  };

  // Derive card states
  const hasAnyCard = categories.some((cat) => selectedCards[cat] !== null);

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
    saveLocalIdea(title, description, author, isAIGenerated);
    gameMode.incrementIdeas();
    clearSuggestion();
  };

  const handleDeleteIdea = async (id: string) => {
    deleteLocalIdea(id);
  };

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        isModeratorMode={isModeratorMode}
        onToggleModeratorMode={toggleModeratorMode}
        onSetFocus={() => setIsFocusEditorOpen(true)}
        gameMode={gameMode.mode}
        gameSettings={gameMode.settings}
        availableGameModes={gameMode.availableModes}
        isGameRunning={gameMode.isRunning}
        onGameModeChange={gameMode.changeMode}
        onGameSettingsChange={gameMode.updateSettings}
        onExportPresets={deckManager.exportPresets}
        onImportPresets={deckManager.importPresets}
        onResetDeck={handleGlobalReset}
      />

      <main className="flex-1 container mx-auto px-4 py-12 md:py-16 space-y-8">
        {/* Game HUD - minimal, only shows for timed modes */}
        {gameMode.mode !== 'freejam' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
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
            problemStatement={localProblemStatement}
            onEditProblem={() => setIsFocusEditorOpen(true)}
            isModeratorMode={isModeratorMode}
            hasOverride={hasOverride}
            onEditCard={handleEditCard}
            onRegenerateCard={handleRegenerateCard}
            isRegenerating={isRegenerating}
            onSaveIdea={handleSaveIdea}
            onAISuggest={handleGetSuggestion}
            aiSuggestion={suggestion}
            isAILoading={isAILoading}
            autoAISuggest={autoAISuggest}
            onAutoAISuggestChange={handleAutoAISuggestChange}
            // Deck switcher props
            insightVariant={deckManager.activePreset.config.insight.variant}
            insightContext={deckManager.activePreset.config.insight.context}
            catalystVariant={deckManager.activePreset.config.catalyst.variant}
            hasGeneratedInsightCards={(deckManager.activePreset.generatedCards?.length ?? 0) > 0}
            isDeckGenerating={deckManager.isGenerating}
            onInsightChange={deckManager.setInsightVariant}
            onCatalystChange={deckManager.setCatalystVariant}
            onGenerateDeck={deckManager.generateCards}
            // Deck browser props
            activePreset={deckManager.activePreset}
            wildcards={deckManager.wildcards}
            getCardsForCategory={deckManager.getCardsForCategory}
            onAddWildcard={handleAddWildcard}
            onRemoveWildcard={handleRemoveWildcard}
            onEditWildcard={deckManager.updateWildcard}
          />
        </motion.section>

      </main>

      {/* Ideas Tray - collapsible footer */}
      <IdeasTray
        ideas={savedIdeas}
        onDelete={handleDeleteIdea}
      />

      {/* Floating Action Bar */}
      <FloatingActionBar
        hasAnyCard={hasAnyCard}
        isShuffling={isShuffling}
        canPlay={gameMode.canPlay}
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
        currentContext={localProblemContext}
        currentStatement={localProblemStatement}
        onSave={async (ctx, stmt) => updateLocalProblemStatement(ctx, stmt)}
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
    </div>
  );
};

export default Index;