import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { GameModeSelector } from './GameModeSelector';
import { HowItWorks } from './HowItWorks';
import { DeckHub } from './DeckHub';
import { GameMode, GameSettings } from '@/hooks/useGameMode';
import { DeckPreset } from '@/hooks/useDeckManager';
import { Card, Category } from '@/data/defaultCards';
import { InsightVariant, TechVariant } from '@/data/deckVariants';
import { Separator } from '@/components/ui/separator';

interface ControlPanelProps {
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

export function ControlPanel({
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
}: ControlPanelProps) {
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

          {/* Problem Focus */}
          {onSetFocus && (
            <>
              <Separator />
              <div className="space-y-3">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Session Focus
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSetFocus}
                  className="justify-start font-mono text-xs uppercase tracking-wider w-full"
                >
                  Set Problem Focus
                </Button>
              </div>
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