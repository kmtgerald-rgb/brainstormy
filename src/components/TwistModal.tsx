import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Save } from 'lucide-react';
import { Card, Category, categoryLabels } from '@/data/defaultCards';
import { MashupCard } from './MashupCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TwistModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCards: Record<Category, Card | null>;
  onSave: (title: string, description: string, author?: string) => void;
  isCollaborative?: boolean;
}

const categories: Category[] = ['insight', 'asset', 'tech', 'random'];

export function TwistModal({ isOpen, onClose, selectedCards, onSave, isCollaborative = false }: TwistModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim(), description.trim(), author.trim() || undefined);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setTitle('');
        setDescription('');
        setAuthor('');
        onClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setAuthor('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              <Sparkles className="w-6 h-6 text-category-random" />
            </motion.span>
            TWIST Moment!
            {isCollaborative && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                (shared with session)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-category-insight via-category-tech to-category-random flex items-center justify-center"
              >
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              <h3 className="font-display text-2xl font-bold">
                {isCollaborative ? 'Idea Shared!' : 'Idea Saved!'}
              </h3>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories.map((category, index) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {selectedCards[category] && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {categoryLabels[category]}
                        </span>
                        <MashupCard card={selectedCards[category]!} size="sm" animate={false} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Idea Title *</label>
                  <Input
                    placeholder="Give your idea a catchy name..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    placeholder="Describe your idea..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Your Name {isCollaborative ? '' : '(optional)'}
                  </label>
                  <Input
                    placeholder="Your name"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!title.trim()} className="gap-2">
                  <Save className="w-4 h-4" />
                  {isCollaborative ? 'Share Idea' : 'Save Idea'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
