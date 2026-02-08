import { ControlPanel } from './ControlPanel';
import { ThemeToggle } from './ThemeToggle';
import { GameMode, GameSettings } from '@/hooks/useGameMode';

interface HeaderProps {
  isModeratorMode?: boolean;
  onToggleModeratorMode?: () => void;
  onSetFocus?: () => void;
  gameMode?: GameMode;
  gameSettings?: GameSettings;
  availableGameModes?: GameMode[];
  isGameRunning?: boolean;
  onGameModeChange?: (mode: GameMode) => void;
  onGameSettingsChange?: (settings: Partial<GameSettings>) => void;
  
  // Export/Import/Reset props
  onExportPresets: () => string;
  onImportPresets: (json: string) => void;
  onResetDeck: () => void;
}

export function Header({
  isModeratorMode = false,
  onToggleModeratorMode,
  onSetFocus,
  gameMode = 'freejam',
  gameSettings = { duration: 300, targetCount: 10 },
  availableGameModes = ['freejam', 'time-attack', 'target'],
  isGameRunning = false,
  onGameModeChange,
  onGameSettingsChange,
  // Export/Import/Reset
  onExportPresets,
  onImportPresets,
  onResetDeck,
}: HeaderProps) {
  return (
    <header className="border-b border-border/50 bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl tracking-tight">Brainstormy</h1>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <ControlPanel
              isModeratorMode={isModeratorMode}
              onToggleModeratorMode={onToggleModeratorMode}
              onSetFocus={onSetFocus}
              gameMode={gameMode}
              gameSettings={gameSettings}
              availableGameModes={availableGameModes}
              isGameRunning={isGameRunning}
              onGameModeChange={onGameModeChange}
              onGameSettingsChange={onGameSettingsChange}
              onExportPresets={onExportPresets}
              onImportPresets={onImportPresets}
              onReset={onResetDeck}
            />
          </div>
        </div>
      </div>
    </header>
  );
}