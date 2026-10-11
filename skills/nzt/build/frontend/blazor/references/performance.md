# Rendering performance

**Read `../nzt-build/references/frontend-performance.md` first.** It holds when this matters at
all, measuring before and after, what causes a rerender, paging or virtualisation on evidence,
what repeated instances cost, high-frequency events and why overriding the render is the last
resort. This file holds only what is Blazor.

## What actually causes a rerender

When an event happens, the component that handled it rerenders and **hands every child a new
copy of its parameters**. Each child rerenders if its parameters *may* have changed.

| Parameter type | When the parent rerenders |
|---|---|
| immutable — `string`, `int`, `bool`, `DateTime` | **skipped** if the value did not change |
| a model, a collection, a `RenderFragment` | may be treated as changed, whatever the contents |

**`ShouldRender`** returns `false` where an expensive subtree's inputs did not change, or for a
component that never changes after its first render.

## Large lists

`Virtualize` renders only what is in the viewport — a hundred thousand rows pay for the twenty
that are visible. An `ItemsProvider` **honours start, count and its cancellation token, returns
the matching total and never fetches every row to render a viewport.**

## Instances and parameters are not free

- **If the component existed only to reuse markup, use a `RenderFragment`**: same markup, no
  per-component overhead.
- The bundle of what is common to every instance is a non-primitive parameter, so change
  detection may treat it as changed anyway.

## Cascading values

**A `[CascadingParameter]` is substantially more expensive than a normal parameter**, because
every recipient subscribes to change notifications. `IsFixed="true"` is used **only where
recipients need no notification** — a stable reference can still hold changing state, so
cascading `this` is not on its own a reason. With many recipients this is one of the largest
wins available.

## Two things that are cheap once and expensive at scale

- **Attribute splatting.** `CaptureUnmatchedValues` makes the renderer match every supplied
  parameter against the known ones. Fine on a dialog; not in the cell of a grid.
- **A lambda per item.** `@onclick="@(e => Do(item))"` inside a loop **rebuilds every delegate on
  every render**. A stable `@key` preserves identity but does not prevent that allocation.

## Events that fire tens of times per second

`onmousemove` and `onscroll` are the usual ones. On Server, throttling in JS is what actually
reduces circuit traffic.

## An event handler that changes nothing still rerenders

A component rerenders after **every** handler it runs, even one that changed no state.
Implementing `IHandleEvent` removes that automatic render — it is the last resort the generic
reference describes, and **error propagation to the error boundary has to be preserved when
event dispatch is customised.**

A manual `SetParametersAsync` override is the same kind of exception: profiled, tested, never a
first step.

## Closing checklist

- [ ] `ShouldRender` only on subtrees that are expensive **and** unchanged.
- [ ] `IsFixed` only where recipients need no notification.
- [ ] Splatting and per-item delegates were addressed only where their cost was measured.
- [ ] `IHandleEvent` and `SetParametersAsync` overrides, if any, are justified and preserve
      rendering and error handling.
