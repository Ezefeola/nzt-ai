---
name: nzt-frontend
description: Use when tech.md lists the frontend pack for the component, before writing or changing a screen, a component or a form - architecture, components, forms, rendering and performance, whatever the framework.
---

# Frontend — what holds in any framework

Load `nzt-code` first. A framework pack (`nzt-blazor`…) reads the matching file here first
and adds only how it is done there. What a screen looks like is the design system's, never
this pack's.

## Axes

| Axis | Value | Read | What it costs |
|---|---|---|---|
| Architecture | `vertical-slice` | `references/architecture-vertical-slice.md` | one folder per feature, with its page and its typed client |

Another value in `tech.md` is a gap there: never improvise a layout.

## References

| The work touches | Read | Read with |
|---|---|---|
| A component or screen: inputs, events, loading, the typed client, the three states | `references/components.md` | — |
| A form, its validation or its submission | `references/forms.md` | `references/components.md` |
| Where it runs, prerendering, initial state — only when the work changes rendering | `references/rendering.md` | — |
| Lists, grids, repeated components, frequent events — after a measurement | `references/performance.md` | `references/components.md` |

## Steps

1. Read the axis row, then the rows the task selects.
2. With a framework pack listed, read its matching file right after each one here.

## Done when

Every file read was selected by `tech.md` or by the task, and each file's *Done when* holds.
