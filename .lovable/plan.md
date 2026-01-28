
## Implementation: Inline Deck Switchers

### Overview
Add subtle, inline deck variant switchers directly below the Insight and Catalyst card columns on the main canvas, replacing the menu-dependent flow.

### New Component: `src/components/DeckSwitcher.tsx`

A compact popover-based switcher with:
- **Trigger**: Small monospace label with chevron (e.g., "Human Truth ▾")
- **Popover content**:
  - Radio options for variants
  - For Industry/Region: inline text input + Generate button
  - Loading state during generation
  - Success indicator when cards are ready

```
┌────────────────────────────────────────────────────────────────┐
│  Insight       Asset         Catalyst       Random             │
│  ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐        │
│  │  Card  │    │  Card  │    │  Card  │    │  Card  │        │
│  └────────┘    └────────┘    └────────┘    └────────┘        │
│  ▾ Human       (no switch)   ▾ Technology   (no switch)       │
│    Truth                                                       │
└────────────────────────────────────────────────────────────────┘
```

### Component Props
```typescript
interface DeckSwitcherProps {
  type: 'insight' | 'catalyst';
  insightVariant?: InsightVariant;
  insightContext?: string;
  catalystVariant?: TechVariant;
  hasGeneratedCards?: boolean;
  isGenerating?: boolean;
  onInsightChange?: (variant: InsightVariant, context?: string) => void;
  onCatalystChange?: (variant: TechVariant) => void;
  onGenerate?: () => void;
}
```

### Insight Switcher Flow
1. Click "▾ Human Truth" trigger
2. Popover opens with 3 radio options:
   - Human Truth (default static deck)
   - Industry Insight (requires input)
   - Regional Insight (requires input)
3. If Industry/Region selected:
   - Text input appears with placeholder
   - "Generate" button (disabled until text entered)
4. Click Generate → loading state → auto-close on success
5. Trigger label updates to show context (e.g., "▾ Fintech Insights")

### Catalyst Switcher Flow
1. Click "▾ Technology" trigger
2. Popover opens with 3 radio options:
   - Technology
   - Content Format
   - Channel
3. Select option → instant switch (no generation needed)
4. Popover auto-closes, label updates

### Files to Modify

**`src/components/ShuffleArea.tsx`**
- Accept new deck management props
- Wrap each card column in a flex container
- Add DeckSwitcher below Insight (index 0) and Tech (index 2) cards
- Position switchers with subtle styling

**`src/pages/Index.tsx`**
- Pass deck management props to ShuffleArea:
  - `activePreset` config values
  - `setInsightVariant`, `setCatalystVariant`
  - `generateCards`, `isGenerating`

### Visual Design
- Trigger: `font-mono text-[10px] uppercase tracking-wider text-muted-foreground`
- Hover: subtle background, category accent color
- Popover: matches card aesthetic (off-white, minimal shadow)
- Generate button: small, primary color when enabled
- Loading: spinner icon, disabled state
- Success: small sparkles icon + card count badge

### Technical Details
1. Use Radix Popover for the dropdown
2. RadioGroup for variant selection
3. Input with debounced validation
4. Generate button triggers `onGenerate()` after `onInsightChange(variant, context)`
5. Auto-close popover on successful generation (listen to `hasGeneratedCards` change)
