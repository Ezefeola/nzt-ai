# Closing a feature

Leaves a feature nobody has to interpret again: no markers, every document current, one
history entry. One pass over the whole feature, never one per story.

## Preconditions

- Every criterion of every story is `[x]`, every area and `qa` marked `✓`, and **the user
  accepted them**.
- `Plan/specs/<feature>/testing/README.md` has no open defect and no criterion without its
  agreed scenario.
- Deploying is not a condition. If the plan included ship, the release is verified and
  logged in `Docs/Operations/releases.md`.
- A change proposal in the feature folder is approved and merged (`nzt-discovery`) or
  dropped first. A `[SPEC-CONFLICT]` is resolved with the user, never swept.

Anything missing is named and the close stops.

## Steps

1. **Sweep the markers.** `[modify]`: the marker goes, the new text stays. `[remove]`: the
   rule disappears — the spec says what the product does, the history says what it stopped
   doing. A criterion that only asserted an absence is replaced by the positive one, or
   removed with its rule; **its regression test stays**.
2. **Bring affected documents current**, each with its own router — go down the list:

   | If the feature changed | Update |
   |---|---|
   | a term | `Docs/Domain/glossary.md` |
   | an entity, field or relationship | `Docs/Domain/domain-model.md` (and the DDD pack's documents, if listed) |
   | a component, boundary or external system | `Docs/Architecture/architecture.md` |
   | a technology, version, package, area, pack or opt-in | `Docs/Architecture/tech.md` |
   | an expensive-to-reverse decision | `Docs/Architecture/adr/` |
   | objectives, users, modules or scope | `Docs/Product/product.md` |
   | a screen, shared component or visual role | the UX documents |
   | what the end user does, if the manual exists | `Docs/Manual/` (never created at a close) |
   | environments, pipeline, rollback | `Docs/Operations/deployment.md` |
   | work found and left | `Docs/Architecture/tech-debt.md` |
   | its own flows, data, integrations | `Plan/specs/<feature>/tech-design/` |

3. **Write the history entry** in `Docs/Product/history.md`: append-only, newest on top, one
   per closed change cycle.

   ```markdown
   ## 2026-08-16 · The coupon stops applying to shipping — F-003
   Type:     modify
   Change:   the discount is calculated over the products' subtotal.
   Reason:   shipping was eating the promotion.
   Before:   calculated over the total, shipping included.
   Now:      calculated over the subtotal.
   Impact:   RN-base-de-calculo changed · RN-acumulacion removed · US-008 changed
   Decision: the client shows what the server returned (QT-04)
   ```

   `Type` is `add`, `modify`, `remove` or `deprecate`. `Before`/`Now` are mandatory in
   `modify` and `remove` — the only record of a removed rule — and absent in `add`.
   `Impact` cites rules by slug and stories by id; `Decision` is one line citing its record.
   A `deprecate` gets two entries: when marked and when removed. No paths, classes or
   patterns: a change with no behavior change has no entry.
4. **Stop**: safe point, state, report — what was accepted, swept, updated and deferred.

## Done when

Someone reading only the spec can believe every word, and someone reading only the history
can say what the feature used to do.
