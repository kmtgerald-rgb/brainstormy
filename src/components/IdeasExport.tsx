import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SavedIdea } from '@/hooks/useCards';
import { categoryShortLabels } from '@/data/defaultCards';
import { toast } from 'sonner';

interface IdeasExportProps {
  ideas: SavedIdea[];
}

function exportAsJSON(ideas: SavedIdea[]) {
  const data = ideas.map((idea) => ({
    title: idea.title,
    description: idea.description,
    author: idea.author || '',
    isAIGenerated: idea.isAIGenerated || false,
    cards: idea.cards.map((c) => ({
      category: categoryShortLabels[c.category],
      text: c.text,
    })),
    createdAt: idea.createdAt.toISOString(),
  }));

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, 'brainstormy-ideas.json');
  toast.success(`Exported ${ideas.length} ideas as JSON`);
}

function exportAsCSV(ideas: SavedIdea[]) {
  const header = ['Title', 'Description', 'Author', 'AI Generated', 'Insight Card', 'Asset Card', 'Catalyst Card', 'Random Card', 'Created At'];
  const rows = ideas.map((idea) => {
    const cardsByCategory: Record<string, string> = {};
    idea.cards.forEach((c) => {
      cardsByCategory[c.category] = c.text;
    });
    return [
      escapeCSV(idea.title),
      escapeCSV(idea.description),
      escapeCSV(idea.author || ''),
      idea.isAIGenerated ? 'Yes' : 'No',
      escapeCSV(cardsByCategory['insight'] || ''),
      escapeCSV(cardsByCategory['asset'] || ''),
      escapeCSV(cardsByCategory['tech'] || ''),
      escapeCSV(cardsByCategory['random'] || ''),
      idea.createdAt.toISOString(),
    ].join(',');
  });

  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  downloadBlob(blob, 'brainstormy-ideas.csv');
  toast.success(`Exported ${ideas.length} ideas as CSV`);
}

function escapeCSV(str: string): string {
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function IdeasExport({ ideas }: IdeasExportProps) {
  if (ideas.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <Download className="w-3 h-3" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportAsJSON(ideas)}>
          <span className="font-mono text-xs">Export as JSON</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportAsCSV(ideas)}>
          <span className="font-mono text-xs">Export as CSV</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
