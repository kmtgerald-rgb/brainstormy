import { ControlPanel } from './ControlPanel';
import { Session } from '@/hooks/useSession';
import { SessionHistoryItem } from '@/hooks/useSessionHistory';
import { GameMode, GameSettings } from '@/hooks/useGameMode';
import { DeckPreset } from '@/hooks/useDeckManager';
import { Card, Category } from '@/data/defaultCards';
import { InsightVariant, TechVariant } from '@/data/deckVariants';

interface HeaderProps {
  mode: 'solo' | 'collaborative';
  onModeChange: (mode: 'solo' | 'collaborative') => void;
  session?: Session | null;
  participantCount?: number;
  isLoading?: boolean;
  sessionHistory?: SessionHistoryItem[];
  onCreateSession?: (name: string) => Promise<Session | null>;
  onJoinSession?: (code: string) => Promise<Session | null>;
  onLeaveSession?: () => void;
  onRemoveFromHistory?: (sessionId: string) => void;
  isModeratorMode?: boolean;
  onToggleModeratorMode?: () => void;
  onSetFocus?: () => void;
  gameMode?: GameMode;
  gameSettings?: GameSettings;
  availableGameModes?: GameMode[];
  isGameRunning?: boolean;
  onGameModeChange?: (mode: GameMode) => void;
  onGameSettingsChange?: (settings: Partial<GameSettings>) => void;
  
  // Deck Hub props
  deckPresets: DeckPreset[];
  activeDeckPreset: DeckPreset;
  deckWildcards: Card[];
  isDeckGenerating: boolean;
  onActivateDeckPreset: (presetId: string) => void;
  onCreateDeckPreset: (name: string) => void;
  onDuplicateDeckPreset: (presetId: string) => void;
  onDeleteDeckPreset: (presetId: string) => void;
  onInsightChange: (variant: InsightVariant, context?: string) => void;
  onCatalystChange: (variant: TechVariant) => void;
  onGenerateDeck: (forceRegenerate?: boolean) => void;
  onAddWildcard: (text: string, category: Category) => void;
  onRemoveWildcard: (id: string) => void;
  onEditWildcard?: (id: string, text: string) => void;
  getCardsForCategory: (category: Category) => Card[];
  onExportPresets: () => string;
  onImportPresets: (json: string) => void;
  onResetDeck: () => void;
}

export function Header({
  mode,
  onModeChange,
  session,
  participantCount = 1,
  isLoading = false,
  sessionHistory = [],
  onCreateSession,
  onJoinSession,
  onLeaveSession,
  onRemoveFromHistory,
  isModeratorMode = false,
  onToggleModeratorMode,
  onSetFocus,
  gameMode = 'freejam',
  gameSettings = { duration: 300, targetCount: 10 },
  availableGameModes = ['freejam', 'time-attack', 'target'],
  isGameRunning = false,
  onGameModeChange,
  onGameSettingsChange,
  // Deck Hub props
  deckPresets,
  activeDeckPreset,
  deckWildcards,
  isDeckGenerating,
  onActivateDeckPreset,
  onCreateDeckPreset,
  onDuplicateDeckPreset,
  onDeleteDeckPreset,
  onInsightChange,
  onCatalystChange,
  onGenerateDeck,
  onAddWildcard,
  onRemoveWildcard,
  onEditWildcard,
  getCardsForCategory,
  onExportPresets,
  onImportPresets,
  onResetDeck,
}: HeaderProps) {
  return (
    <header className="border-b border-border/50 bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl tracking-tight">Brainstormy</h1>

          <ControlPanel
            mode={mode}
            onModeChange={onModeChange}
            session={session}
            participantCount={participantCount}
            isLoading={isLoading}
            sessionHistory={sessionHistory}
            onCreateSession={onCreateSession}
            onJoinSession={onJoinSession}
            onLeaveSession={onLeaveSession}
            onRemoveFromHistory={onRemoveFromHistory}
            isModeratorMode={isModeratorMode}
            onToggleModeratorMode={onToggleModeratorMode}
            onSetFocus={onSetFocus}
            gameMode={gameMode}
            gameSettings={gameSettings}
            availableGameModes={availableGameModes}
            isGameRunning={isGameRunning}
            onGameModeChange={onGameModeChange}
            onGameSettingsChange={onGameSettingsChange}
            // Deck Hub props
            deckPresets={deckPresets}
            activeDeckPreset={activeDeckPreset}
            deckWildcards={deckWildcards}
            isDeckGenerating={isDeckGenerating}
            onActivateDeckPreset={onActivateDeckPreset}
            onCreateDeckPreset={onCreateDeckPreset}
            onDuplicateDeckPreset={onDuplicateDeckPreset}
            onDeleteDeckPreset={onDeleteDeckPreset}
            onInsightChange={onInsightChange}
            onCatalystChange={onCatalystChange}
            onGenerateDeck={onGenerateDeck}
            onAddWildcard={onAddWildcard}
            onRemoveWildcard={onRemoveWildcard}
            onEditWildcard={onEditWildcard}
            getCardsForCategory={getCardsForCategory}
            onExportPresets={onExportPresets}
            onImportPresets={onImportPresets}
            onResetDeck={onResetDeck}
          />
        </div>
      </div>
    </header>
  );
}
