# Decision record

Produces `Docs/Architecture/adr/ADR-NNN-<slug>.md`, one per decision, so a choice nobody can
reconstruct is not re-argued every few months.

**Earns one** if it is expensive to reverse, constrains other people's options, or was
contested. Not: anything reversible in an afternoon, or a value `tech.md` already records
unless choosing it cost something worth remembering. Needing agreement from people outside
this conversation → an RFC first; its acceptance produces this record.

## The file

```markdown
# ADR-004 · Redemptions are written in the order's transaction
status: accepted · 2026-09-16 · decided by: the user

## What forced this
A coupon must not be redeemed twice. The invoice is issued by Billing, which can fail.

## Options
| Option | Cost |
|---|---|
| Order and redemption in one transaction, invoice retried | the invoice can lag minutes |
| Redemption only after the invoice | a window to use the coupon twice |

## Decision
One transaction; the invoice is retried out of band.

## What we accept
- An order can exist without its invoice for a while.
- Reversing it means splitting the write and adding a reservation state.

## Supersedes
Nothing.
```

## Rules

1. Record the **real** reason each rejected option lost, and what the winner costs.
2. Say what reversing it would take.
3. Write it when decided, not weeks later.
4. A decision the user made against your recommendation is recorded as theirs, with your
   objection and proposal.
5. `ADR-NNN` and the slug never change or get reused. Status: `proposed`, `accepted`, or
   `superseded by ADR-NNN`. A superseded record is never edited or deleted; it points
   forward, the new one points back. Silence leaves it `proposed`.
6. Link it from `architecture.md` and any design it shaped.

## Done when

Someone who was not there could decide whether to keep the decision using only this file.
