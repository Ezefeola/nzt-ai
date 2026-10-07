---
name: nzt-architecture-adr
description: Use when a decision that is expensive to reverse has to be recorded: what forced it, the options with their cost, and what it commits the project to.
---

# Decision record

Produces `Docs/adr/ADR-NNN-<slug>.md`, one file per decision. It exists so that a decision
nobody can reconstruct does not get relitigated every few months by someone who cannot tell
a choice from an accident.

If you did not arrive here from `nzt-architecture`, load it first.

## What earns a record

One of these is enough:

- **Expensive to reverse.** Undoing it means migrating data, rewriting a component or
  breaking someone else's integration.
- **It constrains other people's options.** Everything downstream now has to live with it.
- **It was contested.** Two defensible answers, and the reasoning is what makes the choice
  legible later.

**If the decision also needs agreement from people who are not in this conversation, the
RFC comes first** (`nzt-architecture-rfc`) and this record is what its acceptance produces —
with the options already argued there, and naming it.

What does not earn a record: anything reversible in an afternoon, and anything the stack
document already records. A row in `Docs/<area>-stack-<component>.md` saying `Endpoints: minimal APIs` needs
no ADR unless choosing it cost something worth remembering.

## The file

```markdown
# ADR-004 · Redemptions are written in the order's transaction
status: accepted · 2026-09-16 · decided by: the user

## What forced this
A coupon must not be redeemed twice by the same customer. The order and the redemption are
written by the same API, but the invoice is issued by Billing, which can fail.

## Options
| Option | Cost |
|---|---|
| Order and redemption in one transaction, invoice retried after | The invoice can lag the order by minutes |
| Write the redemption only after the invoice comes back | A window where the coupon can be used twice |
| Reserve the coupon, confirm on invoice | A third state to maintain, and expiries to sweep |

## Decision
Order and redemption in one transaction. The invoice is retried out of band.

## What we accept
- An order can exist without its invoice for a while, and the support desk will see that.
- If Billing is down for hours, the backlog is ours to drain.
- Reversing this means splitting the write and adding a reservation state.

## Supersedes
Nothing.
```

## Writing it

- **Record the real reason the rejected options lost.** An option rejected against a
  strawman is an option somebody will propose again next quarter, with better arguments.
- **What we accept is not optional.** Every decision costs something; a record that lists
  only benefits is advocacy, and it teaches the next reader nothing.
- Say **what reversing it would take**. That is what tells a future reader whether to argue
  or to live with it.
- Write it when the decision is made. An ADR reconstructed three weeks later records what
  you remember, which is mostly the winning argument.
- **A decision the user made against your recommendation is recorded as theirs**, with what
  you objected and what you proposed. It is never written up as your recommendation, and it
  is not reopened without a new argument.

## Numbering and status

- `ADR-NNN` is assigned once and never reused. The slug never changes, even if the title is
  reworded.
- Status is `proposed`, `accepted` or `superseded by ADR-NNN`.
- **A superseded record is never edited and never deleted.** Its status changes, it points
  forward, and the new record points back in **Supersedes**. The chain is the only place
  the history of a decision survives.
- A decision that was never actually taken stays `proposed`. Silence is not acceptance.

## Where it is referenced

`Docs/architecture.md` names the ADR next to the choice it explains, and the feature design
does the same when the decision shaped it. A record nobody links to is a record nobody
finds.

## Done when

Rehearse it: could someone who was not in the conversation decide whether to keep this
decision, using only this file?

- What forced the decision is written, not implied.
- Every option has its real cost, including the one that won.
- The consequences include the ones that hurt.
- Status, date and who decided are on the file.
- The record is linked from wherever the decision shows up.
