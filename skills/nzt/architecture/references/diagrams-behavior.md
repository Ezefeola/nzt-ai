---
name: nzt-architecture-diagrams-behavior
description: Use when drawing a feature's flow as a sequence, an entity's business states, or the decisions inside one component.
---

# The three pictures of a feature design

All three live in `Plan/specs/<feature>/tech-design/design.md`, beside the flow they explain.

Load `nzt-architecture` and `nzt-architecture-diagrams` before applying this.

## They show the order and the who, never the rule

The design says **in what order it happens and who does each step**. What the system decides
is the business rule, and it lives in the feature's `spec.md`, cited from the prose around
the picture and never restated inside it.

> **If a label states something the spec does not say, stop.** That is new behavior: it goes
> through `nzt-discovery-change`, not into a diagram.

## `sequence` — the order between participants

One per flow that matters: the path that pays, plus the failure that changes the outcome.

**The limit is seven participants.** Participants are columns and columns are the expensive
axis — each one widens the picture and adds crossings. Past seven, the flow crosses too many
boundaries to be one flow: it is two, cut where the responsibility changes hands.

```
sequenceDiagram
  actor Customer
  participant checkout
  participant billing
  participant Orders

  Customer->>checkout: enters the code
  checkout->>billing: asks to validate the coupon
  alt coupon valid
    billing-->>checkout: discount applied
    checkout->>Orders: stores the discounted total
  else expired
    billing-->>checkout: reason for the rejection
  end
  checkout-->>Customer: shows the total
```

- `->>` a call · `-->>` its answer · `alt` / `else` the branch that matters
- **Participants are components, actors and stores** — never a class or a method.
- Time goes down. There is no other ordering.

**Only the failure that changes the outcome.** A flow has many ways to fail, and drawing them
all buries the one that matters: the expired coupon, the third party that does not answer. A
validation that returns an error like every other validation is prose. If two branches both
deserve the picture, that is two diagrams, not one with three `alt` blocks.

**A self-call is worth drawing only when the step is a decision worth naming** — *calculates
the total with the discount*. As bookkeeping it is noise: the reader already assumes a
component does work between receiving and answering.

## `state` — the life of one entity

Earned when the feature has an entity with business states. **The limit is eight states, all
of one entity.** Past eight, two lifecycles are mixed — an order's own states with its
payment's — and the split is by entity, never by grouping states.

```
stateDiagram-v2
  [*] --> pending
  pending --> paid: the payment clears
  pending --> cancelled: the customer cancels
  paid --> shipped: the warehouse dispatches it
  shipped --> delivered: the courier confirms
  cancelled --> [*]
  delivered --> [*]
```

- **The initial state is explicit**, with `[*]`, and so is every end state. A diagram that
  starts in the middle hides where things are born.
- **A state is a business state** — one the glossary defines and the user says out loud.
  Never a technical flag: `isProcessed`, `synced`, `dirty` are implementation, and if one of
  them earns a place here it was a business state all along and the spec is missing it.
- **Every transition carries what causes it**, as an event in ubiquitous language: *the
  payment clears*. Not *update*, not *changes to paid* — that is the arrow already.

> **A transition you cannot label is a question, not a drawing problem.** Nobody decided what
> makes it happen: it is a `QT-NN` if it is technical, and a change to the feature if it is
> behavior.

## `flow` — the decisions inside one component

It earns its place in one case only: **branching that is pure business logic and happens
entirely inside a single component.** If a second participant appears while you draw it,
stop and draw a sequence instead — the door just closed.

**The limit is eight nodes**, decisions and outcomes together. Past eight, the logic is two
rules that were specified as one, and the split is by rule.

```
flowchart TD
  start([A code is entered]) --> exists{Does the coupon exist?}
  exists -- no --> unknown[It is reported as unknown]
  exists -- yes --> valid{Is it still valid?}
  valid -- no --> expired[It is reported as expired]
  valid -- yes --> applied[It is applied to the subtotal]
```

- `{ }` a decision · `[ ]` an outcome · `([ ])` the entry point
- **`TD` by default** — a decision tree reads downwards.
- Every branch is labelled and **every path ends somewhere**. A decision with one exit is not
  a decision.

**Every decision cites the rule that governs it**, in the prose above the picture, by slug —
never inside the nodes, which would put spec text in two places. A decision you cannot trace
to a rule is behavior nobody specified.

It never draws **who** does it (by construction), **technical steps** — a query, a retry, a
transaction, which belong to the sequence or to prose — or **the screen and its messages**,
which are the spec's and the screen design's.

## Done when

Rehearse it: could the implementer follow the picture step by step without asking who does
what or what happens when it fails?

- `sequence`: one flow, seven participants or fewer, all of them components, actors or
  stores, and only the failure that changes the outcome.
- `state`: eight states of one entity, initial and end states explicit, every transition
  labelled with its cause, no technical flags.
- `flow`: no *who* to show, eight nodes or fewer, every branch labelled and ended, and the
  prose cites the rule slugs.
- No label states a rule the spec does not carry.
