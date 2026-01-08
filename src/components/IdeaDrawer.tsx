import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Sparkles, X } from 'lucide-react';
import { Card, Category } from '@/data/defaultCards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface IdeaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCards: Record<Category, Card | null>;
  onSave: (title: string, description: string, author?: string, isAIGenerated?: boolean) => void;
  isCollaborative?: boolean;
  aiSuggestion?: { title: string; description: string } | null;
  participantName?: string;
}

export function IdeaDrawer({ 
  isOpen, 
  onClose, 
  selectedCards, 
  onSave, 
  isCollaborative = false,
  aiSuggestion,
  participantName = ''
}: IdeaDrawerProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUsingAI, setIsUsingAI] = useState(false);

  // Only show author field in collaborative mode when no name is stored
  const showAuthorField = isCollaborative && !participantName;

  // Pre-fill from AI suggestion if available
  useEffect(() => {
    if (aiSuggestion && isOpen) {
      setTitle(aiSuggestion.title);
      setDescription(aiSuggestion.description);
      setIsUsingAI(true);
    }
  }, [aiSuggestion, isOpen]);

  const handleSave = () => {
    if (title.trim()) {
      // Use stored participant name if available, otherwise use entered author
      const authorName = participantName || author.trim() || undefined;
      onSave(title.trim(), description.trim(), authorName, isUsingAI);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
        onClose();
      }, 1000);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAuthor('');
    setIsUsingAI(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleUseAI = () => {
    if (aiSuggestion) {
      setTitle(aiSuggestion.title);
      setDescription(aiSuggestion.description);
      setIsUsingAI(true);
    }
  };

  const handleClearAI = () => {
    setTitle('');
    setDescription('');
    setIsUsingAI(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50',
              'bg-background border-t border-border',
              'max-h-[85vh] overflow-y-auto',
              'safe-area-pb'
            )}
          >
            <AnimatePresence mode="wait">
              {showSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-16 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={cn(
                      'w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center',
                      isUsingAI ? 'bg-primary' : 'bg-foreground'
                    )}
                  >
                    {isUsingAI ? (
                      <Sparkles className="w-7 h-7 text-primary-foreground" />
                    ) : (
                      <Check className="w-7 h-7 text-background" />
                    )}
                  </motion.div>
                  <h3 className="font-serif text-xl">
                    {isCollaborative ? 'Idea shared.' : isUsingAI ? 'AI Spark captured.' : 'Idea captured.'}
                  </h3>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 pb-8 space-y-6"
                >
                  {/* Drag handle */}
                  <div className="flex justify-center">
                    <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
                  </div>

                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {isUsingAI ? 'AI Spark' : 'Idea Canvas'}
                        </span>
                        {isUsingAI && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-mono uppercase tracking-wider rounded-full">
                            <Sparkles className="w-3 h-3" />
                            AI
                          </span>
                        )}
                      </div>
                      <h2 className="font-serif text-2xl">Combine into an idea.</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleClose}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* AI Suggestion Prompt */}
                  {aiSuggestion && !isUsingAI && (
                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleUseAI}
                      className={cn(
                        'w-full p-4 border border-primary/30 bg-primary/5 rounded-md',
                        'text-left hover:bg-primary/10 transition-colors'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                          Use AI Suggestion
                        </span>
                      </div>
                      <p className="font-serif text-lg line-clamp-1">{aiSuggestion.title}</p>
                    </motion.button>
                  )}

                  {/* Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          Name your idea
                        </label>
                        {isUsingAI && (
                          <button 
                            onClick={handleClearAI}
                            className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                          >
                            Clear AI
                          </button>
                        )}
                      </div>
                      <Input
                        placeholder="A compelling name..."
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          if (isUsingAI && e.target.value !== aiSuggestion?.title) {
                            setIsUsingAI(false);
                          }
                        }}
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
                        onChange={(e) => {
                          setDescription(e.target.value);
                          if (isUsingAI && e.target.value !== aiSuggestion?.description) {
                            setIsUsingAI(false);
                          }
                        }}
                        rows={2}
                        className="border-border resize-none"
                      />
                    </div>

                    {showAuthorField && (
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          Your name
                        </label>
                        <Input
                          placeholder="Author"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          className="border-border"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={handleClose}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={!title.trim()} 
                      className={cn(
                        'flex-1 gap-2',
                        isUsingAI && 'bg-primary hover:bg-primary/90'
                      )}
                    >
                      {isUsingAI ? (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Capture AI Spark
                        </>
                      ) : (
                        <>
                          Capture
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}