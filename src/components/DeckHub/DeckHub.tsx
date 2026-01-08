import { useState } from 'react';
import { Layers, Upload, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PresetSwitcher } from './PresetSwitcher';
import { DeckConfigurator } from './DeckConfigurator';
import { CardBrowser } from './CardBrowser';
import { DeckPreset } from '@/hooks/useDeckManager';
import { Card, Category } from '@/data/defaultCards';
import { InsightVariant, TechVariant } from '@/data/deckVariants';

interface DeckHubProps {
  // State
  presets: DeckPreset[];
  activePreset: DeckPreset;
  wildcards: Card[];
  isGenerating: boolean;
  
  // Preset actions
  onActivatePreset: (presetId: string) => void;
  onCreatePreset: (name: string) => void;
  onDuplicatePreset: (presetId: string) => void;
  onDeletePreset: (presetId: string) => void;
  
  // Config actions
  onInsightChange: (variant: InsightVariant, context?: string) => void;
  onCatalystChange: (variant: TechVariant) => void;
  onGenerate: (forceRegenerate?: boolean) => void;
  
  // Wildcard actions
  onAddWildcard: (text: string, category: Category) => void;
  onRemoveWildcard: (id: string) => void;
  onEditWildcard?: (id: string, text: string) => void;
  
  // Card getter
  getCardsForCategory: (category: Category) => Card[];
  
  // Export/Import/Reset
  onExport: () => string;
  onImport: (json: string) => void;
  onReset: () => void;
}

export function DeckHub({
  presets,
  activePreset,
  wildcards,
  isGenerating,
  onActivatePreset,
  onCreatePreset,
  onDuplicatePreset,
  onDeletePreset,
  onInsightChange,
  onCatalystChange,
  onGenerate,
  onAddWildcard,
  onRemoveWildcard,
  onEditWildcard,
  getCardsForCategory,
  onExport,
  onImport,
  onReset,
}: DeckHubProps) {
  const [activeTab, setActiveTab] = useState('presets');

  const handleExport = () => {
    const json = onExport();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brainstormy-presets.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const json = e.target?.result as string;
        onImport(json);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-4 h-4 text-muted-foreground" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Deck Hub
        </span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger 
            value="presets"
            className="font-mono text-[10px] uppercase tracking-wider"
          >
            Presets
          </TabsTrigger>
          <TabsTrigger 
            value="configure"
            className="font-mono text-[10px] uppercase tracking-wider"
          >
            Configure
          </TabsTrigger>
          <TabsTrigger 
            value="cards"
            className="font-mono text-[10px] uppercase tracking-wider"
          >
            Cards
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="presets" className="mt-0 space-y-4">
            <p className="text-xs text-muted-foreground">
              Switch between saved deck configurations
            </p>
            <PresetSwitcher
              presets={presets}
              activePresetId={activePreset.id}
              onActivate={onActivatePreset}
              onDuplicate={onDuplicatePreset}
              onDelete={onDeletePreset}
              onCreate={(name) => onCreatePreset(name)}
            />
            
            <Separator className="my-4" />
            
            {/* Import/Export */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Backup & Restore
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="flex-1 gap-2 font-mono text-[10px] uppercase tracking-wider"
                >
                  <Download className="w-3 h-3" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImport}
                  className="flex-1 gap-2 font-mono text-[10px] uppercase tracking-wider"
                >
                  <Upload className="w-3 h-3" />
                  Import
                </Button>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            {/* Reset */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Reset
              </label>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 font-mono text-[10px] uppercase tracking-wider text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset All to Defaults
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset all deck settings?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delete all custom presets, wildcards, and AI-generated cards. Default presets will be restored. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Reset All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>

          <TabsContent value="configure" className="mt-0">
            <p className="text-xs text-muted-foreground mb-4">
              Customize: <strong>{activePreset.name}</strong>
            </p>
            <DeckConfigurator
              activePreset={activePreset}
              isGenerating={isGenerating}
              onInsightChange={onInsightChange}
              onCatalystChange={onCatalystChange}
              onGenerate={onGenerate}
            />
          </TabsContent>

          <TabsContent value="cards" className="mt-0">
            <p className="text-xs text-muted-foreground mb-4">
              Browse and manage cards
            </p>
            <CardBrowser
              activePreset={activePreset}
              wildcards={wildcards}
              getCardsForCategory={getCardsForCategory}
              onAddWildcard={onAddWildcard}
              onRemoveWildcard={onRemoveWildcard}
              onEditWildcard={onEditWildcard}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
