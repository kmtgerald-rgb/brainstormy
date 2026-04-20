
## Fix: Make every card editable in Expert Mode

### The bug
Two issues, both in `ExpertCardTable.tsx`:

1. **Editing a default/AI card creates a brand-new wildcard** instead of updating the row in place. `commitEdit()` calls `onAddWildcard(...)` for non-wildcards, so the table keeps growing (the user saw rows numbered 22, 21, 20 appear after "edits"). The original default text stays untouched.
2. **Editing a wildcard works** (calls `onEditWildcard`) — but only because the prop happens to be wired. No regression here, just confirming.

There's also a display bug: the sheet passes the *raw* `deckManager.getCardsForCategory` (no moderator overrides applied), so even if we save overrides for default cards, the table won't reflect them until reload.

### The fix
Use the existing moderator-override system (`useModerator.updateCardText` / `resetCardText`) for default + AI cards, and keep `onEditWildcard` for wildcards. Wire override application into the data path that feeds the sheet.

**Behavior matrix**
| Card type | On edit | On delete |
|---|---|---|
| Wildcard (custom) | `onEditWildcard(id, text)` — mutates the wildcard | `onRemoveWildcard(id)` (existing) |
| Default | `onUpdateCardText(id, text)` — saves a moderator override | Not allowed (defaults live in code) |
| AI-generated | `onUpdateCardText(id, text)` — saves a moderator override | Not allowed (delete via "Reset" / regenerate flow, out of scope) |

If the user clears the textarea on a default/AI card and commits → call `onResetCardText(id)` so the original default text returns. A small "RESET" button replaces the trash icon for overridden default/AI rows so users can revert.

### Files to change

1. **`src/pages/Index.tsx`** — pass the override-aware `getCardsForCategory` (the local `useCallback`, not the raw `deckManager.getCardsForCategory`) into `ShuffleArea`, plus three new props: `onUpdateCardText`, `onResetCardText`, `hasOverride`. The local `getCardsForCategory` already calls `applyOverrides`, so default rows in the table will show their current edited text.

2. **`src/components/ShuffleArea.tsx`** → **`src/components/DeckBrowserSheet.tsx`** → **`src/components/DeckHub/DeckHub.tsx`** → **`src/components/DeckHub/CardBrowser.tsx`** → **`src/components/DeckHub/ExpertCardTable.tsx`** — thread the three new props through the prop chain.

3. **`src/components/DeckHub/ExpertCardTable.tsx`** — rewrite `commitEdit()`:
   ```text
   if card.isWildcard           → onEditWildcard(id, trimmed)
   else if trimmed === ''       → onResetCardText(id)   // revert to original default
   else                         → onUpdateCardText(id, trimmed)
   ```
   Also: in the actions column, when a default/AI row has an override (`hasOverride(card.id)`), show a small **Reset** icon (Undo2) instead of nothing; clicking it calls `onResetCardText(id)`. Wildcards keep their trash icon.

4. **Remove the `(category)` arg mismatch in expert table's `handleExport`** — it calls `getCardsForCategory(cat)` for all four categories, which is fine and continues to work with the override-aware version.

### Out of scope
- Letting expert mode delete defaults (they live in code; resetting their override is the equivalent).
- Bulk-reset for overridden rows.
- Changing how moderator mode toggles — overrides are saved unconditionally from expert mode (consistent with the spreadsheet metaphor where any cell is editable).
