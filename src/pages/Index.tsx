import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Lightbulb, Shuffle } from 'lucide-react';
import { Header } from '@/components/Header';
import { CategorySection } from '@/components/CategorySection';
import { ShuffleArea } from '@/components/ShuffleArea';
import { TwistModal } from '@/components/TwistModal';
import { IdeaBoard } from '@/components/IdeaBoard';
import { useCards, FilterMode } from '@/hooks/useCards';
import { Category } from '@/data/defaultCards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const categories: Category[] = ['insight', 'asset', 'tech', 'random'];

const Index = () => {
  const {
    getCardsByCategory,
    addWildcard,
    removeWildcard,
    shuffleCards,
    selectedCards,
    clearSelection,
    saveIdea,
    savedIdeas,
    deleteIdea,
  } = useCards();

  const [categoryFilters, setCategoryFilters] = useState<Record<Category, FilterMode>>({
    insight: 'all',
    asset: 'all',
    tech: 'all',
    random: 'all',
  });

  const [isTwistOpen, setIsTwistOpen] = useState(false);

  const handleFilterChange = (category: Category, filter: FilterMode) => {
    setCategoryFilters((prev) => ({ ...prev, [category]: filter }));
  };

  const handleSaveIdea = (title: string, description: string, author?: string) => {
    saveIdea(title, description, author);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="shuffle" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="shuffle" className="gap-2">
              <Shuffle className="w-4 h-4" />
              Shuffle
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <Layers className="w-4 h-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="ideas" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Ideas
              {savedIdeas.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-foreground text-background rounded-full">
                  {savedIdeas.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shuffle">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ShuffleArea
                selectedCards={selectedCards}
                onShuffle={shuffleCards}
                onTwist={() => setIsTwistOpen(true)}
                onClear={clearSelection}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="library">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-12"
            >
              <div className="text-center space-y-2">
                <h2 className="font-display text-3xl font-bold">Card Library</h2>
                <p className="text-muted-foreground">
                  Browse all cards or create your own wildcards
                </p>
              </div>

              {categories.map((category) => (
                <CategorySection
                  key={category}
                  category={category}
                  cards={getCardsByCategory(category, categoryFilters[category])}
                  filter={categoryFilters[category]}
                  onFilterChange={(filter) => handleFilterChange(category, filter)}
                  onAddWildcard={addWildcard}
                  onRemoveWildcard={removeWildcard}
                />
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="ideas">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <IdeaBoard ideas={savedIdeas} onDelete={deleteIdea} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      <TwistModal
        isOpen={isTwistOpen}
        onClose={() => setIsTwistOpen(false)}
        selectedCards={selectedCards}
        onSave={handleSaveIdea}
      />
    </div>
  );
};

export default Index;
