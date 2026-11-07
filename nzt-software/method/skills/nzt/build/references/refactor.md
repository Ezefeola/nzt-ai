# Refactor

Produces a change that leaves behavior **identical** — same inputs, outputs, side effects
and errors — and the evidence that it is. No new spec; verification and current documents
still required.

## Steps

1. **Can you tell if behavior changed?** If nothing covers what you will move, write the
   covering test first against the **current** behavior and make it pass; it stays. If it
   cannot be tested, say what you checked by hand and report the result as unverified.
2. Current behavior is the baseline even when it looks wrong: report the defect, fix it in
   its own unit.
3. **One reason per unit.** Never mix a behavior change in; no renames or reformatting
   outside the unit's purpose.
4. Keep the public contract unless changing it **is** the unit; then every caller moves in
   the same unit, or the old shape stays.
5. Dead code (nothing can reach it) may go, and you say so. Removing **behavior** is
   `remove.md`.
6. Run the covering checks **after** the change. Criteria already `✓` whose work you touched
   get their tests re-run, or their mark is reported as no longer backed. A `qa ✓` on
   touched work is reported for `nzt-verify` to re-run.
7. Update documents that describe the structure you changed.

Taking on debt is named with its cost, never absorbed.

## Done when

Someone could diff it and be sure nothing the user can observe moved; the report says what
moved, what it is now and what you verified — not "cleaned up".
