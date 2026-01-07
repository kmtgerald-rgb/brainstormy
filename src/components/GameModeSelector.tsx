import { useState } from 'react';
import { ChevronDown, Clock, Target, Zap, Trophy, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { GameMode, GameSettings } from '@/hooks/useGameMode';
import { cn } from '@/lib/utils';

interface GameModeSelectorProps {
  mode: GameMode;
  settings: GameSettings;
  availableModes: GameMode[];
  isRunning: boolean;
  onModeChange: (mode: GameMode) => void;
  onSettingsChange: (settings: Partial<GameSettings>) => void;
}

const modeConfig: Record<GameMode, { label: string; icon: typeof Zap; description: string }> = {
  freejam: {
    label: 'Freejam',
    icon: Zap,
    description: 'Open exploration, no constraints',
  },
  'time-attack': {
    label: 'Time Attack',
    icon: Clock,
    description: 'Beat the clock',
  },
  target: {
    label: 'Target',
    icon: Target,
    description: 'Reach an idea goal',
  },
  competition: {
    label: 'Competition',
    icon: Trophy,
    description: 'Compete for ideas',
  },
};

const durationOptions = [
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
  { label: '30 min', value: 1800 },
];

const targetOptions = [
  { label: '5 ideas', value: 5 },
  { label: '10 ideas', value: 10 },
  { label: '15 ideas', value: 15 },
  { label: '25 ideas', value: 25 },
];

export function GameModeSelector({
  mode,
  settings,
  availableModes,
  isRunning,
  onModeChange,
  onSettingsChange,
}: GameModeSelectorProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const config = modeConfig[mode];
  const Icon = config.icon;

  const showSettings = mode === 'time-attack' || mode === 'target' || mode === 'competition';

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isRunning}
            className="gap-2 font-mono text-xs uppercase tracking-wider bg-background"
          >
            <Icon className="w-3.5 h-3.5" />
            {config.label}
            <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-popover border-border z-50">
          {availableModes.map((m) => {
            const mConfig = modeConfig[m];
            const MIcon = mConfig.icon;
            return (
              <DropdownMenuItem
                key={m}
                onClick={() => onModeChange(m)}
                className={cn(
                  'flex items-start gap-3 py-2.5 cursor-pointer',
                  mode === m && 'bg-accent'
                )}
              >
                <MIcon className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">{mConfig.label}</div>
                  <div className="text-xs text-muted-foreground">{mConfig.description}</div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {showSettings && (
        <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isRunning}
              className="gap-1.5 font-mono text-xs text-muted-foreground"
            >
              <Settings2 className="w-3.5 h-3.5" />
              {mode === 'target'
                ? `${settings.targetCount} ideas`
                : `${settings.duration / 60} min`}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48 p-2 bg-popover border-border z-50">
            <div className="space-y-1">
              {mode === 'target' ? (
                <>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">
                    Target Ideas
                  </p>
                  {targetOptions.map((opt) => (
                    <Button
                      key={opt.value}
                      variant={settings.targetCount === opt.value ? 'secondary' : 'ghost'}
                      size="sm"
                      className="w-full justify-start font-mono text-xs"
                      onClick={() => {
                        onSettingsChange({ targetCount: opt.value });
                        setSettingsOpen(false);
                      }}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </>
              ) : (
                <>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">
                    Duration
                  </p>
                  {durationOptions.map((opt) => (
                    <Button
                      key={opt.value}
                      variant={settings.duration === opt.value ? 'secondary' : 'ghost'}
                      size="sm"
                      className="w-full justify-start font-mono text-xs"
                      onClick={() => {
                        onSettingsChange({ duration: opt.value });
                        setSettingsOpen(false);
                      }}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
