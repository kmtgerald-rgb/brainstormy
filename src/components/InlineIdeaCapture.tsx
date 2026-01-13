import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface InlineIdeaCaptureProps {
  onSave: (title: string, description: string, author?: string, isAIGenerated?: boolean) => void;
  onAISuggest: () => void;
  suggestion?: { title: string; description: string } | null;
  isAILoading: boolean;
  isCollaborative?: boolean;
  participantName?: string;
  isVisible: boolean;
}

export function InlineIdeaCapture({
  onSave,
  onAISuggest,
  suggestion,
  isAILoading,
  isCollaborative = false,
  participantName,
  isVisible,
}: InlineIdeaCaptureProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState(participantName || "");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUsingAI, setIsUsingAI] = useState(false);
  const [hasAppliedSuggestion, setHasAppliedSuggestion] = useState(false);

  // Apply AI suggestion when it arrives
  useEffect(() => {
    if (suggestion && !hasAppliedSuggestion) {
      setTitle(suggestion.title);
      setDescription(suggestion.description);
      setIsUsingAI(true);
      setHasAppliedSuggestion(true);
    }
  }, [suggestion, hasAppliedSuggestion]);

  // Reset hasAppliedSuggestion when suggestion is cleared
  useEffect(() => {
    if (!suggestion) {
      setHasAppliedSuggestion(false);
    }
  }, [suggestion]);

  const handleCapture = () => {
    if (!title.trim()) return;

    const authorName = isCollaborative ? (author.trim() || participantName || "Anonymous") : undefined;
    onSave(title.trim(), description.trim(), authorName, isUsingAI);

    // Show success feedback
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      // Reset form
      setTitle("");
      setDescription("");
      setIsUsingAI(false);
      setHasAppliedSuggestion(false);
    }, 800);
  };

  const handleAIFill = () => {
    setHasAppliedSuggestion(false);
    onAISuggest();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleCapture();
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence mode="wait">
      {showSuccess ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex flex-col items-center justify-center py-8 gap-3"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Check className="w-6 h-6 text-primary" />
          </motion.div>
          <span className="text-sm font-medium text-muted-foreground">Idea Captured</span>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl mx-auto"
          onKeyDown={handleKeyDown}
        >
          <div className="border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                Idea Canvas
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAIFill}
                disabled={isAILoading}
                className="text-xs gap-1.5 h-7 px-2"
              >
                {isAILoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    AI Fill
                  </>
                )}
              </Button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <motion.div
                animate={isUsingAI && title ? { 
                  boxShadow: ["0 0 0 0 hsl(var(--primary) / 0)", "0 0 0 3px hsl(var(--primary) / 0.2)", "0 0 0 0 hsl(var(--primary) / 0)"]
                } : {}}
                transition={{ duration: 0.6 }}
                className="rounded-md"
              >
                <Input
                  placeholder="Name this combination..."
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (isUsingAI) setIsUsingAI(false);
                  }}
                  className="bg-background/50 border-border/50 font-medium text-base placeholder:text-muted-foreground/50"
                />
              </motion.div>

              <motion.div
                animate={isUsingAI && description ? { 
                  boxShadow: ["0 0 0 0 hsl(var(--primary) / 0)", "0 0 0 3px hsl(var(--primary) / 0.2)", "0 0 0 0 hsl(var(--primary) / 0)"]
                } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="rounded-md"
              >
                <Textarea
                  placeholder="How do these forces connect?"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (isUsingAI) setIsUsingAI(false);
                  }}
                  rows={2}
                  className="bg-background/50 border-border/50 text-sm resize-none placeholder:text-muted-foreground/50"
                />
              </motion.div>

              {/* Author field for collaborative mode */}
              {isCollaborative && !participantName && (
                <Input
                  placeholder="Your name..."
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="bg-background/50 border-border/50 text-sm placeholder:text-muted-foreground/50"
                />
              )}
            </div>

            {/* Capture Button */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleCapture}
                disabled={!title.trim()}
                className="gap-2"
              >
                {isUsingAI && <Sparkles className="w-3.5 h-3.5" />}
                Capture
                <span className="text-xs text-primary-foreground/60 hidden sm:inline">⌘↵</span>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
