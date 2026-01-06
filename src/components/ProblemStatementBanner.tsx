import { Target, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ProblemStatementBannerProps {
  statement: string | null;
  isModeratorMode?: boolean;
  onEdit?: () => void;
}

export function ProblemStatementBanner({
  statement,
  isModeratorMode = false,
  onEdit,
}: ProblemStatementBannerProps) {
  if (!statement) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border/50 bg-muted/30 rounded-lg p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center">
          <Target className="w-4 h-4 text-foreground/60" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Session Focus
          </p>
          <p className="font-serif text-lg leading-relaxed text-foreground">
            {statement}
          </p>
        </div>

        {isModeratorMode && onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="flex-shrink-0 gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </Button>
        )}
      </div>
    </motion.div>
  );
}
