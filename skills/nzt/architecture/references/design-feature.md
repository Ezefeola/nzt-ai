# Feature design

Produces `Plan/specs/<feature>/tech-design/design.md` — how one feature is solved across the
existing components — and `tech-design/decisions.md`. One feature per unit.

**Offered, never declared.** A feature earns one when it crosses components in a way its
stories do not settle, involves a third party, has states with meaning, has requirements
that condition the solution, or has alternatives worth explaining. Offer it with what is
lost: *"where each rule is enforced would be decided while writing the code"*.

## Steps

1. Read the spec and stories, `architecture.md`, `tech.md` and `domain-model.md`. You fit
   into decisions already made; re-deciding them here starts a second architecture.
2. Read every rule and story asking what must be settled for it to be buildable; each gap is
   an open `QT-NN`. Then say how many and offer the mode. A rule the spec lacks goes back to
   discovery; design the rest meanwhile.
3. Write the file.

## The file

```markdown
# Design — F-003 Coupons at checkout

## Flow
Confirming an order with a coupon (US-003):
1. The API re-validates the coupon — the client's total is never trusted.
2. It writes the order and its redemption in one transaction.
3. It sends the order to Billing; on failure the order stays confirmed and the invoice is retried.

## Where each rule is enforced
| Rule | Enforced in |
|---|---|
| RN-cupon-vencido | coupon validation, on apply and on confirm |
| RN-un-uso-por-cliente | unique constraint (coupon, customer) plus the check before writing |

## Data
- The discount is stored on the order, never recalculated: the coupon may change later.

## States
`draft → confirmed → invoiced`, and `confirmed → cancelled` (releases the coupon).

## Integrations
| Id | We send | We expect | On failure |
|---|---|---|---|
| INT-01 · Billing | confirmed order | invoice id | queued and retried |

## Open questions
QT-04 (in decisions.md).
```

## Rules

1. **One flow per story**, numbered, naming which component does each step, followed to the
   end (background work, notifications, retries). Say what is not trusted and where it is
   re-checked.
2. **Every rule gets an enforcement row.** No row: nobody implements it. Two places: say
   which is the source of truth. Client-only is not enforcement.
3. **Data**: what is persisted, derived, and frozen at a point in time. An entity with
   business states gets its states and legal transitions. No field nobody asked for.
4. **Failure**: for every flow with more than one effect, what is guaranteed together, what
   the user sees when a step fails, and whether running it twice is safe.
5. **Integrations** cite their `INT-NN` (create it in `architecture.md` first if missing),
   with what we send, expect, and do when it is down or slow. Behavior is researched, not
   remembered.
6. Earned diagrams: `sequence` per flow that matters, `state` for an entity's lifecycle,
   `flow` for branching inside one component.

## Done when

Someone could implement the feature without asking a structural question, and nothing
contradicts `architecture.md` or `tech.md`.
