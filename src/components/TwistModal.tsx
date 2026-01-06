import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Card, Category, categoryShortLabels } from '@/data/defaultCards';
import { MashupCard } from './MashupCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
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
      }, 1200);
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-border">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-16 h-16 mx-auto mb-6 rounded-full bg-foreground flex items-center justify-center"
              >
                <Check className="w-8 h-8 text-background" />
              </motion.div>
              <h3 className="font-serif text-2xl">
                {isCollaborative ? 'Idea shared.' : 'Idea captured.'}
              </h3>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 p-8"
            >
              {/* Header */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Idea Canvas
                </span>
                <h2 className="font-serif text-3xl">Combine into an idea.</h2>
                {isCollaborative && (
                  <p className="text-sm text-muted-foreground">
                    This idea will be shared with your session.
                  </p>
                )}
              </div>

              {/* Selected Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories.map((category, index) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {selectedCards[category] && (
                      <MashupCard card={selectedCards[category]!} size="sm" animate={false} />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Form */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Name your idea
                  </label>
                  <Input
                    placeholder="A compelling name..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg font-serif h-12 border-border"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Describe the connection
                  </label>
                  <Textarea
                    placeholder="How do these forces combine?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="border-border resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Your name {!isCollaborative && '(optional)'}
                  </label>
                  <Input
                    placeholder="Author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="border-border"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={!title.trim()} 
                  className="gap-2 px-6"
                >
                  Capture
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}