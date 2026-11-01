# Frontend practices — selection by stack axis

For a frontend component with no area router, as `nzt-build` sends it here.
`frontend-stack.md` decides every row; paths are relative to `nzt-build`'s folder, and the
file is read before acting on its row.

## Exclusive axes — read only what the stack selected

| Axis | The stack says | Read | What it costs, when it is chosen |
|---|---|---|---|
| Architecture | `vertical-slice` | `references/frontend-architecture-vertical-slice.md` | one folder per feature, with its page and its typed client |

A stack that names another concept for the frontend is a gap in the stack document: say so and
resolve it there, do not improvise a layout.

## Rows the task selects

| The work touches | Read |
|---|---|
| A component or a screen: inputs, events, loading, the typed client, the three states | `references/frontend-components.md` |
| A form, its validation or its submission | `references/frontend-forms.md`, with `references/frontend-components.md` |
| Where the component runs, prerendering, initial state transfer — when the work touches rendering | `references/frontend-rendering.md` |
| Lists, grids, components repeated at scale, high-frequency events — after a measurement | `references/frontend-performance.md`, with `references/frontend-components.md` |
| A DTO a typed client sends or receives, or its mapping | `references/code-dtos.md` |
| A collection read, transformed or checked in memory | `references/code-collections.md` |
