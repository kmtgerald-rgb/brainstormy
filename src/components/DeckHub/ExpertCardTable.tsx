import { useState, useRef, useMemo, useEffect } from 'react';
import { Trash2, Plus, Download, Upload, Copy, Sparkles } from 'lucide-react';
import { Card, Category, categoryLabels } from '@/data/defaultCards';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  serializeDeckToCsv,
  parseCsvToCards,
  downloadCsv,
  csvFilename,
  LLM_DECK_PROMPT,
  ParsedCsvRow,
} from '@/lib/deckCsv';
import { DeckPreset } from '@/hooks/useDeckManager';

type FilterType = 'all' | 'default' | 'wildcards' | 'generated';

interface ExpertCardTableProps {
  activePreset: DeckPreset;
  wildcards: Card[];
  selectedCategory: Category;
  filter: FilterType;
  onCategoryChange: (cat: Category) => void;
  getCardsForCategory: (category: Category) => Card[];
  onAddWildcard: (text: string, category: Category) => void;
  onRemoveWildcard: (id: string) => void;
  onEditWildcard?: (id: string, text: string) => void;
}

const categoryAccent: Record<Category, string> = {
  insight: 'border-l-[hsl(var(--category-insight))]',
  asset: 'border-l-[hsl(var(--category-asset))]',
  tech: 'border-l-[hsl(var(--category-tech))]',
  random: 'border-l-[hsl(var(--category-random))]',
};

const typeBadge = (card: Card) => {
  if (card.isGenerated) return { label: 'AI', cls: 'bg-primary/10 text-primary' };
  if (card.isWildcard) return { label: 'CUSTOM', cls: 'bg-amber-500/10 text-amber-600' };
  return { label: 'DEFAULT', cls: 'bg-muted text-muted-foreground' };
};

const MAX_FILE_SIZE = 1_000_000; // 1MB

export function ExpertCardTable({
  activePreset,
  wildcards,
  selectedCategory,
  filter,
  onCategoryChange,
  getCardsForCategory,
  onAddWildcard,
  onRemoveWildcard,
  onEditWildcard,
}: ExpertCardTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newCardText, setNewCardText] = useState('');
  const editRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import dialog state
  const [pendingImport, setPendingImport] = useState<{ rows: ParsedCsvRow[]; skipped: number } | null>(null);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingId]);

  const categoryCards = useMemo(() => {
    const baseCards = getCardsForCategory(selectedCategory);
    const categoryWildcards = wildcards.filter((w) => w.category === selectedCategory);
    if (filter === 'default') return baseCards.filter((c) => !c.isWildcard && !c.isGenerated);
    if (filter === 'wildcards') return categoryWildcards;
    if (filter === 'generated') return baseCards.filter((c) => c.isGenerated);
    return [...baseCards, ...categoryWildcards];
  }, [selectedCategory, filter, getCardsForCategory, wildcards]);

  const startEdit = (card: Card) => {
    setEditingId(card.id);
    setEditText(card.text);
  };

  const saveEdit = () => {
    if (!editingId || !editText.trim()) {
      cancelEdit();
      return;
    }
    const card = categoryCards.find((c) => c.id === editingId);
    if (!card) {
      cancelEdit();
      return;
    }
    if (card.isWildcard && onEditWildcard) {
      onEditWildcard(editingId, editText.trim());
    } else {
      // For default/AI cards, create an override as a new wildcard
      onAddWildcard(editText.trim(), selectedCategory);
    }
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleAddNew = () => {
    if (!newCardText.trim()) return;
    onAddWildcard(newCardText.trim(), selectedCategory);
    setNewCardText('');
  };

  // === CSV: Export ===
  const handleExport = () => {
    const allCategories: Category[] = ['insight', 'asset', 'tech', 'random'];
    const allCards: Card[] = [];
    allCategories.forEach((cat) => {
      allCards.push(...getCardsForCategory(cat));
      allCards.push(...wildcards.filter((w) => w.category === cat));
    });
    if (allCards.length === 0) {
      toast.error('No cards to export');
      return;
    }
    const csv = serializeDeckToCsv(allCards);
    downloadCsv(csvFilename(activePreset.name), csv);
    toast.success(`Exported ${allCards.length} cards`);
  };

  // === CSV: Import ===
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting same file
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large (max 1MB)');
      return;
    }
    try {
      const text = await file.text();
      const result = parseCsvToCards(text);
      if (result.rows.length === 0) {
        toast.error('No cards found in file');
        return;
      }
      setPendingImport({ rows: result.rows, skipped: result.skipped });
    } catch (err) {
      console.error(err);
      toast.error('Failed to read file');
    }
  };

  const performImport = (mode: 'append' | 'replace') => {
    if (!pendingImport) return;
    const { rows } = pendingImport;

    if (mode === 'replace') {
      // Remove existing wildcards (across all categories represented in import)
      const cats = new Set(rows.map((r) => r.category));
      wildcards.filter((w) => cats.has(w.category)).forEach((w) => onRemoveWildcard(w.id));
    }
    rows.forEach((r) => onAddWildcard(r.text, r.category));
    toast.success(`Imported ${rows.length} cards${mode === 'replace' ? ' (replaced existing)' : ''}`);
    setPendingImport(null);
  };

  // === LLM Prompt ===
  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(LLM_DECK_PROMPT);
      toast.success('Prompt copied');
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div className="space-y-3">
      {/* Category select row */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Category
        </span>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value as Category)}
          className="flex-1 h-7 px-2 bg-background border border-border rounded-sm font-mono text-[11px] uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {(['insight', 'asset', 'tech', 'random'] as Category[]).map((cat) => (
            <option key={cat} value={cat}>
              {categoryLabels[cat]}
            </option>
          ))}
        </select>
      </div>

      {/* CSV Toolbar */}
      <div className="flex flex-wrap items-center gap-1 pb-2 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          className="h-7 px-2 font-mono text-[10px] uppercase tracking-wider"
        >
          <Download className="w-3 h-3 mr-1" />
          Export CSV
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleImportClick}
          className="h-7 px-2 font-mono text-[10px] uppercase tracking-wider"
        >
          <Upload className="w-3 h-3 mr-1" />
          Import CSV
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyPrompt}
          className="h-7 px-2 font-mono text-[10px] uppercase tracking-wider"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Copy LLM Prompt
        </Button>
        <span className="ml-auto text-[10px] text-muted-foreground italic hidden sm:inline">
          Replace [TOPIC] with your brand or theme
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChosen}
          className="hidden"
        />
      </div>

      {/* Add new row */}
      <div className="flex gap-2">
        <Input
          placeholder={`Add a new ${categoryLabels[selectedCategory].toLowerCase()} card...`}
          value={newCardText}
          onChange={(e) => setNewCardText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
          className="h-8 text-xs"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleAddNew}
          disabled={!newCardText.trim()}
          className="h-8 px-3"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      {/* Spreadsheet table */}
      <ScrollArea className="h-[420px] border border-border rounded-sm">
        <Table>
          <TableHeader className="bg-muted/30 sticky top-0 z-10">
            <TableRow>
              <TableHead className="h-8 w-10 px-2 font-mono text-[10px] uppercase tracking-wider">
                #
              </TableHead>
              <TableHead className="h-8 px-2 font-mono text-[10px] uppercase tracking-wider">
                Card Text
              </TableHead>
              <TableHead className="h-8 w-20 px-2 font-mono text-[10px] uppercase tracking-wider">
                Type
              </TableHead>
              <TableHead className="h-8 w-12 px-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryCards.map((card, idx) => {
              const badge = typeBadge(card);
              const isEditing = editingId === card.id;
              return (
                <TableRow
                  key={card.id}
                  className={cn(
                    'border-l-2 group hover:bg-muted/30',
                    categoryAccent[card.category],
                    isEditing && 'bg-muted/40',
                  )}
                >
                  <TableCell className="py-1.5 px-2 font-mono text-[10px] text-muted-foreground align-top">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="py-1.5 px-2 align-top">
                    {isEditing ? (
                      <Textarea
                        ref={editRef}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={saveEdit}
                        className="min-h-[44px] text-xs resize-none py-1 px-2"
                      />
                    ) : (
                      <button
                        onClick={() => startEdit(card)}
                        className="text-xs leading-relaxed text-left w-full hover:text-foreground/80 transition-colors"
                        title="Click to edit"
                      >
                        {card.text}
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="py-1.5 px-2 align-top">
                    <span
                      className={cn(
                        'inline-block px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider rounded',
                        badge.cls,
                      )}
                    >
                      {badge.label}
                    </span>
                  </TableCell>
                  <TableCell className="py-1.5 px-2 align-top">
                    {card.isWildcard && (
                      <button
                        onClick={() => onRemoveWildcard(card.id)}
                        className="p-1 hover:bg-destructive/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete card"
                      >
                        <Trash2 className="w-3 h-3 text-destructive/70 hover:text-destructive" />
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {categoryCards.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-8">
                  No cards match this filter
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      <p className="text-[10px] text-muted-foreground text-center">
        {categoryCards.length} cards in {categoryLabels[selectedCategory]} · Click any row to edit
      </p>

      {/* Import confirmation dialog */}
      <AlertDialog open={!!pendingImport} onOpenChange={(open) => !open && setPendingImport(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import {pendingImport?.rows.length} cards?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingImport?.skipped
                ? `${pendingImport.skipped} invalid row${pendingImport.skipped === 1 ? '' : 's'} will be skipped. `
                : ''}
              Cards will be added as custom (wildcard) cards. Choose how to handle existing custom cards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="outline" onClick={() => performImport('replace')}>
              Replace Wildcards
            </Button>
            <AlertDialogAction onClick={() => performImport('append')}>Append</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
