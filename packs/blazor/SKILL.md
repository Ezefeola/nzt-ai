---
name: nzt-blazor
description: Use when tech.md lists the blazor pack, before writing or changing a Blazor component, form or screen - render mode, component organisation, prerendering, forms and rendering performance.
---

# Frontend on Blazor

Load `nzt-frontend` and `nzt-csharp` first. Each file here names the generic file it builds
on: read that one first. Versions come from the project — `global.json`, `TargetFramework`,
the package manifest — and a missing fact from the entry point and the components there.

## Axes

`tech.md` names one value per axis; read only that row.

| Axis | Value | Read | What it costs |
|---|---|---|---|
| Architecture | `vertical-slice` | `references/architecture-vertical-slice.md` | as in `nzt-frontend` |
| Render mode | `server` | `references/render-server.md` | a round trip per interaction, every user's state in server memory |
| | `webassembly` | `references/render-webassembly.md` | the first visit downloads the runtime; everything in the browser is public |
| | `auto` | `references/render-auto.md` | fast first visit, then the browser; every component correct in both places |
| | `static` | `references/render-static.md` | no interactivity: every change is a request, a form posts the page |
| Component organisation | `inline` | `references/components.md`, its `inline` rules | markup and code in one `.razor` file |
| | `code-behind` | `references/components.md`, its `code-behind` rules | a `.razor` and a `.razor.cs` per component |

- **Read the render-mode file only when the work changes rendering.** A copy change in an
  established component does not need it.
- **Component organisation unanswered** while the existing components clearly follow one:
  that is the answer, and it goes into `tech.md`.

## References

| The work touches | Read |
|---|---|
| A component or screen: parameters, lifecycle, injection, the typed client, the three states | `references/components.md` |
| A form, its validation or its submission (with `static`, when the page posts) | `references/forms.md`, after `references/components.md` |
| Prerendered state, initial state transfer, persistent services | `references/prerendering.md`, with the render-mode file |
| Lists, grids, repeated components, frequent events — after a measurement | `references/performance.md` |

`AuthorizeView` hides; it does not protect. Whether the operation may run is the backend's.

## Done when

Every file read was selected by `tech.md` or by the task, never two of one axis, the
render-mode file only because rendering changed, and the versions came from the project.
