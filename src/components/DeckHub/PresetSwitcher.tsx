import { useState } from 'react';
import { Plus } from 'lucide-react';
import { DeckPreset } from '@/hooks/useDeckManager';
import { PresetCard } from './PresetCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface PresetSwitcherProps {
  presets: DeckPreset[];
  activePresetId: string;
  onActivate: (presetId: string) => void;
  onDuplicate: (presetId: string) => void;
  onDelete: (presetId: string) => void;
  onCreate: (name: string) => void;
}

export function PresetSwitcher({
  presets,
  activePresetId,
  onActivate,
  onDuplicate,
  onDelete,
  onCreate,
}: PresetSwitcherProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const handleCreate = () => {
    if (!newPresetName.trim()) return;
    onCreate(newPresetName.trim());
    setNewPresetName('');
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        {presets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            isActive={preset.id === activePresetId}
            onActivate={() => onActivate(preset.id)}
            onDuplicate={() => onDuplicate(preset.id)}
            onDelete={preset.isDefault ? undefined : () => onDelete(preset.id)}
          />
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="w-full gap-2 font-mono text-[10px] uppercase tracking-wider"
      >
        <Plus className="w-3 h-3" />
        New Preset
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Create New Preset</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Preset name"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newPresetName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
