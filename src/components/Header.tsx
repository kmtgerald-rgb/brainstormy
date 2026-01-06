import { motion } from 'framer-motion';
import { Layers, Shield, ShieldOff } from 'lucide-react';
import { SessionPanel } from './SessionPanel';
import { Session } from '@/hooks/useSession';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  session?: Session | null;
  participantCount?: number;
  isLoading?: boolean;
  onCreateSession?: (name: string) => Promise<Session | null>;
  onJoinSession?: (code: string) => Promise<Session | null>;
  onLeaveSession?: () => void;
  isModeratorMode?: boolean;
  onToggleModeratorMode?: () => void;
}

export function Header({
  session,
  participantCount = 1,
  isLoading = false,
  onCreateSession,
  onJoinSession,
  onLeaveSession,
  isModeratorMode = false,
  onToggleModeratorMode,
}: HeaderProps) {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-category-insight via-category-tech to-category-random flex items-center justify-center"
            >
              <Layers className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight">Mash-Up Cards</h1>
              <p className="text-xs text-muted-foreground">Collective Brainstorming</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onToggleModeratorMode && (
              <Button
                variant={isModeratorMode ? 'default' : 'outline'}
                size="sm"
                onClick={onToggleModeratorMode}
                className={cn(
                  'gap-2',
                  isModeratorMode && 'bg-amber-500 hover:bg-amber-600 text-white'
                )}
              >
                {isModeratorMode ? (
                  <>
                    <Shield className="w-4 h-4" />
                    Moderator
                  </>
                ) : (
                  <>
                    <ShieldOff className="w-4 h-4" />
                    Moderator
                  </>
                )}
              </Button>
            )}

            {onCreateSession && onJoinSession && onLeaveSession && (
              <SessionPanel
                session={session ?? null}
                participantCount={participantCount}
                isLoading={isLoading}
                onCreateSession={onCreateSession}
                onJoinSession={onJoinSession}
                onLeaveSession={onLeaveSession}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
