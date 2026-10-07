---
name: nzt-architecture-diagrams
description: Use before drawing any diagram: which of the seven is earned, how it is offered, and the rules all of them obey.
---

# Diagrams — which one, and the rules all of them share

Decides **which diagram is earned** and carries the conventions every one of them obeys, so
no diagram skill repeats them. It draws nothing by itself.

If you did not arrive here from `nzt-architecture`, load it first.

## A diagram is offered, never assumed

Diagrams are an **offered** artifact: when the work reaches a document whose diagram is
earned, offer it in one line that says **what it shows the prose cannot** — and if the user
does not want it, it is not drawn, without asking twice.

- Offer it **while the document is being planned**, not after the text is written.
- Say what is lost. *"Sin el diagrama de secuencia, el orden de los seis pasos y quién hace
  cada uno se lee en prosa"* is answerable; *"¿querés un diagrama?"* is not.
- A declined diagram is not a gap: the prose carries the whole weight and the document
  closes without it.
- **A diagram that already exists is maintained with the change**, like any other document.
  Deleting it is the user's call, never a side effect of an edit.

## The catalog

Seven, and it is closed. A picture outside this table is not drawn.

| Diagram | Answers | Lives in | Earned when |
|---|---|---|---|
| `context` | who uses the product and what it talks to | `Docs/architecture.md` | there are third parties, or more than one kind of actor |
| `components` | who does what, and what crosses between them | `Docs/architecture.md`, a feature design | whenever either document exists — it is the map |
| `bounded-contexts` | how the business is cut, and who adapts to whom | `Docs/context-map.md` | whenever that file exists |
| `aggregates` | what has to be true at the same instant | `Docs/domain-model.md` | the domain axis is `ddd` **and** there are three aggregates or more |
| `sequence` | in what order it happens, and who does each step | a feature design | one per flow that matters, with the failure that changes the outcome |
| `state` | which business states exist and which transition is legal | a feature design | the feature has an entity with states |
| `flow` | what is decided, in what order | a feature design | the branching lives **entirely inside one component** |

Once a diagram is earned, load the skill that draws it: it carries the node limit and the
conventions of that picture.

| Load | To draw |
|---|---|
| `nzt-architecture-diagrams-components` | `context` and `components` |
| `nzt-architecture-diagrams-domain` | `bounded-contexts` and `aggregates` |
| `nzt-architecture-diagrams-behavior` | `sequence`, `state` and `flow` |

## `flow` or `sequence` — the boundary

> **The sequence shows the *who*. The flow hides it on purpose.**

A sequence draws the same branches **and** says which component does each step, which is
what a technical design exists to answer. So `sequence` is the default whenever there is
more than one *who*. `flow` earns its place in the single case where there is none:
branching that is pure business logic inside one component, where a sequence would be one
participant talking to itself.

## `context` or `bounded-contexts` — the boundary

> **`context` draws the perimeter of the product. `bounded-contexts` draws the cuts inside
> its meaning.**

The first puts actors and third parties around one closed box. The second has **no actors at
all**: it opens the box into boundaries of language. One picture holding both an actor and a
subdomain type is two diagrams stuck together.

## The rules every diagram obeys

- **Mermaid, inline in the markdown, never an image.** An image cannot be updated with the
  document, so it lies within months — worse than having no diagram. Being text, it also
  shows up in a diff and gets reviewed like any other line.
- **A sentence of prose above it, saying what to look at.** A diagram whose reader has to
  guess where the important part is has already failed.
- **Labels come from the ubiquitous language**: the glossary's terms and the component names
  `Docs/architecture.md` declares. Never a class, a method, a table or an endpoint.
- **The node limits are numbers, not judgement.** Each skill carries its own and they are
  hard: past the number it is two diagrams. A soft limit is evaluated by the same agent that
  wants everything in one picture.
- **No colour that carries meaning without a legend**, and no styling that only reads in one
  theme.
- **The test that matters:** can someone who has never seen the code understand it? If
  understanding the picture requires already knowing the answer, the diagram is wrong.

## What may never be a node

This is the rule that keeps a diagram from ageing into a lie. It holds for every diagram
that draws the **solution**; the two that draw the **business** — `bounded-contexts` and
`aggregates` — carry their own lists, because a context and an aggregate are not built
things.

| May be a node | Never |
|---|---|
| a component | a project, an assembly or a solution |
| a responsibility | a layer — `Application`, `Infrastructure` |
| a store | a folder or a namespace |
| a third party | a class, a file, a method |
| an actor | a pattern — `repository`, `use case` |

> **If renaming a folder, or moving from vertical slice to clean, would invalidate the
> diagram, the diagram is wrong.**

A correct diagram survives a structural refactor untouched, because it talks about
responsibilities and not about where they live. Where they live is the code's, and a
document that describes structure ends up contradicting it.

## The two that are never drawn

- **An entity-relationship diagram.** Fields, keys, cardinalities and indexes are code, and
  they are documented nowhere. `aggregates` is not the exception that reopens this: it draws
  consistency boundaries, and its own guidance lists what it may never contain.
- **The inside of a component** — its projects, layers or folders. That is the structure the
  rule above forbids.

## Done when

Rehearse it: could the reader say what the picture is for before looking at it, and would it
still be true after a refactor that moved every file?

- The diagram is one of the seven, and it was **earned**.
- It was **offered and kept**, or it is not there at all.
- Mermaid inline, with its sentence of prose above it.
- Every label comes from the glossary or from a declared component name.
- The node limit of its own skill holds; past it, the picture was split.
- No node is a project, a layer, a folder, a class or a pattern.
