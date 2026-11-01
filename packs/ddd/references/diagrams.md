# The context map and the aggregate map

The two diagrams that draw the **business**, not the solution. `nzt-architecture`'s
`references/diagrams.md` decides whether one is earned and holds the shared rules; these add
their own.

## `bounded-contexts` — who adapts to whom

In `Docs/Domain/context-map.md`, earned whenever that file exists. **At most eight contexts**:
past that the contexts are probably folders — go back to the conversation.

```
flowchart LR
  sales[Sales · core]
  stock[Stock · supporting]
  payments{{Payments · generic}}

  sales -- "confirmed order · customer/supplier" --> stock
  stock -- "charge · anticorruption layer" --> payments
```

1. `[ ]` our context, `{{ }}` a third party's; **the type in the label** after a middle dot.
2. **The arrow runs upstream to downstream** — from who sets the language to who adapts. Never
   a call: a downstream context often calls upstream, and drawing calls hides who changes.
3. **Every label carries what travels and the pattern** (`context-map.md`'s names). No bare
   arrows.
4. **Nodes are contexts only** — never a component, service, database, actor, entity, term,
   module, team or folder.

## `aggregates` — what is true at the same instant

In `Docs/Domain/domain-model.md`, earned with **three aggregates or more**. **At most six**:
past that, one per context.

```
flowchart LR
  subgraph order[Order · root]
    line[OrderLine]
  end
  customer[Customer · root]

  order -. CustomerId .-> customer
```

1. **A box is an aggregate naming its root** (`· root`); a `subgraph` only with child entities
   inside — a single entity is a plain node.
2. **A dashed arrow is a reference by id**, labelled with the id only, **leaving from the box**,
   never from an entity inside it.
3. Inside a box: consistent at the same instant. A dashed arrow: consistent eventually — what
   the user sees meanwhile is a question for the feature design, not the drawing.
4. **Never**: fields, cardinalities, value objects, tables, keys, joins, or an arrow between
   children of different boxes. Names from `domain-model.md` and the glossary.

## Done when

The user could read each picture aloud and say whether it is true: every node and arrow
follows its list, within its limit, with a sentence above saying what its lines mean.
