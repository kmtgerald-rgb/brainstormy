import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, User, Calendar } from 'lucide-react';
import { SavedIdea } from '@/hooks/useCards';
import { categoryIcons, Category } from '@/data/defaultCards';
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
      <div className="text-center py-16">
        <div className="text-6xl mb-4">💭</div>
        <h3 className="font-display text-xl font-semibold mb-2">No ideas yet</h3>
        <p className="text-muted-foreground">
          Shuffle some cards and hit TWIST to capture your first idea!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Idea Board</h2>
        <span className="text-sm text-muted-foreground">{ideas.length} ideas saved</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {ideas.map((idea, index) => (
            <motion.div
              key={idea.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group relative bg-card rounded-xl border p-5 card-shadow hover:card-shadow-hover transition-shadow"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(idea.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="flex gap-1 mb-3">
                {idea.cards.map((card) => (
                  <div
                    key={card.id}
                    className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs', categoryDots[card.category])}
                    title={card.text}
                  >
                    <span className="text-primary-foreground">{categoryIcons[card.category]}</span>
                  </div>
                ))}
              </div>

              <h3 className="font-display text-lg font-semibold mb-2 pr-8">{idea.title}</h3>
              
              {idea.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{idea.description}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {idea.cards.map((card) => (
                  <span
                    key={card.id}
                    className="text-xs bg-muted px-2 py-1 rounded-md truncate max-w-[140px]"
                    title={card.text}
                  >
                    {card.text}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
