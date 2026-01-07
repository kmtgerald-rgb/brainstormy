import { motion } from 'framer-motion';
import { Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { SessionScore } from '@/hooks/useCollaborativeGameMode';
import { CompetitionLeaderboard } from './CompetitionLeaderboard';

interface CompetitionEndModalProps {
  isOpen: boolean;
  scores: SessionScore[];
  currentParticipant: string;
  onClose: () => void;
  onViewIdeas: () => void;
}

export function CompetitionEndModal({
  isOpen,
  scores,
  currentParticipant,
  onClose,
  onViewIdeas,
}: CompetitionEndModalProps) {
  const winner = scores[0];
  const isWinner = winner?.participant_name === currentParticipant;
  const myScore = scores.find((s) => s.participant_name === currentParticipant);
  const myRank = scores.findIndex((s) => s.participant_name === currentParticipant) + 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 border-border overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-12 px-8 text-center space-y-8"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="w-20 h-20 mx-auto rounded-full bg-foreground flex items-center justify-center"
          >
            <Trophy className="w-10 h-10 text-background" />
          </motion.div>

          {/* Title */}
          <div className="space-y-2">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-serif text-3xl"
            >
              Competition Over
            </motion.h2>

            {winner && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground"
              >
                {isWinner ? (
                  <>🏆 <span className="font-medium text-foreground">You won!</span> with {winner.score} ideas</>
                ) : (
                  <>Winner: <span className="font-medium text-foreground">{winner.participant_name}</span> with {winner.score} ideas</>
                )}
              </motion.p>
            )}
          </div>

          {/* Final Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-muted/50 rounded-sm p-4"
          >
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
              Final Standings
            </p>
            <CompetitionLeaderboard
              scores={scores.slice(0, 5)}
              currentParticipant={currentParticipant}
            />
          </motion.div>

          {/* Your stats */}
          {myScore && !isWinner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-sm text-muted-foreground"
            >
              You placed <span className="font-medium text-foreground">#{myRank}</span> with{' '}
              <span className="font-medium text-foreground">{myScore.score}</span> ideas
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-3"
          >
            <Button
              onClick={onViewIdeas}
              className="gap-2"
            >
              View All Ideas
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
