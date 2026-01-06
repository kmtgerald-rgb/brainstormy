import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, User, Calendar } from 'lucide-react';
import { SavedIdea } from '@/hooks/useCards';
import { Category, categoryShortLabels } from '@/data/defaultCards';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface IdeaBoardProps {
  ideas: SavedIdea[];
  onDelete: (id: string) => void;
}

const categoryDots: Record<Category, string> = {
  insight: 'bg-category-insight',
  asset: 'bg-category-asset',
  tech: 'bg-category-tech',
  random: 'bg-category-random',
};

export function IdeaBoard({ ideas, onDelete }: IdeaBoardProps) {
  if (ideas.length === 0) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <h3 className="font-serif text-2xl mb-3">Your ideas will appear here.</h3>
        <p className="text-muted-foreground">
          Shuffle some cards and hit TWIST to capture your first idea.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-3xl">Ideas</h2>
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {ideas.length} captured
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {ideas.map((idea, index) => (
            <motion.div
              key={idea.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="group relative bg-card border border-border p-6 card-shadow hover:card-shadow-hover transition-shadow"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(idea.id)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              {/* Category indicators */}
              <div className="flex gap-1.5 mb-4">
                {idea.cards.map((card) => (
                  <div
                    key={card.id}
                    className={cn('w-2 h-2 rounded-full', categoryDots[card.category])}
                    title={categoryShortLabels[card.category]}
                  />
                ))}
              </div>

              <h3 className="font-serif text-xl mb-2 pr-8">{idea.title}</h3>
              
              {idea.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{idea.description}</p>
              )}

              {/* Source cards */}
              <div className="flex flex-wrap gap-2 mb-4">
                {idea.cards.map((card) => (
                  <span
                    key={card.id}
                    className="font-mono text-[10px] bg-muted px-2 py-1 truncate max-w-[140px]"
                    title={card.text}
                  >
                    {card.text}
                  </span>
                ))}
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {idea.author && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {idea.author}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {idea.createdAt.toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}