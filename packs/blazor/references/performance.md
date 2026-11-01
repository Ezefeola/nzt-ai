# Blazor rendering performance

Builds on `../nzt-frontend/references/performance.md` — read it first.

## Rules

1. **`[CascadingParameter]` costs far more than a parameter**: every recipient subscribes.
   `IsFixed="true"` only where no recipient needs notification (cascading `this` alone is no
   reason). With many recipients this is one of the largest wins.
2. **Cheap once, expensive at scale**: `CaptureUnmatchedValues` splatting in a grid cell, and
   `@onclick="@(e => Do(item))"` in a loop (every delegate rebuilt per render; `@key` does not
   prevent it). Address them where measured.
3. **On Server, throttle `onmousemove`/`onscroll` in JS**: that is what cuts circuit traffic.
4. **Every handler rerenders, even one that changed nothing.** `IHandleEvent` removes that —
   the last resort, preserving error propagation to the error boundary. A
   `SetParametersAsync` override is the same kind of exception: profiled and tested.

## Done when

Each override (`ShouldRender`, `IsFixed`, `IHandleEvent`, `SetParametersAsync`) answers a
measurement.
