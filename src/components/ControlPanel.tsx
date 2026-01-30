import { Settings, RotateCcw, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { GameModeSelector } from './GameModeSelector';
import { HowItWorks } from './HowItWorks';
import { GameMode, GameSettings } from '@/hooks/useGameMode';
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
  
  // Export/Import/Reset
  onExportPresets: () => string;
  onImportPresets: (json: string) => void;
  onReset: () => void;
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
  // Export/Import/Reset
  onExportPresets,
  onImportPresets,
  onReset,
}: ControlPanelProps) {
  const handleExport = () => {
    const json = onExportPresets();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brainstormy-presets.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const json = e.target?.result as string;
        onImportPresets(json);
      };
      reader.readAsText(file);
    };
    input.click();
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

          {/* Backup & Restore */}
          <div className="space-y-3">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Backup & Restore
            </label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex-1 gap-2 font-mono text-[10px] uppercase tracking-wider"
              >
                <Download className="w-3 h-3" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleImport}
                className="flex-1 gap-2 font-mono text-[10px] uppercase tracking-wider"
              >
                <Upload className="w-3 h-3" />
                Import
              </Button>
            </div>
          </div>

          <Separator />

          {/* Reset */}
          <div className="space-y-3">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Reset
            </label>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 font-mono text-[10px] uppercase tracking-wider text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset All to Defaults
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset everything?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear all custom presets, wildcards, AI-generated cards, saved ideas, problem focus, and card edits. Default presets will be restored. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Reset All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}