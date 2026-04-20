
## CSV Import/Export for Expert Mode Table

### Goal
Extend the planned Expert Mode spreadsheet view with CSV round-tripping plus a copyable prompt that primes another LLM (ChatGPT, Claude, etc.) to generate a deck CSV in the right shape.

### Where it lives
A new toolbar row at the top of the `ExpertCardTable` (below the category select, above the table):

```text
[Export CSV]  [Import CSV]  [Copy LLM Prompt]
```

All three buttons sit inline as small ghost buttons with mono uppercase labels — same editorial styling as the rest of Expert Mode.

### CSV Shape

One file = one preset (all four categories together). Header + rows:

```csv
category,text,type
insight,"People crave quiet luxury",default
insight,"Gen Z treats receipts as identity",custom
asset,"Our newsletter has 80k subscribers",custom
tech,"Voice agents that book appointments",ai
random,"A handwritten letter",default
```

Columns:
- `category` — one of `insight | asset | tech | random` (validated on import)
- `text` — the card text (quoted; supports commas + newlines)
- `type` — `default | custom | ai` (informational on export; on import everything becomes a wildcard/custom regardless, since defaults live in code)

Filename: `mashup-deck-<presetName>-<YYYYMMDD>.csv`.

### Export behavior
- Click "Export CSV" → builds rows from all four categories of the active preset (defaults + AI + wildcards), serialises with proper RFC 4180 quoting, triggers a browser download via a Blob.
- No external library — small inline `toCsv()` helper handles escaping.

### Import behavior
- Click "Import CSV" → opens an `<input type="file" accept=".csv">` (hidden, ref-clicked).
- Parse client-side with a small inline parser (handles quoted fields, escaped quotes, CRLF). No `papaparse` dependency.
- Validate each row:
  - Category must be one of the four valid values.
  - Text must be non-empty after trim.
  - Skip + count invalid rows.
- Open a confirmation dialog showing: "Import N cards into this deck? (M skipped)" with options:
  - **Append** — add all valid rows as wildcards alongside existing cards.
  - **Replace wildcards** — clear existing wildcards in this preset first, then add imported rows as wildcards.
  - **Cancel**.
- On confirm, loop `onAddWildcard(text, category)` for each valid row. Toast: "Imported N cards."

(Defaults stay untouched — import never overwrites the built-in card pool, only the wildcard layer. This keeps the model simple and reversible.)

### LLM Prompt button
- Click "Copy LLM Prompt" → copies a ready-to-paste prompt to clipboard, shows toast "Prompt copied."
- The prompt:

```text
Generate a brainstorming card deck for [TOPIC] as CSV with this exact schema:

category,text,type

Rules:
- category must be one of: insight, asset, tech, random
  - insight = consumer/human/cultural truths
  - asset = brand assets, channels, owned things
  - tech = catalysts: technologies, formats, platforms
  - random = wild, unrelated provocations
- text = a single short, punchy card (8–18 words). No numbering, no quotes inside unless escaped.
- type = always "custom" for generated rows.

Generate exactly 15 cards per category (60 total). Output ONLY the CSV — no preamble, no code fence, no commentary. First line must be the header.
```

A small `[TOPIC]` placeholder hint sits next to the button: *"Replace [TOPIC] with your brand or theme."*

### Files

**New**
- `src/lib/deckCsv.ts` — pure helpers: `serializeDeckToCsv(cards)`, `parseCsvToCards(text)`, `LLM_DECK_PROMPT` constant.

**Changed**
- `src/components/DeckHub/ExpertCardTable.tsx` (the spreadsheet view from the previously approved plan) — add the toolbar row with the three buttons, the hidden file input, and the import-confirmation `AlertDialog`.

No hook, edge function, or schema changes. Imported rows go through the existing `onAddWildcard` callback already wired in `useDeckManager`, so localStorage persistence is automatic.

### Edge cases handled
- Empty CSV / header-only → toast "No cards found in file."
- Invalid category → row skipped, counted in summary.
- Duplicate text inside the same category → still imported (user may want repeats; cheap to dedupe later if needed).
- Files >1MB → toast "File too large (max 1MB)" and abort.
