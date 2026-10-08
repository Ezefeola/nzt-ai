---
name: nzt-build-frontend-blazor
description: Use when the component's stack selects Blazor for the frontend, before writing or changing a component, a form or a screen: the table that turns each stack axis into the one skill to load.
---

# Frontend on Blazor — selection by stack axis

This router loads nothing by itself. It reads the component's stack document and turns each
axis into **the one reference** that axis selected. Paths are relative to this skill's folder.
**Read the file before acting on the row** — the row is not the guidance, the file is.

If you did not arrive here from `nzt-build`, load it first.

## Read the stack first

`<component folder>/Docs/Architecture/frontend-stack.md` decides every row below — the folder
is the one `Docs/Architecture/architecture.md` names. Read it before loading anything, and
before choosing a technology or a pattern.

- **An installed folder is not an authorisation.** This whole tree is installed in every
  project, including the ones that are not Blazor. What makes it apply is the stack document,
  and nothing else.
- **A missing technical fact is checked in the project, not invented**: the manifest, the
  entry point, the components already there.
- **Version-dependent APIs need local evidence** — `TargetFramework`, the package version, the
  SDK pin. **When the stack document and the manifest disagree, the manifest wins** and the
  discrepancy is reported. A version is never bumped to make an example from a skill compile:
  that is a stack change and goes through the stack door.
- **Component organisation is a stack axis too** — `inline` or `code-behind`. The components
  skill applies whichever is written there. If the stack does not say and the existing
  components clearly do, that convention wins and gets recorded; otherwise it is a question,
  answered once and written in the stack.

## Required guidance

Load `nzt-build-csharp` before applying any row here, and read its `references/dtos.md`
(`../nzt-build-csharp/references/dtos.md`) when a typed client's DTOs are involved. **Reuse what is already loaded: this table is a selection, not an
order to read every line.** A real task reads three or four.

**The UI documents decide what the screen looks like, not this tree**: `Docs/UX/design-system.md`
for visual work, states and wording, `Docs/UX/ui-components.md` before adding a shared component.
**Reuse the component library the stack adopted before writing a custom component.**

## Exclusive axes — read only what the stack selected

| Axis | The stack says | Read | Read with |
|---|---|---|---|
| Architecture | `vertical-slice` | `references/architecture-vertical-slice.md` | — |
| Render mode | `server` | `references/render-server.md` | `references/components.md` |
| | `webassembly` | `references/render-webassembly.md` | `references/components.md` |
| | `auto` | `references/render-auto.md` | `references/components.md` |
| | `static` | `references/render-static.md` | `references/components.md`, and `references/forms.md` when the page posts |

**A render-mode reference is read only when the work touches rendering behaviour.** A copy
change inside an established component does not need one.

**Architecture has one alternative here, and that is a fact about this set, not about Blazor.**
A stack naming another concept for the frontend is a gap in the stack document: say so and
resolve it there, do not improvise a layout.

## Rows the task selects

| The work touches | Read | Read with |
|---|---|---|
| A component or a screen: parameters, lifecycle, injection, the typed client, the three states | `references/components.md` | — |
| A form, its validation or its submission | `references/forms.md` | `references/components.md` |
| Prerendered state, initial state transfer, persistent services | `references/prerendering.md` | the render-mode reference the stack selected |
| Lists, grids, components repeated at scale, high-frequency events — after a measurement | `references/performance.md` | `references/components.md` |

Wherever a file names `nzt-build-frontend-blazor-<name>`, it means `references/<name>.md` in
this folder (`nzt-build-frontend-blazor-render-auto` → `references/render-auto.md`): read that
file — it is not a skill.

## Two escapes, and they are not the same

- **A small edit in an established place follows the convention next to it**, without reloading
  guidance. The scale rule of the kernel applies inside a phase too.
- **Code this project does not document is written the way that code is written.** This set is
  installed globally and will see repositories that are not its own: **your conventions step
  aside there**, and the difference is reported rather than applied.

## Three confusions that cost the most

- **The render mode and prerendering are two things.** The mode says where the component runs;
  prerendering says a server pass may also have run. Interactive modes can have it, standalone
  WebAssembly does not, and code that assumes two initialisations is wrong in both directions.
- **`AuthorizeView` hides, it does not protect.** It controls what the screen shows; whether the
  operation may run is decided by the backend
  (`../nzt-build-backend-dotnet/references/security.md`). A hidden button is not a permission.
- **A screen never talks to the network itself.** Every call goes through its feature's typed
  client, which returns the same result shape the backend answers with. A component that holds
  an `HttpClient` is the boundary already broken.

## Closing checklist

- [ ] Every row read was selected by the stack document, not by preference.
- [ ] No two rows of the same axis were read, and the render-mode reference was read only
      because the work touches rendering.
- [ ] Versions used came from the manifest, and any disagreement with the stack was reported.
- [ ] The design system and the component inventory were read before anything visual or shared.
- [ ] The stack document was updated in this unit if the work changed what it declares.
