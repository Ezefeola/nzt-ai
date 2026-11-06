# Diagrams — which one, and the shared rules

Decides which diagram is earned and holds the rules every one obeys. Drawing is
`diagrams-draw.md`.

## Offer, never assume

1. Offer it **while the document is planned**, in one line saying what it shows that prose
   cannot: *"without the sequence, the order of the six steps and who does each is read in
   prose"* — never *"do you want a diagram?"*.
2. Declined: not drawn, not asked again; the prose carries it.
3. An existing diagram is maintained with the change; deleting it is the user's call.

## The catalog

Closed. Packs may add their own (the `ddd` pack adds `bounded-contexts` and `aggregates`).

| Diagram | Answers | Lives in | Earned when |
|---|---|---|---|
| `context` | who uses the product, what it talks to | `architecture.md` | third parties or several kinds of actor |
| `components` | who does what, what crosses between them | `architecture.md`, a feature design | whenever either exists |
| `sequence` | in what order, who does each step | a feature design | one per flow that matters |
| `state` | which business states and legal transitions | a feature design | an entity with states |
| `flow` | what is decided, in what order | a feature design | branching entirely inside one component |

`sequence` is the default whenever there is more than one *who*; `flow` only when there is
none. `context` draws the product's perimeter as one closed box; it is never opened.

## Rules for every diagram

1. **Mermaid inline**, never an image: text is diffed, reviewed and updated with the document.
2. **A sentence above it** saying what to look at.
3. **Labels from the glossary and the component names** of `architecture.md`.
4. **Node limits are hard numbers** (in `diagrams-draw.md`): past one, it is two diagrams.
5. No colour that carries meaning without a legend.
6. **Never a node**: a project, layer, folder, namespace, class, file, method or pattern. If
   renaming a folder or changing architecture style would invalidate it, it is wrong.
7. Never drawn: an entity-relationship diagram, or the inside of a component.

## Done when

The reader can say what it is for before looking at it, and it survives a refactor that moves
every file.
