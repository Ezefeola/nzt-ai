# Request for comments

## Contents
- RFC or ADR
- What earns one
- The file
- The rules
- When it closes
- Done when

Produces `Docs/rfc/RFC-NNN-<slug>.md`: a decision **proposed** so the people it affects can
object before anyone commits to it.

**On request.** It appears in the plan only when the user asks for one, because it buys a
review window, and a window only pays when there are people to convince.

## RFC or ADR

> **An RFC asks. An ADR records.**

- An **RFC** is alive while the decision is open: the problem, the options, a recommendation,
  and the positions people took. It ends `accepted`, `rejected` or `withdrawn`.
- An **ADR** is written once the decision is taken, and it is the permanent record.
- **An accepted RFC produces its ADR**, and the ADR names the RFC. The RFC is never edited
  into a decision record: what it keeps is the discussion, which is precisely what an ADR
  deliberately does not keep.

A decision the user can take here does not need an RFC. This document exists for the one that
needs **agreement from people who are not in this conversation**.

## What earns one

All three, or it is an ADR:

- **Expensive to reverse**, or it sets a precedent everything downstream has to live with.
- **It affects people who are not the ones deciding** — another team, other consumers of a
  contract, whoever maintains it next.
- **There is a real choice**: two defensible answers. An RFC with one option is an
  announcement, and an announcement does not need a review window.

## The file

```markdown
# RFC-002 · Orders publish an event instead of calling Stock
status: open · opened 2026-09-17 · comments until 2026-09-24 · author: the user

## The problem
Confirming an order calls Stock synchronously. When Stock is down, confirmation fails:
14 failed confirmations last month, all of them recoverable orders.

## Options
| Option | What it costs | What it buys |
|---|---|---|
| Publish `order confirmed`, Stock reacts | a queue to operate; units reserved seconds later | confirmation stops depending on Stock being up |
| Retry the call in the background | no new infrastructure | the order exists without its reservation, with no visible trace |
| Leave it as is | nothing | the failure keeps happening |

## Proposal
The event. The delay is tolerable for the business — the reservation is not what the
customer sees — and it removes the only synchronous dependency of confirmation.

## What changes, and for whom
- **Stock**: consumes the event instead of exposing the endpoint. Migration in two steps,
  both alive for one release.
- **Support**: an order may show without its reservation for seconds. The screen has to say so.
- **Whoever operates it**: one more queue, with its dead-letter and its alert.

## Open questions
- What happens to an order whose event nobody consumed in 24 hours?

## Positions
- 2026-09-18 · Stock · **objects**: "two steps is a release we did not plan"
- 2026-09-19 · Support · **agrees, with a condition**: "only if the screen says it is pending"

## Outcome
accepted · 2026-09-24 · recorded in ADR-007
```

## The rules

- **Nothing is built from an open RFC.** While it is open, the work that depends on it waits
  — `waiting_on` in the state, naming the RFC — and independent work continues.
- **The comment window is a date, not a feeling.** An RFC with no date never closes, and one
  nobody answered is **not consensus**: the outcome says *closed with no response*, which is
  a fact, not an approval.
- **Objections are recorded in the words of whoever raised them, and none is ever deleted.**
  The value of this document is that the discarded option has an author and a reason. An
  objection that changed the proposal is answered **in** the proposal, with the change
  visible.
- **Every affected party gets its line**, including the ones who lose something. A proposal
  that costs nobody anything did not need agreement.
- **You are not a participant.** You write it, keep it current and summarise the positions.
  You do not invent a position, you do not count silence as support, and **the user's
  decision is never written up as a consensus**.
- `RFC-NNN` is assigned once and never reused. A superseded RFC keeps its number and its
  history; its status changes and the new one points back.
- Status is `open`, `accepted`, `rejected` or `withdrawn`, and **silence is not acceptance**.

## When it closes

- **Accepted** → write the ADR through `nzt-architecture-adr`, with the options and their
  costs already argued here, and name this RFC in it. Then the design documents it affects
  are brought current, in the same unit.
- **Rejected or withdrawn** → the status and the reason, in one line. It stays in `Docs/rfc/`:
  a rejected proposal is the cheapest way to stop the same idea from coming back every
  quarter with no memory of why it lost.

## Done when

Rehearse it: could someone who was not in the discussion read this and either object on the
merits or accept it, without asking you anything?

- The three conditions hold, or this should have been an ADR.
- Every option carries its cost, the proposed one included.
- Every affected party has its line, and the ones who lose are named.
- The comment window has a date on it.
- Positions are in their author's words, and none was deleted or summarised away.
- The outcome says what happened; an accepted one names its ADR.
- Nothing was built while it was open.
