import { Target, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FocusType, getFocusTypeConfig } from '@/data/focusTypes';

interface ProblemStatementBannerProps {
  statement: string | null;
  focusType?: FocusType;
  isModeratorMode?: boolean;
  onEdit?: () => void;
}

export function ProblemStatementBanner({
  statement,
  focusType = 'hmw',
  isModeratorMode = false,
  onEdit,
}: ProblemStatementBannerProps) {
  if (!statement) return null;

  const config = getFocusTypeConfig(focusType);

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
          <div className="flex items-center gap-2 mb-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Session Focus
            </p>
            {focusType !== 'hmw' && (
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/70 bg-muted/50 px-1.5 py-0.5 rounded-sm border border-border/50">
                {config.label}
              </span>
            )}
          </div>
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
