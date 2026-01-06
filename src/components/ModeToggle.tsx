import { User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModeToggleProps {
  mode: 'solo' | 'collaborative';
  onModeChange: (mode: 'solo' | 'collaborative') => void;
  disabled?: boolean;
}

export function ModeToggle({ mode, onModeChange, disabled }: ModeToggleProps) {
  return (
    <div className="inline-flex items-center rounded border border-border bg-muted/50 p-0.5">
      <button
        onClick={() => onModeChange('solo')}
        disabled={disabled}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all',
          mode === 'solo'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <User className="w-3.5 h-3.5" />
        Solo
      </button>
      <button
        onClick={() => onModeChange('collaborative')}
        disabled={disabled}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all',
          mode === 'collaborative'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Users className="w-3.5 h-3.5" />
        Collaborative
      </button>
    </div>
  );
}
