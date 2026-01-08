import { useState } from 'react';
import { Settings, Layers, FileJson, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { PresetSwitcher } from './PresetSwitcher';
import { DeckConfigurator } from './DeckConfigurator';
import { CardBrowser } from './CardBrowser';
import { DeckPreset } from '@/hooks/useDeckManager';
import { Card, Category } from '@/data/defaultCards';
import { InsightVariant, TechVariant } from '@/data/deckVariants';
import { cn } from '@/lib/utils';

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
  
  // Export/Import
  onExport: () => string;
  onImport: (json: string) => void;
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
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-2 font-mono text-[10px] uppercase tracking-wider"
        >
          <Layers className="w-3.5 h-3.5" />
          Deck Hub
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader className="text-left">
          <SheetTitle className="font-serif text-xl flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Deck Hub
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
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

            <div className="mt-6">
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
              </TabsContent>

              <TabsContent value="configure" className="mt-0">
                <p className="text-xs text-muted-foreground mb-4">
                  Customize the active preset: <strong>{activePreset.name}</strong>
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
                  Browse and manage cards in your deck
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
      </SheetContent>
    </Sheet>
  );
}
