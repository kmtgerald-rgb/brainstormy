import { ControlPanel } from './ControlPanel';
import { Session } from '@/hooks/useSession';
import { SessionHistoryItem } from '@/hooks/useSessionHistory';
import { GameMode, GameSettings } from '@/hooks/useGameMode';
import { DeckConfig, InsightVariant, TechVariant } from '@/data/deckVariants';
import brainstormyIcon from '@/assets/brainstormy-icon.png';

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
  // Deck configuration props
  deckConfig?: DeckConfig;
  isDeckGenerating?: boolean;
  onInsightVariantChange?: (variant: InsightVariant, context?: string) => void;
  onTechVariantChange?: (variant: TechVariant) => void;
  onGenerateDeck?: (type: 'industry' | 'region', context: string, forceRegenerate?: boolean) => Promise<void>;
  hasGeneratedDeck?: (type: 'industry' | 'region', context: string) => boolean;
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
  gameSettings = {
    duration: 300,
    targetCount: 10
  },
  availableGameModes = ['freejam', 'time-attack', 'target'],
  isGameRunning = false,
  onGameModeChange,
  onGameSettingsChange,
  deckConfig,
  isDeckGenerating,
  onInsightVariantChange,
  onTechVariantChange,
  onGenerateDeck,
  hasGeneratedDeck,
}: HeaderProps) {
  return (
    <header className="border-b border-border/50 bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl tracking-tight">Brainstormy</h1>
          </div>

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
            deckConfig={deckConfig}
            isDeckGenerating={isDeckGenerating}
            onInsightVariantChange={onInsightVariantChange}
            onTechVariantChange={onTechVariantChange}
            onGenerateDeck={onGenerateDeck}
            hasGeneratedDeck={hasGeneratedDeck}
          />
        </div>
      </div>
    </header>
  );
}