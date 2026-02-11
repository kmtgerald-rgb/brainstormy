import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FocusType, getFocusTypeConfig } from "@/data/focusTypes";

interface InlineIdeaCaptureProps {
  onSave: (title: string, description: string, author?: string, isAIGenerated?: boolean) => void;
  onAISuggest: () => void;
  suggestion?: { title: string; description: string } | null;
  isAILoading: boolean;
  isVisible: boolean;
  autoAISuggest?: boolean;
  onAutoAISuggestChange?: (enabled: boolean) => void;
  focusType?: FocusType;
}

export function InlineIdeaCapture({
  onSave,
  onAISuggest,
  suggestion,
  isAILoading,
  isVisible,
  autoAISuggest = false,
  onAutoAISuggestChange,
  focusType = 'hmw',
}: InlineIdeaCaptureProps) {
  const focusConfig = getFocusTypeConfig(focusType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUsingAI, setIsUsingAI] = useState(false);
  const [hasAppliedSuggestion, setHasAppliedSuggestion] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textareas
  const autoResize = (ref: React.RefObject<HTMLTextAreaElement>) => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResize(titleRef);
  }, [title]);

  useEffect(() => {
    autoResize(descriptionRef);
  }, [description]);

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

    onSave(title.trim(), description.trim(), undefined, isUsingAI);

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
          <div className="bg-transparent p-4 space-y-4">
            {/* Header with AI Toggle */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                Idea Canvas
              </h3>
              <div className="flex items-center gap-4">
                {/* Auto AI Toggle */}
                {onAutoAISuggestChange && (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="auto-ai"
                      checked={autoAISuggest}
                      onCheckedChange={onAutoAISuggestChange}
                      className="scale-75"
                    />
                    <Label htmlFor="auto-ai" className="text-xs text-muted-foreground cursor-pointer">
                      Auto AI
                    </Label>
                  </div>
                )}
                {/* Manual AI Fill button (hidden when auto is on) */}
                {!autoAISuggest && (
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
                )}
              </div>
            </div>

            {/* Form Fields - Underline Style */}
            <div className="space-y-4">
              <motion.div
                animate={isUsingAI && title ? { 
                  opacity: [0.7, 1]
                } : {}}
                transition={{ duration: 0.4 }}
              >
                <textarea
                  ref={titleRef}
                  placeholder={focusConfig.ideaPlaceholder}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (isUsingAI) setIsUsingAI(false);
                  }}
                  rows={1}
                  className="w-full bg-transparent border-0 border-b border-border/50 focus:border-primary pb-2 font-medium text-lg placeholder:text-muted-foreground/40 focus:outline-none transition-colors resize-none overflow-hidden min-h-[2rem]"
                />
              </motion.div>

              <motion.div
                animate={isUsingAI && description ? { 
                  opacity: [0.7, 1]
                } : {}}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <textarea
                  ref={descriptionRef}
                  placeholder={focusConfig.descriptionPlaceholder}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (isUsingAI) setIsUsingAI(false);
                  }}
                  rows={1}
                  className="w-full bg-transparent border-0 border-b border-border/50 focus:border-primary pb-2 text-sm placeholder:text-muted-foreground/40 focus:outline-none transition-colors resize-none overflow-hidden min-h-[1.5rem]"
                />
              </motion.div>
            </div>

            {/* AI Loading Indicator */}
            {isAILoading && autoAISuggest && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs">Generating idea...</span>
              </div>
            )}

            {/* Capture Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleCapture}
                disabled={!title.trim()}
                variant="ghost"
                className="gap-2 text-sm"
              >
                {isUsingAI && <Sparkles className="w-3.5 h-3.5" />}
                Capture
                <span className="text-xs text-muted-foreground hidden sm:inline">⌘↵</span>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}