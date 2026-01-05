import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-category-insight via-category-tech to-category-random flex items-center justify-center"
          >
            <Layers className="w-5 h-5 text-primary-foreground" />
          </motion.div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight">Mash-Up Cards</h1>
            <p className="text-xs text-muted-foreground">Collective Brainstorming</p>
          </div>
        </div>
      </div>
    </header>
  );
}
