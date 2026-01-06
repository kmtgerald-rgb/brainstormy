import { Shield, ShieldOff, Target } from 'lucide-react';
import { SessionPanel } from './SessionPanel';
import { ModeToggle } from './ModeToggle';
import { Session } from '@/hooks/useSession';
import { SessionHistoryItem } from '@/hooks/useSessionHistory';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
}: HeaderProps) {
  return (
    <header className="border-b border-border/50 bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-2xl tracking-tight">Mash-Up</h1>
            <ModeToggle
              mode={mode}
              onModeChange={onModeChange}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-3">
            {isModeratorMode && onSetFocus && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSetFocus}
                className="gap-2 font-mono text-xs uppercase tracking-wider"
              >
                <Target className="w-3.5 h-3.5" />
                Set Focus
              </Button>
            )}

            {onToggleModeratorMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleModeratorMode}
                className={cn(
                  'gap-2 font-mono text-xs uppercase tracking-wider',
                  isModeratorMode && 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                )}
              >
                {isModeratorMode ? (
                  <>
                    <Shield className="w-3.5 h-3.5" />
                    Moderator
                  </>
                ) : (
                  <>
                    <ShieldOff className="w-3.5 h-3.5" />
                    Moderate
                  </>
                )}
              </Button>
            )}

            {mode === 'collaborative' && onCreateSession && onJoinSession && onLeaveSession && onRemoveFromHistory && (
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
            )}
          </div>
        </div>
      </div>
    </header>
  );
}