# Drawing the diagrams

How each diagram of the catalog in `diagrams.md` is drawn, with its hard limit.

## `context` — at most 8 around the box

```
flowchart LR
  customer([Customer])
  product[Orders]
  billing{{Billing}}
  customer -- places orders --> product
  product -- confirmed orders --> billing
```

- The product is **one node**. Actors are the glossary's roles, never names or "the user"
  when the product tells two apart. A third party appears only if data crosses.
- Past 8, group same-role parties (*three couriers*) and name them in prose.

## `components` — at most 8 nodes

```
flowchart LR
  customer([Customer])
  checkout[checkout]
  billing[billing]
  orders[(Orders)]
  gateway{{Payment gateway}}
  customer --> checkout
  checkout -- coupon code --> billing
  billing -- discount applied --> checkout
  billing --> orders
  checkout -- charge --> gateway
```

- `[ ]` component · `[( )]` store · `{{ }}` third party · `([ ])` actor · `LR` by default.
- **An arrow says what travels**, never *uses* or *calls*. If you cannot name it, the design
  has a hole: that is a question.
- A responsibility may be a node when one component holds two worth telling apart. At
  feature scope, only that feature's participants. It does not repeat the component table,
  draw deployment, or show order.

## `sequence` — at most 7 participants

```
sequenceDiagram
  actor Customer
  participant checkout
  participant billing
  Customer->>checkout: enters the code
  checkout->>billing: asks to validate the coupon
  alt coupon valid
    billing-->>checkout: discount applied
  else expired
    billing-->>checkout: reason for the rejection
  end
  checkout-->>Customer: shows the total
```

- Participants are components, actors and stores. Time goes down.
- Only the failure that changes the outcome; two such failures are two diagrams. A self-call
  only when it is a decision worth naming.

## `state` — at most 8 states of one entity

```
stateDiagram-v2
  [*] --> pending
  pending --> paid: the payment clears
  pending --> cancelled: the customer cancels
  paid --> [*]
  cancelled --> [*]
```

- Initial and end states explicit. Business states only — a technical flag that wants in was
  a missing business state. Every transition carries its cause as an event; one you cannot
  label is a question.

## `flow` — at most 8 nodes, one component

```
flowchart TD
  start([A code is entered]) --> exists{Does the coupon exist?}
  exists -- no --> unknown[Reported as unknown]
  exists -- yes --> valid{Still valid?}
  valid -- no --> expired[Reported as expired]
  valid -- yes --> applied[Applied to the subtotal]
```

- `{ }` decision · `[ ]` outcome · `([ ])` entry · `TD`. Every branch labelled, every path
  ends. The prose above cites each decision's rule slug.
- A second participant appearing means it is a sequence. No technical steps, no screens.

**Every diagram**: a label stating something the spec does not say is new behavior — it goes
to `nzt-discovery`, not into the picture.

## Done when

The limit holds, every arrow or transition says what travels or causes it, and an implementer
can follow it without asking who does what.
