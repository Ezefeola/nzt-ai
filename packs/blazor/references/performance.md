# Blazor rendering performance

Builds on `../nzt-frontend/references/performance.md` — read it first. This file holds only what
is Blazor.

## Rules

1. **Change detection**: a rerendering parent hands every child its parameters again.
   Immutable ones (`string`, `int`, `bool`, `DateTime`) unchanged are skipped; a model, a
   collection or a `RenderFragment` may count as changed whatever it holds.
2. **`ShouldRender` returns `false`** only for an expensive subtree with unchanged inputs, or a
   component that never changes after its first render.
3. **`Virtualize`** for large lists; its `ItemsProvider` honours start, count and the token,
   returns the total, and never fetches every row.
4. **Markup reused without behaviour is a `RenderFragment`**, not a component.
5. **`[CascadingParameter]` costs far more than a parameter** — every recipient subscribes.
   `IsFixed="true"` only where no recipient needs notification (cascading `this` alone is no
   reason). With many recipients this is one of the largest wins.
6. **Cheap once, expensive at scale**: `CaptureUnmatchedValues` splatting in a grid cell, and
   `@onclick="@(e => Do(item))"` in a loop (every delegate rebuilt per render; `@key` does not
   prevent it). Address them where measured.
7. **On Server, throttle `onmousemove`/`onscroll` in JS** — that is what cuts circuit traffic.
8. **Every handler rerenders, even one that changed nothing.** `IHandleEvent` removes that — the
   last resort, preserving error propagation to the error boundary. A `SetParametersAsync`
   override is the same kind of exception: profiled and tested.

## Done when

Each override (`ShouldRender`, `IsFixed`, `IHandleEvent`, `SetParametersAsync`) answers a
measurement and keeps rendering and error handling intact.
