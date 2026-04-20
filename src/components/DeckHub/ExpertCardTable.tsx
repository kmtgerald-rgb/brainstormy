import { useState, useRef, useMemo, useEffect, useCallback, KeyboardEvent } from 'react';
import { Trash2, Plus, Download, Upload, Sparkles, Undo2 } from 'lucide-react';
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
  serializeTextLinesToTsv,
  parsePastedTextToLines,
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
  onUpdateCardText?: (id: string, text: string) => void;
  onResetCardText?: (id: string) => void;
  hasOverride?: (id: string) => boolean;
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

const isMod = (e: KeyboardEvent | React.MouseEvent) => e.metaKey || e.ctrlKey;

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
  onUpdateCardText,
  onResetCardText,
  hasOverride,
}: ExpertCardTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newCardText, setNewCardText] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [anchorId, setAnchorId] = useState<string | null>(null);

  const editRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());

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

  // Keep selection valid + ensure there's always an active row so Enter has a target
  useEffect(() => {
    if (categoryCards.length === 0) {
      if (activeId !== null) {
        setActiveId(null);
        setAnchorId(null);
      }
      return;
    }
    if (!activeId || !categoryCards.find((c) => c.id === activeId)) {
      const firstId = categoryCards[0].id;
      setActiveId(firstId);
      setAnchorId(firstId);
    }
  }, [categoryCards, activeId]);

  // Focus the table container when category/filter changes so keyboard shortcuts
  // (Enter to edit, arrows to navigate) work without an extra click.
  useEffect(() => {
    // Don't steal focus while the user is mid-edit or typing in another input
    const active = document.activeElement as HTMLElement | null;
    if (editingId) return;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
    containerRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, filter]);

  // Compute the set of selected row ids (range between anchor and active)
  const selectedIds = useMemo(() => {
    if (!activeId) return new Set<string>();
    if (!anchorId || anchorId === activeId) return new Set([activeId]);
    const ai = categoryCards.findIndex((c) => c.id === anchorId);
    const bi = categoryCards.findIndex((c) => c.id === activeId);
    if (ai < 0 || bi < 0) return new Set([activeId]);
    const [lo, hi] = ai <= bi ? [ai, bi] : [bi, ai];
    return new Set(categoryCards.slice(lo, hi + 1).map((c) => c.id));
  }, [activeId, anchorId, categoryCards]);

  const scrollToRow = useCallback((id: string) => {
    const el = rowRefs.current.get(id);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, []);

  const setActive = useCallback(
    (id: string | null, extend = false) => {
      setActiveId(id);
      if (!extend) setAnchorId(id);
      if (id) scrollToRow(id);
    },
    [scrollToRow],
  );

  // === Edit ===
  const startEdit = (card: Card) => {
    setEditingId(card.id);
    setEditText(card.text);
    setActive(card.id);
  };

  const commitEdit = (): { id: string | null } => {
    if (!editingId) return { id: null };
    const id = editingId;
    const trimmed = editText.trim();
    const card = categoryCards.find((c) => c.id === id);
    if (card) {
      if (card.isWildcard) {
        // Wildcards: empty text → delete; otherwise update
        if (!trimmed) {
          onRemoveWildcard(id);
        } else if (onEditWildcard) {
          onEditWildcard(id, trimmed);
        }
      } else {
        // Default / AI: empty → reset to original; otherwise save override
        if (!trimmed) {
          onResetCardText?.(id);
        } else {
          onUpdateCardText?.(id, trimmed);
        }
      }
    }
    setEditingId(null);
    setEditText('');
    return { id };
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

  // === CSV ===
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

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
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
      const cats = new Set(rows.map((r) => r.category));
      wildcards.filter((w) => cats.has(w.category)).forEach((w) => onRemoveWildcard(w.id));
    }
    rows.forEach((r) => onAddWildcard(r.text, r.category));
    toast.success(`Imported ${rows.length} cards${mode === 'replace' ? ' (replaced existing)' : ''}`);
    setPendingImport(null);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(LLM_DECK_PROMPT);
      toast.success('Prompt copied');
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  // === Clipboard: copy / cut / paste ===
  const copySelection = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const texts = categoryCards.filter((c) => selectedIds.has(c.id)).map((c) => c.text);
    try {
      await navigator.clipboard.writeText(serializeTextLinesToTsv(texts));
      toast.success(`Copied ${texts.length} card${texts.length === 1 ? '' : 's'}`);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  }, [selectedIds, categoryCards]);

  const cutSelection = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const rows = categoryCards.filter((c) => selectedIds.has(c.id));
    const texts = rows.map((c) => c.text);
    const removable = rows.filter((c) => c.isWildcard);
    try {
      await navigator.clipboard.writeText(serializeTextLinesToTsv(texts));
    } catch {
      toast.error('Could not copy to clipboard');
      return;
    }
    removable.forEach((c) => onRemoveWildcard(c.id));
    const skipped = rows.length - removable.length;
    toast.success(
      `Copied ${texts.length}${skipped > 0 ? `, removed ${removable.length} wildcard${removable.length === 1 ? '' : 's'}` : ''}`,
    );
  }, [selectedIds, categoryCards, onRemoveWildcard]);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      const { lines, hadMultipleColumns } = parsePastedTextToLines(text);
      if (lines.length === 0) {
        toast.error('Clipboard is empty');
        return;
      }
      lines.forEach((t) => onAddWildcard(t, selectedCategory));
      toast.success(
        `Pasted ${lines.length} card${lines.length === 1 ? '' : 's'}${hadMultipleColumns ? ' · only first column imported' : ''}`,
      );
    } catch {
      toast.error('Could not read clipboard');
    }
  }, [onAddWildcard, selectedCategory]);

  const deleteSelection = useCallback(() => {
    if (selectedIds.size === 0) return;
    const rows = categoryCards.filter((c) => selectedIds.has(c.id));
    const removable = rows.filter((c) => c.isWildcard);
    if (removable.length === 0) {
      toast.error('Selection contains no custom cards to delete');
      return;
    }
    removable.forEach((c) => onRemoveWildcard(c.id));
    const skipped = rows.length - removable.length;
    toast.success(
      `Deleted ${removable.length} wildcard${removable.length === 1 ? '' : 's'}${skipped > 0 ? ` · skipped ${skipped}` : ''}`,
    );
  }, [selectedIds, categoryCards, onRemoveWildcard]);

  // === Edit-mode keyboard handler ===
  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const { id } = commitEdit();
      // Move down + open edit on next row
      if (id) {
        const idx = categoryCards.findIndex((c) => c.id === id);
        const next = categoryCards[idx + 1];
        if (next) {
          setActive(next.id);
          startEdit(next);
        }
      }
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const { id } = commitEdit();
      if (id) {
        const idx = categoryCards.findIndex((c) => c.id === id);
        const target = categoryCards[idx + (e.shiftKey ? -1 : 1)];
        if (target) setActive(target.id);
      }
    }
  };

  // === Container-level keyboard handler (navigation + clipboard + delete) ===
  const handleContainerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Don't intercept while editing — textarea has its own handler
    if (editingId) return;
    // Don't intercept while typing in the "add new" input
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' && target !== containerRef.current) return;

    const idx = activeId ? categoryCards.findIndex((c) => c.id === activeId) : -1;

    // ⌘N → focus new card input
    if (isMod(e) && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      newInputRef.current?.focus();
      return;
    }

    // ⌘A → select all
    if (isMod(e) && e.key.toLowerCase() === 'a') {
      if (categoryCards.length === 0) return;
      e.preventDefault();
      setAnchorId(categoryCards[0].id);
      setActiveId(categoryCards[categoryCards.length - 1].id);
      return;
    }

    // ⌘C / ⌘X / ⌘V
    if (isMod(e) && e.key.toLowerCase() === 'c') {
      if (selectedIds.size === 0) return;
      e.preventDefault();
      copySelection();
      return;
    }
    if (isMod(e) && e.key.toLowerCase() === 'x') {
      if (selectedIds.size === 0) return;
      e.preventDefault();
      cutSelection();
      return;
    }
    if (isMod(e) && e.key.toLowerCase() === 'v') {
      e.preventDefault();
      pasteFromClipboard();
      return;
    }

    // Delete / ⌘Backspace
    if (e.key === 'Delete' || (isMod(e) && e.key === 'Backspace')) {
      if (selectedIds.size === 0) return;
      e.preventDefault();
      deleteSelection();
      return;
    }

    // Esc → clear range to single
    if (e.key === 'Escape') {
      if (activeId) {
        e.preventDefault();
        setAnchorId(activeId);
      }
      return;
    }

    // Enter → edit active row
    if (e.key === 'Enter' && activeId) {
      e.preventDefault();
      const card = categoryCards.find((c) => c.id === activeId);
      if (card) startEdit(card);
      return;
    }

    // Arrow navigation
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (categoryCards.length === 0) return;
      e.preventDefault();
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      let nextIdx: number;
      if (isMod(e)) {
        nextIdx = dir === 1 ? categoryCards.length - 1 : 0;
      } else if (idx < 0) {
        nextIdx = dir === 1 ? 0 : categoryCards.length - 1;
      } else {
        nextIdx = Math.max(0, Math.min(categoryCards.length - 1, idx + dir));
      }
      const next = categoryCards[nextIdx];
      setActiveId(next.id);
      if (!e.shiftKey) setAnchorId(next.id);
      else if (!anchorId) setAnchorId(activeId ?? next.id);
      scrollToRow(next.id);
      return;
    }
  };

  const handleRowClick = (e: React.MouseEvent, id: string) => {
    if (e.shiftKey && activeId) {
      setActiveId(id);
      // keep existing anchor
      if (!anchorId) setAnchorId(activeId);
    } else {
      setActiveId(id);
      setAnchorId(id);
    }
    containerRef.current?.focus();
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
          ref={newInputRef}
          placeholder={`Add a new ${categoryLabels[selectedCategory].toLowerCase()} card...`}
          value={newCardText}
          onChange={(e) => setNewCardText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (!newCardText.trim()) return;
              e.preventDefault();
              handleAddNew();
            }
          }}
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

      {/* Spreadsheet table — focusable for keyboard nav */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleContainerKeyDown}
        className="outline-none focus:ring-1 focus:ring-ring rounded-sm"
      >
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
                const isSelected = selectedIds.has(card.id);
                const isActive = activeId === card.id;
                return (
                  <TableRow
                    key={card.id}
                    ref={(el) => {
                      if (el) rowRefs.current.set(card.id, el);
                      else rowRefs.current.delete(card.id);
                    }}
                    onClick={(e) => handleRowClick(e, card.id)}
                    className={cn(
                      'border-l-2 group cursor-pointer',
                      categoryAccent[card.category],
                      isSelected ? 'bg-primary/5' : 'hover:bg-muted/30',
                      isActive && 'ring-1 ring-inset ring-primary/40',
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
                          onKeyDown={handleEditKeyDown}
                          onBlur={() => commitEdit()}
                          className="min-h-[44px] text-xs resize-none py-1 px-2"
                        />
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(e, card.id);
                            startEdit(card);
                          }}
                          className="text-xs leading-relaxed text-left w-full hover:text-foreground/80 transition-colors whitespace-pre-wrap"
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
                      {card.isWildcard ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveWildcard(card.id);
                          }}
                          className="p-1 hover:bg-destructive/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete card"
                        >
                          <Trash2 className="w-3 h-3 text-destructive/70 hover:text-destructive" />
                        </button>
                      ) : hasOverride?.(card.id) && onResetCardText ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onResetCardText(card.id);
                          }}
                          className="p-1 hover:bg-muted rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Reset to default"
                        >
                          <Undo2 className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      ) : null}
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
      </div>

      <p className="text-[10px] text-muted-foreground text-center font-mono">
        ↑↓ navigate · ⇧↑↓ select · ⌘C/V copy/paste · Enter edit · ⌘⌫ delete
      </p>
      <p className="text-[10px] text-muted-foreground text-center">
        {categoryCards.length} cards in {categoryLabels[selectedCategory]}
        {selectedIds.size > 1 && ` · ${selectedIds.size} selected`}
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
