

# Session Focus Types

## Problem
The current "Session Focus" always refines input into a "How Might We" problem statement. This is restrictive -- brainstorming sessions don't always aim at solving a problem. Sometimes teams want to generate content ideas, campaign concepts, social posts, or other creative outputs.

## Solution
Introduce a **Focus Type** selector in the `ProblemStatementEditor` dialog that lets users choose what kind of output the session targets. The AI refinement prompt and the Idea Capture labels will adapt accordingly.

## Focus Types

| Type | Label | AI Refine Prompt Style | Idea Capture Placeholder |
|------|-------|----------------------|--------------------------|
| `hmw` | How Might We | "How Might We..." problem framing (current default) | "Name this combination..." |
| `campaign` | Campaign Brief | "Generate a campaign direction for..." | "Name this campaign..." |
| `content` | Content Idea | "Frame a content concept around..." | "Name this content piece..." |
| `product` | Product / Feature | "Define a product opportunity for..." | "Name this product idea..." |
| `social` | Social Post | "Craft a social-first concept for..." | "Name this post concept..." |
| `open` | Open / Freeform | No AI reframing -- user types freely | "Name this idea..." |

## Changes

### 1. Data: Focus type definitions
**New file: `src/data/focusTypes.ts`**
- Export a `FocusType` union type and a `FOCUS_TYPES` array with label, description, AI system prompt snippet, and placeholder strings for each type.

### 2. Hook: `useModerator.ts`
- Add `focusType` state (persisted to localStorage, default `'hmw'`).
- Expose `setFocusType` and `focusType` from the hook.
- Include `focusType` in `resetProblemStatement`.

### 3. Component: `ProblemStatementEditor.tsx`
- Add a row of selectable chips/radio buttons at the top for choosing the focus type.
- Pass the selected type to the `refine-problem-statement` edge function.
- Update the "Refine with AI" button label contextually (e.g., "Refine as Campaign Brief").
- For `open` type, hide the AI refine button entirely (user writes directly).

### 4. Edge function: `refine-problem-statement/index.ts`
- Accept an optional `focusType` field in the request body.
- Switch the system prompt based on the type (HMW, campaign brief, content concept, etc.).
- Default to HMW if no type is provided (backward compatible).

### 5. Component: `ProblemStatementBanner.tsx`
- Show a small badge/label indicating the active focus type (e.g., "Campaign Brief" instead of just "Session Focus").

### 6. Component: `InlineIdeaCapture.tsx`
- Accept an optional `focusType` prop.
- Swap the title placeholder based on the type (from `FOCUS_TYPES` data).

### 7. Edge function: `suggest-idea/index.ts`
- Accept an optional `focusType` field.
- Adjust the AI prompt so it generates ideas matching the session type (e.g., a tweet concept vs. a product idea).

### 8. Wiring: `Index.tsx`
- Pass `focusType` from `useModerator` through to `ShuffleArea`, `InlineIdeaCapture`, `ProblemStatementBanner`, and the AI suggestion calls.

## Technical Notes
- All state stays in localStorage via `useModerator` -- no database changes needed.
- Edge function changes are backward-compatible (focusType is optional, defaults to HMW).
- The focus type chips use the same editorial styling as DeckSwitcher (mono labels, minimal design).

