import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';
import { SessionScore } from '@/hooks/useCollaborativeGameMode';
import { cn } from '@/lib/utils';

interface CompetitionLeaderboardProps {
  scores: SessionScore[];
  currentParticipant: string;
  compact?: boolean;
}

export function CompetitionLeaderboard({
  scores,
  currentParticipant,
  compact = false,
}: CompetitionLeaderboardProps) {
  if (scores.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-2">
        No scores yet. Start generating ideas!
      </div>
    );
  }

  const displayScores = compact ? scores.slice(0, 4) : scores;

  return (
    <div className={cn('space-y-1', compact && 'flex items-center gap-4 flex-wrap')}>
      {displayScores.map((score, index) => {
        const isCurrentUser = score.participant_name === currentParticipant;
        const rank = index + 1;

        return (
          <motion.div
            key={score.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'flex items-center gap-2',
              compact ? 'text-sm' : 'px-3 py-2 rounded-sm',
              isCurrentUser && !compact && 'bg-muted/50',
              !compact && 'justify-between'
            )}
          >
            <div className="flex items-center gap-2">
              {rank === 1 && <Trophy className="w-4 h-4 text-amber-500" />}
              {rank === 2 && <Medal className="w-4 h-4 text-zinc-400" />}
              {rank === 3 && <Medal className="w-4 h-4 text-amber-700" />}
              {rank > 3 && <span className="w-4 text-center text-muted-foreground">{rank}</span>}
              <span className={cn('font-medium', isCurrentUser && 'text-foreground')}>
                {isCurrentUser ? 'You' : score.participant_name}
              </span>
            </div>
            <span className="font-mono tabular-nums">
              {score.score}
            </span>
          </motion.div>
        );
      })}
      {compact && scores.length > 4 && (
        <span className="text-xs text-muted-foreground">
          +{scores.length - 4} more
        </span>
      )}
    </div>
  );
}
