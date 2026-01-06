import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, User, Calendar } from 'lucide-react';
import { SessionIdea } from '@/hooks/useSession';
import { Category, categoryShortLabels } from '@/data/defaultCards';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CollaborativeIdeaBoardProps {
  ideas: SessionIdea[];
  onDelete: (id: string) => void;
}

const categoryDots: Record<Category, string> = {
  insight: 'bg-category-insight',
  asset: 'bg-category-asset',
  tech: 'bg-category-tech',
  random: 'bg-category-random',
};

export function CollaborativeIdeaBoard({ ideas, onDelete }: CollaborativeIdeaBoardProps) {
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

  const categories: Category[] = ['insight', 'asset', 'tech', 'random'];

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
          {ideas.map((idea, index) => {
            const cards = [
              { category: 'insight' as Category, text: idea.card_insight },
              { category: 'asset' as Category, text: idea.card_asset },
              { category: 'tech' as Category, text: idea.card_tech },
              { category: 'random' as Category, text: idea.card_random },
            ];

            return (
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

                <div className="flex gap-1.5 mb-4">
                  {categories.map((cat) => (
                    <div
                      key={cat}
                      className={cn('w-2 h-2 rounded-full', categoryDots[cat])}
                      title={categoryShortLabels[cat]}
                    />
                  ))}
                </div>

                <h3 className="font-serif text-xl mb-2 pr-8">{idea.title}</h3>

                {idea.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {idea.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {cards.map((card) => (
                    <span
                      key={card.category}
                      className="font-mono text-[10px] bg-muted px-2 py-1 truncate max-w-[140px]"
                      title={card.text}
                    >
                      {card.text}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {idea.author_name && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {idea.author_name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(idea.created_at).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}