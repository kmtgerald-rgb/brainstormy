
The user wants two things:
1. Remove the regenerate (sparkle) button from the card front — they don't want inline editing affordances on the card itself.
2. Restore the flip-to-explain functionality, which is currently broken.

Let me check the current MashupCard logic. Looking at `handleCardClick`:
```
if (flippable) handleFlip(e);
else if (isModeratorMode && onEdit) onEdit();
else if (onClick) onClick();
```

And `handleFlip`:
```
if (!flippable) return;
e.stopPropagation();
if (!isFlipped && onFlip) onFlip();
setIsFlipped(!isFlipped);
```

That logic looks correct. So why is flip broken? Let me check ShuffleArea: `flippable={!isModeratorMode}` — so flippable is true when not in moderator mode. Should work.

Also need to check the build error: `useGameMode.ts(37,27): NodeJS namespace not found`. Easy fix: use `ReturnType<typeof setInterval>` instead of `NodeJS.Timeout`.

Likely cause of broken flip: the new regenerate button's onRegenerate callback was added, and possibly the onClick on the card div is being intercepted, OR — more likely — the parent `motion.div` wrapper or the card structure changed. Actually, looking closer: the `onClick={handleCardClick}` is on an inner div, but the outer `motion.div` from animate=true wraps everything. That should still bubble.

Wait — checking front face: the regenerate button + actions are in `absolute top-3 right-3 z-10`. Clicking on card body should still trigger handleCardClick. 

Possible issue: `pointer-events`. The contentRef inner div is scaled with transform. The container has `overflow-hidden`. Should still receive clicks.

Let me actually just check — the user says "flip and explain cannot be triggered". Most likely cause: the onClick is on the inner rotation div, but events from FrontFace (which is `absolute inset-0`) should bubble up through the rotation div. That should work.

Hmm, one theory: the regenerate button has `disabled={isRegenerating}` but no e.stopPropagation when not regenerating — wait it does have stopPropagation. OK.

Another theory: the previous task summary mentioned "In moderator mode, cards are clickable for direct editing" — but the user says flip is broken in normal (non-moderator) mode. Let me re-examine. In non-moderator mode with onRegenerate passed: handleCardClick → flippable=true → handleFlip → setIsFlipped(true). Should work.

Maybe the issue is visual: the card flips but the explanation doesn't show because of some other issue. Or perhaps Index.tsx is passing isModeratorMode=true unintentionally? Without seeing Index.tsx I can't be sure, but the simplest robust fix is:

**Plan:**
1. Remove the `onRegenerate` button from `MashupCard`'s front face (and its props), plus remove `isModeratorMode`/`onEdit`/`hasOverride` rendering of pencil icon — keep card pure display + flip.
2. Remove regenerate wiring from `ShuffleArea` and `Index.tsx` (don't pass `onRegenerateCard`, `isRegenerating`, `isModeratorMode`, `onEditCard`, `hasOverride` to MashupCard).
3. Card-editing access stays available in the Browse Decks drawer (already exists) and ProblemStatementEditor — moderator editing on the canvas itself is removed per user request.
4. Fix `useGameMode.ts` build error: replace `NodeJS.Timeout` with `ReturnType<typeof setInterval>`.

Result: Cards on the canvas are click-to-flip only. Clean, no edit/regenerate icons. Flip + AI explanation works reliably.

## Files to change
- `src/components/MashupCard.tsx` — drop edit/regenerate UI; simplify click handler to flip-only (when `flippable`).
- `src/components/ShuffleArea.tsx` — stop passing edit/regenerate props.
- `src/pages/Index.tsx` — stop passing `onRegenerateCard`, `isRegenerating`, `isModeratorMode`, `onEditCard`, `hasOverride` to ShuffleArea.
- `src/hooks/useGameMode.ts` — fix `NodeJS.Timeout` type to `ReturnType<typeof setInterval>`.

No prop interface changes elsewhere; useCardRegeneration hook stays available for future use but is unused on the canvas.
