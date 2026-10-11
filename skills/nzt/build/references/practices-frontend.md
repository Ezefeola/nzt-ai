# Frontend practices — selection by stack axis

For a frontend component whose stack has **no area router** in `nzt-build`'s table. A
component that has one goes there instead: that router reads these same generic references as
its *Read with*, so going through both reads them twice.

`<component folder>/Docs/Architecture/frontend-stack.md` decides every row below. Read it
first. Paths are relative to `nzt-build`'s folder. **Read the file before acting on the row** —
the row is not the guidance, the file is.

**The UI documents decide what the screen looks like, not this index**: `Docs/UX/design-system.md`
for visual work, states and wording, `Docs/UX/ui-components.md` before adding a shared component.

## Exclusive axes — read only what the stack selected

| Axis | The stack says | Read |
|---|---|---|
| Architecture | `vertical-slice` | `references/frontend-architecture-vertical-slice.md` |

A stack that names another concept for the frontend is a gap in the stack document: say so and
resolve it there, do not improvise a layout.

## Applying a generic reference to a technology

- **The generic reference says what holds and why; the stack document says how it is done in
  this technology.** Where the reference leaves a mechanism to the stack — how many units the
  frontend builds into, the entry point, how a registration is written — read it there.
- **A mechanism the stack document does not record is a gap in it**, not a free choice. Check
  the project's evidence first — the manifest, the code already there — and when the evidence
  does not settle it, ask once and write the answer in the stack.
- **How the technology behaves is verified in its authoritative source** before it enters the
  code (`nzt-research`). A generic reference names no API on purpose.
