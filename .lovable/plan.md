
## Fix: Enter on a row should edit, not add a new card

### The bug
When the user presses `Enter` on a selected row, focus is on the outer container (`containerRef`). The container handler does call `startEdit(card)`, but `startEdit` calls `setActive(card.id)` which calls `containerRef.current?.focus()`-adjacent logic… actually let me re-check by reading the code carefully.

Looking at `handleContainerKeyDown`:
```
if (e.key === 'Enter' && activeId) {
  e.preventDefault();
  const card = categoryCards.find((c) => c.id === activeId);
  if (card) startEdit(card);
  return;
}
```
That looks right. But there's a guard above:
```
const target = e.target as HTMLElement;
if (target.tagName === 'INPUT' && target !== containerRef.current) return;
```
The "Add new card" `<Input>` is part of the same container's DOM tree? No — the container only wraps the ScrollArea + table. The Input sits outside the container, so this isn't the issue there.

The actual problem: when the user clicks a row, `handleRowClick` runs `containerRef.current?.focus()`. Good — container has focus, Enter should be caught.

**But:** when the page first loads or the user toggles into Expert Mode, the new-card `Input` at the top is the first focusable element. If the user types text there and then clicks a row, focus moves to container and Enter works. However if the user clicks a row but the `Input` still has focus (e.g., they tabbed back), Enter triggers the Input's `onKeyDown`:
```
onKeyDown={(e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleAddNew();
  }
}}
```
→ adds a new (possibly empty/last-typed) card. That matches the symptom: "add new cards instead of editing the cell."

Also: clicking the row calls `handleRowClick` which calls `containerRef.current?.focus()` — but the row's `<button>` inside the text cell may steal focus on click since buttons are focusable. After `mousedown` on the inner `<button>`, focus lands on that button, not the container. Pressing Enter on a button activates it → which calls `startEdit` (good) BUT also bubbles to the container's `onKeyDown`. Actually the button's onClick is on click, not keydown — so Enter on a focused button fires click → opens edit. That should work.

The real culprit is most likely: **the new-card `Input` retains focus**, so Enter goes there. The user's mental model is "I clicked a row, Enter should edit it" — but their click didn't move focus off the Input because they clicked the row's text `<button>`, which calls `e.stopPropagation()` then `handleRowClick` then `startEdit`. Inside `startEdit`, there's no `focus()` call, and the row's button gets focus only briefly before `setEditingId` re-renders and the textarea autofocuses via the `useEffect`. So actually clicking a row text *does* enter edit immediately.

The reported scenario must be: user navigates with arrow keys (which work — container has focus), then presses Enter expecting to edit, but instead a new card is created. This happens when **`activeId` is null** — the Enter handler's `if (activeId)` guard fails, falls through, and… nothing else handles Enter at the container. So Enter does nothing at the container level. But if focus is actually on the new-card Input (because user hasn't clicked anywhere yet, or clicked a toolbar button which returned focus to body/Input), Enter → adds card.

### The fix

Three small changes:

1. **Auto-activate the first row on mount / when category changes**, so `activeId` is never null when the table is visible. This makes Enter always have a target.
2. **Auto-focus the container** when the table mounts (and after category/filter changes), instead of leaving focus on the new-card Input. The Input still gets focus on `⌘N` for rapid bulk entry.
3. **Stop the new-card Input from swallowing Enter when it's empty** — if `newCardText` is empty, don't preventDefault/handleAddNew. (Defense in depth.)

### Files
- `src/components/DeckHub/ExpertCardTable.tsx` — add a `useEffect` to focus `containerRef` and set `activeId` to the first row whenever `categoryCards` changes from empty/active-missing to a populated list. Update the new-card Input's `onKeyDown` to no-op when text is empty.

### Out of scope
- Visual focus indicator changes — current ring is sufficient.
- Changing the keyboard map.
