---
name: nzt-build-frontend-blazor
description: Use when the component's stack selects Blazor for the frontend, before writing or changing a component, a form or a screen: the table that turns each stack axis into the one skill to load.
---

# Frontend on Blazor — selection by stack axis

This router loads nothing by itself. It reads the component's stack document and turns each
axis into **the one skill** that axis selected.

If you did not arrive here from `nzt-build`, load it first.

## Read the stack first

`Docs/frontend-stack-<component>.md` decides every row below. Read it before loading anything,
and before choosing a technology or a pattern.

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

Load `nzt-build-csharp` before applying any row here, and `nzt-build-csharp-dtos` when a typed
client's DTOs are involved. **Reuse what is already loaded: this table is a selection, not an
order to load every line.** A real task loads three or four.

**The UI documents decide what the screen looks like, not this tree**: `Docs/design-system.md`
for visual work, states and wording, `Docs/ui-components.md` before adding a shared component.
**Reuse the component library the stack adopted before writing a custom component.**

## Exclusive axes — load only what the stack selected

| Axis | The stack says | Load |
|---|---|---|
| Architecture | `vertical-slice` | `nzt-build-frontend-blazor-architecture-vertical-slice` |
| Render mode | `server` | `nzt-build-frontend-blazor-render-server` |
| | `webassembly` | `nzt-build-frontend-blazor-render-webassembly` |
| | `auto` | `nzt-build-frontend-blazor-render-auto` |
| | `static` | `nzt-build-frontend-blazor-render-static` |

**A render-mode skill is loaded only when the work touches rendering behaviour.** A copy change
inside an established component does not need one.

**Architecture has one alternative here, and that is a fact about this set, not about Blazor.**
A stack naming another concept for the frontend is a gap in the stack document: say so and
resolve it there, do not improvise a layout.

## Rows the task selects

| The work touches | Load |
|---|---|
| A component: parameters, lifecycle, injection, the typed client, the three states | `nzt-build-frontend-blazor-components` |
| A form, its validation or its submission | `nzt-build-frontend-blazor-forms` |
| Prerendered state, initial state transfer, persistent services | `nzt-build-frontend-blazor-prerendering` |
| Lists, grids, components repeated at scale, high-frequency events | `nzt-build-frontend-blazor-performance` |

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
  (`nzt-build-backend-dotnet-security`). A hidden button is not a permission.
- **A screen never talks to the network itself.** Every call goes through its feature's typed
  client, which returns the same result shape the backend answers with. A component that holds
  an `HttpClient` is the boundary already broken.

## Closing checklist

- [ ] Every row loaded was selected by the stack document, not by preference.
- [ ] No two rows of the same axis were loaded, and the render-mode skill was loaded only
      because the work touches rendering.
- [ ] Versions used came from the manifest, and any disagreement with the stack was reported.
- [ ] The design system and the component inventory were read before anything visual or shared.
- [ ] The stack document was updated in this unit if the work changed what it declares.
