import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, LogIn, LogOut, Copy, Check } from 'lucide-react';
import { Session } from '@/hooks/useSession';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SessionPanelProps {
  session: Session | null;
  participantCount: number;
  isLoading: boolean;
  onCreateSession: (name: string) => Promise<Session | null>;
  onJoinSession: (code: string) => Promise<Session | null>;
  onLeaveSession: () => void;
}

export function SessionPanel({
  session,
  participantCount,
  isLoading,
  onCreateSession,
  onJoinSession,
  onLeaveSession,
}: SessionPanelProps) {
  const [sessionName, setSessionName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (sessionName.trim()) {
      const result = await onCreateSession(sessionName.trim());
      if (result) {
        setSessionName('');
        setIsCreateOpen(false);
      }
    }
  };

  const handleJoin = async () => {
    if (joinCode.trim()) {
      const result = await onJoinSession(joinCode.trim());
      if (result) {
        setJoinCode('');
        setIsJoinOpen(false);
      }
    }
  };

  const copyCode = () => {
    if (session?.code) {
      navigator.clipboard.writeText(session.code);
      setCopied(true);
      toast.success('Code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (session) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 bg-card border rounded-xl px-4 py-2 card-shadow"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="font-medium text-sm">{session.name}</span>
        </div>

        <div className="h-4 w-px bg-border" />

        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted hover:bg-accent transition-colors"
        >
          <span className="font-mono text-sm font-semibold tracking-wider">
            {session.code}
          </span>
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>

        <div className="h-4 w-px bg-border" />

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{participantCount}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onLeaveSession}
          className="gap-1 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          Leave
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Session
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Brainstorming Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Session Name
              </label>
              <Input
                placeholder="e.g. Brand Sprint – Feb"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!sessionName.trim() || isLoading}
              >
                Create Session
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <LogIn className="w-4 h-4" />
            Join Session
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Existing Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Session Code
              </label>
              <Input
                placeholder="Enter 6-character code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                maxLength={6}
                className="font-mono text-lg tracking-widest text-center"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsJoinOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleJoin}
                disabled={joinCode.length !== 6 || isLoading}
              >
                Join Session
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
