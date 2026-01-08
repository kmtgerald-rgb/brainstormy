import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { SavedIdea } from '@/hooks/useCards';
import { SessionIdea } from '@/hooks/useSession';
import { IdeaBoard } from './IdeaBoard';
import { CollaborativeIdeaBoard } from './CollaborativeIdeaBoard';
import { cn } from '@/lib/utils';

interface IdeasTrayProps {
  ideas: SavedIdea[] | SessionIdea[];
  onDelete: (id: string) => void;
  isCollaborative?: boolean;
}

export function IdeasTray({ ideas, onDelete, isCollaborative = false }: IdeasTrayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate separate counts for user ideas and AI sparks
  const { userIdeasCount, aiSparksCount } = useMemo(() => {
    if (isCollaborative) {
      return { userIdeasCount: ideas.length, aiSparksCount: 0 };
    }
    const savedIdeas = ideas as SavedIdea[];
    const aiCount = savedIdeas.filter(idea => idea.isAIGenerated).length;
    return {
      userIdeasCount: savedIdeas.length - aiCount,
      aiSparksCount: aiCount,
    };
  }, [ideas, isCollaborative]);

  return (
    <div className="border-t border-border">
      {/* Tray Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full py-4 px-4 flex items-center justify-center gap-3',
          'font-mono text-xs uppercase tracking-wider',
          'text-muted-foreground hover:text-foreground transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        )}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronUp className="w-4 h-4" />
        )}
        
        <span className="flex items-center gap-3">
          {/* User Ideas */}
          <span className="flex items-center gap-1.5">
            Your Ideas
            {userIdeasCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] bg-foreground text-background rounded-full">
                {userIdeasCount}
              </span>
            )}
          </span>

          {/* AI Sparks - only show if there are any */}
          {aiSparksCount > 0 && (
            <>
              <span className="text-muted-foreground/50">|</span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-primary" />
                AI Sparks
                <span className="px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full">
                  {aiSparksCount}
                </span>
              </span>
            </>
          )}
        </span>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="container mx-auto px-4 py-8">
              {isCollaborative ? (
                <CollaborativeIdeaBoard ideas={ideas as SessionIdea[]} onDelete={onDelete} />
              ) : (
                <IdeaBoard ideas={ideas as SavedIdea[]} onDelete={onDelete} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
