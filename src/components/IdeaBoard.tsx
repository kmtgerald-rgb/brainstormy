import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, User, Calendar, Sparkles } from 'lucide-react';
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
  // Separate AI ideas from user ideas
  const aiIdeas = ideas.filter(idea => idea.isAIGenerated);
  const userIdeas = ideas.filter(idea => !idea.isAIGenerated);

  if (ideas.length === 0) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <h3 className="font-serif text-2xl mb-3">Your ideas will appear here.</h3>
        <p className="text-muted-foreground">
          Shuffle some cards and capture your first idea below the grid.
        </p>
      </div>
    );
  }

  const IdeaCard = ({ idea, index }: { idea: SavedIdea; index: number }) => (
    <motion.div
      key={idea.id}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={cn(
        'group relative bg-card border p-6 card-shadow hover:card-shadow-hover transition-shadow',
        idea.isAIGenerated 
          ? 'border-primary/30 bg-gradient-to-br from-primary/5 to-transparent' 
          : 'border-border'
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(idea.id)}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      {/* AI Badge + Category indicators */}
      <div className="flex items-center gap-3 mb-4">
        {idea.isAIGenerated && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-mono uppercase tracking-wider rounded-full">
            <Sparkles className="w-3 h-3" />
            AI Spark
          </span>
        )}
        <div className="flex gap-1.5">
          {idea.cards.map((card) => (
            <div
              key={card.id}
              className={cn('w-2 h-2 rounded-full', categoryDots[card.category])}
              title={categoryShortLabels[card.category]}
            />
          ))}
        </div>
      </div>

      <h3 className="font-serif text-xl mb-2 pr-8">{idea.title}</h3>
      
      {idea.description && (
        <p className="text-sm text-muted-foreground mb-4">{idea.description}</p>
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
  );

  return (
    <div className="space-y-8">
      {/* AI Sparks Section */}
      {aiIdeas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-2xl">AI Sparks</h2>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {aiIdeas.length} captured
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {aiIdeas.map((idea, index) => (
                <IdeaCard key={idea.id} idea={idea} index={index} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* User Ideas Section */}
      {userIdeas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl">{aiIdeas.length > 0 ? 'Your Ideas' : 'Ideas'}</h2>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {userIdeas.length} captured
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {userIdeas.map((idea, index) => (
                <IdeaCard key={idea.id} idea={idea} index={index} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}