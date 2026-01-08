import { Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ModeToggle } from './ModeToggle';
import { GameModeSelector } from './GameModeSelector';
import { SessionPanel } from './SessionPanel';
import { DeckConfigSection } from './DeckConfigSection';
import { Session } from '@/hooks/useSession';
import { SessionHistoryItem } from '@/hooks/useSessionHistory';
import { GameMode, GameSettings } from '@/hooks/useGameMode';
import { DeckConfig, InsightVariant, TechVariant } from '@/data/deckVariants';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface ControlPanelProps {
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

export function ControlPanel({
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
  // Deck configuration
  deckConfig,
  isDeckGenerating = false,
  onInsightVariantChange,
  onTechVariantChange,
  onGenerateDeck,
  hasGeneratedDeck,
  gameSettings = { duration: 300, targetCount: 10 },
  availableGameModes = ['freejam', 'time-attack', 'target'],
  isGameRunning = false,
  onGameModeChange,
  onGameSettingsChange,
}: ControlPanelProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader className="text-left">
          <SheetTitle className="font-serif text-xl">Settings</SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          {/* Mode Toggle */}
          <div className="space-y-3">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Mode
            </label>
            <ModeToggle
              mode={mode}
              onModeChange={onModeChange}
              disabled={isLoading || isGameRunning}
            />
          </div>

          <Separator />

          {/* Game Mode */}
          {onGameModeChange && onGameSettingsChange && (
            <div className="space-y-3">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Game Mode
              </label>
              <GameModeSelector
                mode={gameMode}
                settings={gameSettings}
                availableModes={availableGameModes}
                isRunning={isGameRunning}
                onModeChange={onGameModeChange}
                onSettingsChange={onGameSettingsChange}
              />
            </div>
          )}

          {/* Deck Configuration */}
          {deckConfig && onInsightVariantChange && onTechVariantChange && onGenerateDeck && hasGeneratedDeck && (
            <>
              <Separator />
              <DeckConfigSection
                deckConfig={deckConfig}
                isGenerating={isDeckGenerating}
                onInsightVariantChange={onInsightVariantChange}
                onTechVariantChange={onTechVariantChange}
                onGenerateDeck={onGenerateDeck}
                hasGeneratedDeck={hasGeneratedDeck}
              />
            </>
          )}
          {mode === 'collaborative' && (
            <>
              <Separator />
              <div className="space-y-3">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Facilitator
                </label>
                <div className="flex flex-col gap-2">
                  {onToggleModeratorMode && (
                    <Button
                      variant={isModeratorMode ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={onToggleModeratorMode}
                      className={cn(
                        'justify-start font-mono text-xs uppercase tracking-wider',
                        isModeratorMode && 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/30'
                      )}
                    >
                      {isModeratorMode ? 'Moderator Mode On' : 'Enable Moderator Mode'}
                    </Button>
                  )}
                  {isModeratorMode && onSetFocus && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onSetFocus}
                      className="justify-start font-mono text-xs uppercase tracking-wider"
                    >
                      Set Problem Focus
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Session Controls - Only show in collaborative mode */}
          {mode === 'collaborative' && onCreateSession && onJoinSession && onLeaveSession && onRemoveFromHistory && (
            <>
              <Separator />
              <div className="space-y-3">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Session
                </label>
                <SessionPanel
                  session={session ?? null}
                  participantCount={participantCount}
                  isLoading={isLoading}
                  sessionHistory={sessionHistory}
                  onCreateSession={onCreateSession}
                  onJoinSession={onJoinSession}
                  onLeaveSession={onLeaveSession}
                  onRemoveFromHistory={onRemoveFromHistory}
                />
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
