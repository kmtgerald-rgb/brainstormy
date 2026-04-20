
## Expert Mode = Default + Excel Hotkeys + Range Copy/Paste

### Scope additions on top of the previous plan
1. Remove non-expert browser branch — spreadsheet is the only view.
2. Excel-style keyboard navigation (arrows, Tab, Enter, Esc, Cmd+arrows, Cmd+Backspace, Cmd+N).
3. **NEW: Range selection + copy/paste** (TSV clipboard, Excel/Sheets compatible).

### Range copy/paste behavior

**Selection model**
- Single active cell is the anchor. Shift+Click or Shift+↑/↓ extends selection to a contiguous row range (single column = `text`, since that's the only editable column).
- Selected rows get a subtle inset ring + slightly stronger bg.
- Click anywhere else / Esc clears selection back to single active row.

**Copy (`Cmd/Ctrl+C`)**
- Serialises selected rows as TSV, one card text per line. Multi-line card text is preserved by quoting per RFC 4180 (so it round-trips into Excel/Sheets cleanly):
  ```
  People crave quiet luxury
  "Gen Z treats receipts
  as identity"
  ```
- Writes to `navigator.clipboard` as `text/plain`. Toast: "Copied N cards."

**Cut (`Cmd/Ctrl+X`)**
- Same as copy, then deletes the selected rows (only wildcards are removed; default/AI rows in the selection are skipped with a count in the toast: "Copied 5, removed 3 wildcards").

**Paste (`Cmd/Ctrl+V`)**
- Reads clipboard `text/plain`, splits into lines (CRLF/LF), strips RFC-4180 quoting on multi-line quoted blocks.
- Each non-empty line → one new wildcard in the **currently selected category** (since paste is single-column).
- Inserted at the position after the active row (or at end if no active row). New rows become the selection.
- Toast: "Pasted N cards."

**Paste from Excel/Sheets**
- A column copied from Excel arrives as one text-per-line. Same rule applies — each line becomes a wildcard in the active category. Multi-line cells (quoted) are preserved as multi-line card text.
- Multi-column TSV from Excel: only the first column is used (others ignored), with a soft toast hint: "Only first column imported."

**Range delete**
- `Cmd/Ctrl+Backspace` or `Delete` while a range is selected → removes all selected wildcards. Default/AI rows in the range are skipped (counted in toast).

### Updated keyboard map

| Key | Behavior |
|---|---|
| `↑` `↓` | Move active row |
| `Shift+↑` `Shift+↓` | Extend range selection |
| `Cmd+↑` `Cmd+↓` | Jump to first / last row |
| `Cmd+Shift+↑` `Cmd+Shift+↓` | Extend selection to first / last |
| `Enter` | Edit active row |
| `Enter` (editing) | Commit + move down + open edit |
| `Shift+Enter` (editing) | Newline in textarea |
| `Tab` / `Shift+Tab` (editing) | Commit + move down / up |
| `Esc` | Cancel edit / clear range |
| `Cmd+C` / `Cmd+X` / `Cmd+V` | Copy / Cut / Paste range (TSV) |
| `Cmd+Backspace` or `Delete` | Delete selected wildcards |
| `Cmd+N` | Focus the "Add card" input |
| `Cmd+A` | Select all rows in current view |

### Files

**Changed**
- `src/components/DeckHub/CardBrowser.tsx` — strip non-expert branch, render `ExpertCardTable` directly.
- `src/components/DeckHub/ExpertCardTable.tsx` — add `activeRowId` + `selectionAnchorId` state, keyboard handler on the scroll container, row refs for `scrollIntoView`, range serialise/parse helpers (inline, ~30 LOC, RFC-4180 quoting reused from `deckCsv.ts`), clipboard read/write, footer legend.

**Reused**
- `serializeDeckToCsv` / `parseCsvToCards` quoting logic in `src/lib/deckCsv.ts` — extract a tiny `escapeCell` / `parseLines` helper there so the table can reuse it for TSV.

### Footer legend
Replace current hint with:
`↑↓ navigate · ⇧↑↓ select · ⌘C/V copy/paste · Enter edit · ⌘⌫ delete`

### Out of scope
- Multi-column selection (only `text` is editable, so single-column is sufficient).
- Cross-category paste (paste always lands in the active category).
- Undo/redo stack (separate feature).
