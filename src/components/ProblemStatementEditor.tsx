import { useState } from 'react';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FocusType, FOCUS_TYPES, getFocusTypeConfig } from '@/data/focusTypes';
import { cn } from '@/lib/utils';

interface ProblemStatementEditorProps {
  isOpen: boolean;
  onClose: () => void;
  currentContext: string | null;
  currentStatement: string | null;
  focusType: FocusType;
  onFocusTypeChange: (type: FocusType) => void;
  onSave: (context: string, statement: string) => Promise<void>;
}

export function ProblemStatementEditor({
  isOpen,
  onClose,
  currentContext,
  currentStatement,
  focusType,
  onFocusTypeChange,
  onSave,
}: ProblemStatementEditorProps) {
  const [context, setContext] = useState(currentContext || '');
  const [refinedStatement, setRefinedStatement] = useState(currentStatement || '');
  const [isRefining, setIsRefining] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const config = getFocusTypeConfig(focusType);

  const handleRefine = async () => {
    if (!context.trim()) {
      toast.error('Please enter some context first');
      return;
    }

    setIsRefining(true);
    try {
      const { data, error } = await supabase.functions.invoke('refine-problem-statement', {
        body: { context: context.trim(), focusType },
      });

      if (error) throw error;
      if (data?.statement) {
        setRefinedStatement(data.statement);
        toast.success('Statement refined');
      }
    } catch (error) {
      console.error('Error refining statement:', error);
      toast.error('Failed to refine statement');
    } finally {
      setIsRefining(false);
    }
  };

  const handleSave = async () => {
    if (!refinedStatement.trim()) {
      toast.error('Please refine or enter a statement first');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(context.trim(), refinedStatement.trim());
      toast.success('Focus set for session');
      onClose();
    } catch (error) {
      console.error('Error saving statement:', error);
      toast.error('Failed to save statement');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    setContext('');
    setRefinedStatement('');
    try {
      await onSave('', '');
      toast.success('Focus cleared');
      onClose();
    } catch (error) {
      console.error('Error clearing statement:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Set Session Focus</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Focus Type Selector */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Focus Type
            </label>
            <div className="flex flex-wrap gap-2">
              {FOCUS_TYPES.map((ft) => (
                <button
                  key={ft.type}
                  onClick={() => onFocusTypeChange(ft.type)}
                  className={cn(
                    'px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider rounded-sm border transition-all',
                    focusType === ft.type
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground'
                  )}
                >
                  {ft.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>

          {/* Context Input */}
          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Context & Challenges
            </label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="What problem are we solving? What constraints exist? Who is the audience? What does success look like?"
              className="min-h-[120px] resize-none font-serif text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {context.length} characters
            </p>
          </div>

          {/* Refine Button - hidden for 'open' type */}
          {focusType !== 'open' && (
            <Button
              onClick={handleRefine}
              disabled={isRefining || !context.trim()}
              variant="outline"
              className="w-full gap-2 font-mono text-xs uppercase tracking-wider"
            >
              {isRefining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Refining...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {config.refineLabel}
                </>
              )}
            </Button>
          )}

          {/* Refined Statement Preview */}
          {refinedStatement && (
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Refined Statement
              </label>
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <Textarea
                  value={refinedStatement}
                  onChange={(e) => setRefinedStatement(e.target.value)}
                  className="min-h-[80px] resize-none border-0 bg-transparent p-0 font-serif text-base focus-visible:ring-0"
                />
              </div>
            </div>
          )}

          {/* For open type, show inline textarea for direct writing */}
          {focusType === 'open' && !refinedStatement && (
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Your Focus Statement
              </label>
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <Textarea
                  value={refinedStatement}
                  onChange={(e) => setRefinedStatement(e.target.value)}
                  placeholder="Write your focus statement directly..."
                  className="min-h-[80px] resize-none border-0 bg-transparent p-0 font-serif text-base focus-visible:ring-0"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {(currentStatement || refinedStatement) && (
              <Button
                onClick={handleClear}
                variant="ghost"
                className="gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
            <div className="flex-1" />
            <Button
              onClick={onClose}
              variant="ghost"
              className="font-mono text-xs uppercase tracking-wider"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !refinedStatement.trim()}
              className="gap-2 font-mono text-xs uppercase tracking-wider"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Use This Statement
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
