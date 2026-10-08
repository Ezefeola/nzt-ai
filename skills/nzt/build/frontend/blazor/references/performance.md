# Rendering performance

## Contents
- What actually causes a rerender
- Large lists: paging or virtualisation, chosen on evidence
- Instances and parameters are not free
- Cascading values
- Two things that are cheap once and expensive at scale
- Events that fire tens of times per second
- An event handler that changes nothing still rerenders
- Closing checklist

**Most components never need this.** A page, a dialog or a form renders once and then only when
someone does something: optimising it costs readability and buys nothing measurable.

There are exactly three cases where it matters: a component that **repeats at scale**, an event
that **fires many times per second**, and a cheap-looking change that **rerenders a large
subtree**.

> **Measure before and after.** Optimising by intuition here reliably makes the code harder to
> read and no faster.

The number the user actually waits for, and the requirement it is measured against, come from
`nzt-verify-performance`. This leaf is what you do **after** that measurement located the cost
in the render.

## What actually causes a rerender

When an event happens, the component that handled it rerenders and **hands every child a new
copy of its parameters**. Each child rerenders if its parameters *may* have changed — and that
recursion is what makes an event on a high-level component expensive.

| Parameter type | When the parent rerenders |
|---|---|
| immutable — `string`, `int`, `bool`, `DateTime` | **skipped** if the value did not change |
| a model, a collection, a `RenderFragment` | may be treated as changed, whatever the contents |

That table is the first tool: **passing the identifier a child needs instead of the whole
object** stops the recursion and costs nothing.

The second is **`ShouldRender`**, returning `false` where an expensive subtree's inputs did not
change, or for a component that never changes after its first render.

## Large lists: paging or virtualisation, chosen on evidence

`Virtualize` renders only what is in the viewport and keeps the scroll behaviour of the whole
list — a hundred thousand rows pay for the twenty that are visible. **Paging can be the better
answer**, and virtualisation is not forced onto every list: item sizing, the scroll container
and keyboard focus all have to survive it.

An `ItemsProvider` **honours start, count and its cancellation token, returns the matching total
and never fetches every row to render a viewport.**

## Instances and parameters are not free

For many repeated instances, **measure before and after** each of these:

- **Inline it into its parent** instead of making it a component. What is lost is the ability to
  rerender that row on its own, which a row inside a grid rarely needs.
- **If the component existed only to reuse markup, use a `RenderFragment`**: same markup, no
  per-component overhead.
- **Bundle what is common to every instance into one object** and keep what differs primitive —
  weighing that the bundle is a non-primitive parameter, so change detection may treat it as
  changed anyway. **It is a trade, not an automatic improvement.**

Cost depends on content, runtime and hardware: **profile a representative published build**, and
never quote a sample timing as a constant.

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

`onmousemove` and `onscroll` fire far more often than any UI needs to update: **throttle when a
measurement justifies it**, and on Server, throttling in JS is what actually reduces circuit
traffic. **Search and API calls are debounced, with cancellation, and a stale response never
replaces a newer one.**

## An event handler that changes nothing still rerenders

A component rerenders after **every** handler it runs, even one that changed no state.
Implementing `IHandleEvent` removes that automatic render — **and it is the last resort, not the
first**: it changes the behaviour of every handler in the component, and **a missing render is a
much harder bug to find than a slow one.** Error propagation to the error boundary has to be
preserved when event dispatch is customised.

A manual `SetParametersAsync` override is the same kind of exception: profiled, tested, never a
first step. **And nothing here applies to a component that renders once.**

## Closing checklist

- [ ] The optimisation answers a **measured** problem, compared before and after on a published
      build with representative data.
- [ ] Children receive identifiers and primitives where possible, not whole objects.
- [ ] `ShouldRender` only on subtrees that are expensive **and** unchanged.
- [ ] A large list uses paging or virtualisation chosen on evidence, with its provider honouring
      start, count, token and total.
- [ ] `IsFixed` only where recipients need no notification.
- [ ] Splatting and per-item delegates were addressed only where their cost was measured.
- [ ] High-frequency callbacks are throttled or debounced, with cancellation and no stale result.
- [ ] `IHandleEvent` and `SetParametersAsync` overrides, if any, are justified and preserve
      rendering and error handling.
- [ ] Nothing was optimised in a component that renders once.
