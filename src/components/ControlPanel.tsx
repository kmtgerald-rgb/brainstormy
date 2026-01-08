import { useState } from 'react';
import { Settings, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { HowItWorks } from './HowItWorks';
import { DeckHub } from './DeckHub';
import { Session } from '@/hooks/useSession';
import { SessionHistoryItem } from '@/hooks/useSessionHistory';
import { GameMode, GameSettings } from '@/hooks/useGameMode';
import { DeckPreset } from '@/hooks/useDeckManager';
import { Card, Category } from '@/data/defaultCards';
import { InsightVariant, TechVariant } from '@/data/deckVariants';
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
  participantName?: string;
  onParticipantNameChange?: (name: string) => void;
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
  participantName = '',
  onParticipantNameChange,
}: ControlPanelProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(participantName);

  const handleSaveName = () => {
    if (onParticipantNameChange && editedName.trim()) {
      onParticipantNameChange(editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setEditedName(participantName);
    setIsEditingName(false);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96 overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="font-serif text-xl">Settings</SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          {/* How It Works */}
          <HowItWorks />

          <Separator />

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

              {/* Participant Name */}
              {onParticipantNameChange && (
                <div className="space-y-3">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Your Name
                  </label>
                  {isEditingName ? (
                    <div className="flex gap-2">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        placeholder="Enter your name"
                        className="flex-1 h-8 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8 p-0">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditedName(participantName);
                        setIsEditingName(true);
                      }}
                      className="justify-start gap-2 w-full font-mono text-xs"
                    >
                      <User className="w-3.5 h-3.5" />
                      {participantName || 'Set your name'}
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

          <Separator />

          {/* Deck Hub */}
          <DeckHub
            presets={deckPresets}
            activePreset={activeDeckPreset}
            wildcards={deckWildcards}
            isGenerating={isDeckGenerating}
            onActivatePreset={onActivateDeckPreset}
            onCreatePreset={onCreateDeckPreset}
            onDuplicatePreset={onDuplicateDeckPreset}
            onDeletePreset={onDeleteDeckPreset}
            onInsightChange={onInsightChange}
            onCatalystChange={onCatalystChange}
            onGenerate={onGenerateDeck}
            onAddWildcard={onAddWildcard}
            onRemoveWildcard={onRemoveWildcard}
            onEditWildcard={onEditWildcard}
            getCardsForCategory={getCardsForCategory}
            onExport={onExportPresets}
            onImport={onImportPresets}
            onReset={onResetDeck}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
