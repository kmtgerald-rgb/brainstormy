import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, Lightbulb, X, AlertCircle, ArrowRight } from 'lucide-react';
import { SessionHistoryItem } from '@/hooks/useSessionHistory';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface SessionHistoryProps {
  history: SessionHistoryItem[];
  onRejoin: (code: string) => Promise<void>;
  onRemove: (sessionId: string) => void;
  isLoading: boolean;
}

export function SessionHistory({ history, onRejoin, onRemove, isLoading }: SessionHistoryProps) {
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

  const handleRejoin = async (item: SessionHistoryItem) => {
    setValidatingId(item.id);
    try {
      await onRejoin(item.code);
    } catch {
      setFailedIds((prev) => new Set([...prev, item.id]));
    } finally {
      setValidatingId(null);
    }
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        Recent Sessions
      </h3>
      
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {history.slice(0, 5).map((item) => {
            const isFailed = failedIds.has(item.id);
            const isValidating = validatingId === item.id;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={cn(
                  "group relative flex items-center justify-between gap-3 p-3 rounded-lg border bg-card transition-colors",
                  isFailed 
                    ? "border-destructive/30 bg-destructive/5" 
                    : "border-border hover:border-foreground/20"
                )}
              >
                {/* Session Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{item.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {item.code}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(item.lastAccessed), { addSuffix: true })}
                    </span>
                    
                    {item.role === 'creator' && (
                      <span className="text-primary/70">Created by you</span>
                    )}
                    
                    {item.ideaCount !== undefined && item.ideaCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        {item.ideaCount}
                      </span>
                    )}
                  </div>

                  {isFailed && (
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      Session no longer available
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!isFailed ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRejoin(item)}
                      disabled={isLoading || isValidating}
                      className="gap-1.5 font-mono text-[10px] uppercase tracking-wider"
                    >
                      {isValidating ? (
                        <span className="animate-pulse">Joining...</span>
                      ) : (
                        <>
                          Rejoin
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        onRemove(item.id);
                        setFailedIds((prev) => {
                          const next = new Set(prev);
                          next.delete(item.id);
                          return next;
                        });
                      }}
                      className="gap-1.5 font-mono text-[10px] uppercase tracking-wider text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  )}

                  {!isFailed && (
                    <button
                      onClick={() => onRemove(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                      title="Remove from history"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
