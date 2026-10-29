---
name: nzt-build-frontend-blazor
description: Use when the component's stack selects Blazor for the frontend, before writing or changing a component, a form or a screen: the table that turns each stack axis into the one skill to load.
---

# Frontend on Blazor — selection by stack axis

This router loads nothing by itself. It reads the component's stack document and turns each
axis into **the one reference** that axis selected. Paths are relative to this skill's folder.
**Read the file before acting on the row** — the row is not the guidance, the file is.

`<component folder>/Docs/Architecture/frontend-stack.md` decides every row below, under
`nzt-build`'s *Read the stack first*. **Version-dependent APIs need local evidence** here:
`TargetFramework`, the package version in the manifest, the SDK pin in `global.json`; a missing
fact is read from the entry point and the components already there.

## Required guidance

Load `nzt-build-csharp` before applying any row here, and read
`../nzt-build/references/code-dtos.md` and then its `references/dtos.md`
(`../nzt-build-csharp/references/dtos.md`) when a typed client's DTOs are involved. **Reuse what is already loaded: this table is a selection, not an
order to read every line.** A real task reads three or four.

**The UI documents decide what the screen looks like, not this tree**: `Docs/UX/design-system.md`
for visual work, states and wording, `Docs/UX/ui-components.md` before adding a shared component.
The adopted component library comes first, as `frontend-components.md` says.

## Exclusive axes — read only what the stack selected

| Axis | The stack says | Read | Read with |
|---|---|---|---|
| Architecture | `vertical-slice` | `references/architecture-vertical-slice.md` | `../nzt-build/references/frontend-architecture-vertical-slice.md` — first, required |
| Render mode | `server` | `references/render-server.md` | `../nzt-build/references/frontend-rendering.md` — first, required; `../nzt-build/references/frontend-components.md`, `references/components.md` |
| | `webassembly` | `references/render-webassembly.md` | `../nzt-build/references/frontend-rendering.md` — first, required; `../nzt-build/references/frontend-components.md`, `references/components.md` |
| | `auto` | `references/render-auto.md` | `../nzt-build/references/frontend-rendering.md` — first, required; `../nzt-build/references/frontend-components.md`, `references/components.md` |
| | `static` | `references/render-static.md` | `../nzt-build/references/frontend-rendering.md` — first, required; `../nzt-build/references/frontend-components.md`, `references/components.md`, and `../nzt-build/references/frontend-forms.md` with `references/forms.md` when the page posts |
| Component organisation | `inline` | `references/components.md`, its `inline` rules | `../nzt-build/references/frontend-components.md` — first, required |
| | `code-behind` | `references/components.md`, its `code-behind` rules | `../nzt-build/references/frontend-components.md` — first, required |

**Component organisation is asked with the stack**, like every axis here: when the stack does
not say and the existing components clearly do, that convention is the answer and gets
recorded.

**A render-mode reference is read only when the work touches rendering behaviour.** A copy
change inside an established component does not need one.

**Architecture has one alternative here, and that is a fact about this set, not about Blazor.**
A stack naming another concept for the frontend is a gap in the stack document: say so and
resolve it there, do not improvise a layout.

## Rows the task selects

| The work touches | Read | Read with |
|---|---|---|
| A component or a screen: parameters, lifecycle, injection, the typed client, the three states | `references/components.md` | `../nzt-build/references/frontend-components.md` — first, required |
| A form, its validation or its submission | `references/forms.md` | `../nzt-build/references/frontend-forms.md` — first, required; `references/components.md`, `../nzt-build/references/frontend-components.md` |
| Prerendered state, initial state transfer, persistent services | `references/prerendering.md` | `../nzt-build/references/frontend-rendering.md` — first, required; the render-mode reference the stack selected |
| Lists, grids, components repeated at scale, high-frequency events — after a measurement | `references/performance.md` | `../nzt-build/references/frontend-performance.md` — first, required; `references/components.md` |

Wherever a file names `nzt-build-frontend-blazor-<name>`, it means `references/<name>.md` in
this folder (`nzt-build-frontend-blazor-render-auto` → `references/render-auto.md`): read that
file — it is not a skill.

## Three confusions that cost the most

- **The render mode and prerendering are two things** (`frontend-rendering.md`). Interactive
  modes can have a server pass; standalone WebAssembly does not.
- **`AuthorizeView` hides, it does not protect.** It controls what the screen shows; whether the
  operation may run is decided by the backend
  (`../nzt-build-backend-dotnet/references/security.md`). A hidden button is not a permission.
- **A component that holds an `HttpClient` is the boundary already broken**: every call goes
  through its feature's typed client (`frontend-components.md`).

## Done when

Every row read was selected by the stack document, never by preference, and no two of the
same axis; the render-mode reference was read only because the work touches rendering; the
versions used came from the manifest, and any disagreement with the stack was reported; the
design system and the component inventory were read before anything visual or shared.
