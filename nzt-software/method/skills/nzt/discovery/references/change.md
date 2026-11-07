# Changing a feature that exists

Produces `Plan/specs/<feature>/change.md` — the proposal — and, once approved, the edited
spec and stories with change markers. Editing a spec is destructive with no cheap undo: the
proposal is where the user approves first. It carries no checkboxes or coverage marks.

Signals: a `change.md` in the folder = a change **not yet approved**; markers in the spec or
stories = **approved, not finished**.

## Steps

1. Read `spec.md` and its stories. Technical points go to the technical notes. Observed behavior never becomes the new rule on its own.
2. **Type each change**:

   | Type | Means | In the spec |
   |---|---|---|
   | `add` | new behavior | new rules and criteria, `[ ]` |
   | `modify` | existing behavior changes | `[modify]`: it **replaces**, never adds alongside |
   | `remove` | behavior stops applying | `[remove]`, with area and checkbox — removing is work |
   | `deprecate` | alive, on its way out | nothing yet; history entries at close |

3. Write the proposal; nothing undefined is filled in.

   ```markdown
   # Change — F-003 · Discount coupons
   opened: 2026-08-16
   origin: "the coupon should not apply to shipping"

   ## modify · RN-base-de-calculo
   Before: calculated over the total, shipping included.
   Now:    calculated over the products' subtotal.

   ## remove · RN-acumulacion
   Two coupons stop adding up; the second one wins.
   ```

   `origin:` is **the user's own sentence**; it becomes `Reason:` in the history.
4. **The user approves.** Nothing below happens first.
5. Merge into `spec.md` and stories with markers, **before** implementation:

   ```markdown
   ### RN-acumulacion · [remove] · backend — · qa —
   - [ ] **CA-01 · A valid coupon discounts the subtotal only.** (RN-base-de-calculo) [modify]
   ```

   A `[modify]` criterion returns to `[ ]` with areas `—` only if what is observed changed.
   Bring along, in the same unit, the technical design, screen designs and glossary it touches.
6. Delete `change.md`. Then build, verify, and the user accepts; the close sweeps markers.

## Removing is where it goes wrong

Deleting a rule from the spec does not delete it from the product, and leaves no trace to
detect the drift. A `remove` says what behavior stops, in the user's words, and **produces a
criterion that verifies the absence** (*given an order of $80, shipping **is charged***). At
close it is replaced or removed — its test stays.

## Done when

The implementer could work from the spec alone and get exactly the agreed behavior; the
proposal was approved, merged and deleted; no path, class or package appears anywhere.
