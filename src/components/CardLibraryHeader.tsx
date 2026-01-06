import { Search, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'list';

interface CardLibraryHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showModifiedOnly?: boolean;
  onShowModifiedOnlyChange?: (show: boolean) => void;
  isModeratorMode?: boolean;
}

export function CardLibraryHeader({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  showModifiedOnly = false,
  onShowModifiedOnlyChange,
  isModeratorMode = false,
}: CardLibraryHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search cards..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 border-border"
        />
      </div>

      {/* View toggle and filters */}
      <div className="flex items-center justify-between gap-4">
        {/* View mode toggle */}
        <div className="flex border border-border overflow-hidden">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors',
              viewMode === 'grid'
                ? 'bg-foreground text-background'
                : 'bg-background text-foreground hover:bg-muted'
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors',
              viewMode === 'list'
                ? 'bg-foreground text-background'
                : 'bg-background text-foreground hover:bg-muted'
            )}
          >
            <List className="w-3.5 h-3.5" />
            List
          </button>
        </div>

        {/* Modified only filter (moderator mode) */}
        {isModeratorMode && onShowModifiedOnlyChange && (
          <button
            onClick={() => onShowModifiedOnlyChange(!showModifiedOnly)}
            className={cn(
              'px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider border transition-colors',
              showModifiedOnly
                ? 'bg-amber-500/20 text-amber-600 border-amber-500/40'
                : 'border-border text-muted-foreground hover:bg-muted'
            )}
          >
            Modified Only
          </button>
        )}
      </div>
    </div>
  );
}
