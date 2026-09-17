---
name: nzt-architecture-diagrams-components
description: Use when drawing the product's perimeter with its actors and third parties, or the map of its components with what travels on each arrow.
---

# The context diagram and the component map

The two pictures of the solution's shape. `context` draws the product as one closed box with
everyone who talks to it; `components` opens that box into who does what.

Load `nzt-architecture` and `nzt-architecture-diagrams` before applying this.

## `context` — the perimeter

The highest-altitude diagram, and there is one per product, in `Docs/architecture.md`. It
answers in ten seconds, for someone who has never seen the system: **who uses this, and what
does it talk to?**

> **The box is never opened.** What is inside is the component map.

**It earns its place when it is useful, and that is not always.** With several third parties
and more than one kind of user it is the only view where the whole perimeter is visible at
once. With no third party and one obvious user it comes out as a stick figure pointing at a
box, which says less than the document's first sentence — and then it is not drawn.

**The limit is eight** around the box, actors and third parties together. Past eight, group
the ones that play the same role — *three couriers*, not three boxes — and name them in
prose.

```
flowchart LR
  customer([Customer])
  agent([Support agent])
  product[Orders]
  billing{{Billing}}
  payments{{Payment gateway}}

  customer -- places orders --> product
  agent -- resolves claims --> product
  product -- confirmed orders --> billing
  product -- charges --> payments
```

- The product is **one node**, whatever it is made of. The moment two boxes of yours appear,
  this stopped being a context diagram.
- **Actors are roles**, the ones the glossary defines and the criteria already use. Never a
  person's name, never a job title the product does not know about, and never *"the user"*
  when the product tells two kinds apart.
- **A third party appears only if data actually crosses.** Not because the company pays for
  it. What travels goes on the arrow, in ubiquitous language; the contract belongs to the
  external systems table and is never transcribed into the picture.

## `components` — the map

Who does what and what crosses between them. It lives in `Docs/architecture.md` at product
scope, and in a feature design at feature scope — where **only the participants of that
feature** are drawn.

**The limit is eight nodes.** Past eight it is two diagrams, cut by a boundary that already
exists, never by cramming. A map is denser than a sequence and reads worse, which is why the
number is low.

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

- `[ ]` a component · `[( )]` a store · `{{ }}` a third party · `([ ])` an actor
- **`LR` by default.** Vertical only when the product is a chain with no branching, where it
  reads better.

### An arrow says what travels

Not *uses*, not *calls*, not *talks to* — those three labels add nothing. The arrow carries
**what crosses it**, in ubiquitous language: *the coupon code*, *the discount applied*, *the
units taken*.

A bare arrow is allowed only when it is obvious and unambiguous, such as an actor opening a
screen. Everywhere else, if you cannot name what travels, **the design has a hole and that
is a question, not a drawing problem**.

### A responsibility may be a node; anatomy may not

A responsibility earns a node when one component holds two worth telling apart — *coupon
validation* separate from *total calculation*. What may never appear is the inside of a
component: its projects, its layers, its folders.

## What the map is not

- **It is not the component table.** What each one owns and which areas it has live in
  `Docs/architecture.md`'s table; repeating them in the picture creates a second original.
- **It is not a deployment diagram.** Where each component runs is operation, and it goes in
  prose or in `Docs/deployment.md`.
- **It does not draw order.** What happens first is the sequence's job. An arrow here means
  *talks to*, never *then*.

## Done when

Rehearse it: could someone who has never seen the repository name the pieces and say what
crosses between them, from the picture and its sentence alone?

- `context` was earned — there are third parties or more than one kind of actor — and the
  product is one node.
- At feature scope, only that feature's participants are drawn.
- Eight or fewer, in both pictures.
- Every arrow says what travels, or is obvious by construction.
- No node is a project, a layer, a folder, a class or a pattern.
- Nothing from the component table was repeated in the picture.
