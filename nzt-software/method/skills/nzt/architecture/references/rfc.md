# Request for comments

Produces `Docs/Architecture/rfc/RFC-NNN-<slug>.md`: a decision **proposed** so the people it
affects can object before anyone commits. **On request only.** An RFC asks; an ADR records.

**Earns one** only with all three: expensive to reverse or a precedent; it affects people who
are not deciding; there are two defensible answers. Otherwise it is an ADR.

## The file

```markdown
# RFC-002 · Orders publish an event instead of calling Stock
status: open · opened 2026-09-17 · comments until 2026-09-24 · author: the user

## The problem
Confirming an order calls Stock synchronously: 14 failed confirmations last month.

## Options
| Option | Costs | Buys |
|---|---|---|
| Publish `order confirmed` | a queue to operate; reservation seconds later | confirmation independent of Stock |
| Leave it | nothing | the failure keeps happening |

## Proposal
The event: the delay is invisible to the customer.

## What changes, and for whom
- **Stock**: consumes the event; two-step migration.
- **Support**: an order may show without its reservation for seconds.

## Positions
- 2026-09-18 · Stock · **objects**: "two steps is a release we did not plan"

## Outcome
accepted · 2026-09-24 · recorded in ADR-007
```

## Rules

1. **Nothing is built from an open RFC**: dependent work waits (`waiting_on` names it),
   independent work continues.
2. The comment window is a date. No answer is not consensus: the outcome says *closed with no
   response*.
3. Positions in their authors' words, none deleted; an objection that changed the proposal
   is answered in it, visibly. Every affected party gets a line, losers included.
4. You write and summarise; you never invent a position, count silence as support, or write
   the user's decision up as consensus.
5. `RFC-NNN` is never reused. Status: `open`, `accepted`, `rejected`, `withdrawn`.
6. **Accepted** → write its ADR naming it, and update affected designs in the same unit.
   **Rejected or withdrawn** → status and reason in one line; it stays as the record.

## Done when

Someone outside the discussion could object on the merits or accept it without asking you.
