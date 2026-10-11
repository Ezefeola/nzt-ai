# Frontend rendering performance

**Most components never need this.** A page, a dialog or a form renders once and then only when
someone does something: optimising it costs readability and buys nothing measurable.

There are exactly three cases where it matters: a component that **repeats at scale**, an event
that **fires many times per second**, and a cheap-looking change that **rerenders a large
subtree**.

> **Measure before and after.** Optimising by intuition here reliably makes the code harder to
> read and no faster.

The number the user actually waits for, and the requirement it is measured against, come from
`nzt-verify-performance`. This reference is what you do **after** that measurement located the
cost in the render.

## What actually causes a rerender

When a component rerenders, it hands its children their inputs again, and each child rerenders
if its inputs *may* have changed — **that recursion is what makes an event on a high-level
component expensive.** A simple value that did not change is usually recognised as unchanged; an
object, a collection or a piece of markup often is not, whatever its contents.

- **Passing the identifier a child needs instead of the whole object** stops the recursion and
  costs nothing.
- **Skipping the render of an expensive subtree whose inputs did not change**, or of a component
  that never changes after its first render, is the second tool — only there.

## Large lists: paging or virtualisation, chosen on evidence

Virtualisation renders only what is in the viewport and keeps the scroll behaviour of the whole
list. **Paging can be the better answer**, and virtualisation is not forced onto every list:
item sizing, the scroll container and keyboard focus all have to survive it.

**A provider of rows honours start, count and its cancellation, returns the matching total and
never fetches every row to render a viewport.**

## Instances and inputs are not free

For many repeated instances, **measure before and after** each of these:

- **Inline it into its parent** instead of making it a component. What is lost is the ability to
  rerender that row on its own, which a row inside a grid rarely needs.
- **If the component existed only to reuse markup, reuse the markup without a component.**
- **Bundle what is common to every instance into one object** and keep what differs simple —
  weighing that the bundle may be treated as changed anyway. **It is a trade, not an automatic
  improvement.**
- **A value shared down the whole tree costs more than a plain input** when every recipient
  subscribes to its changes; marking it as never changing is right **only where recipients need
  no notification**.
- **A new function per item, built inside a loop, is rebuilt on every render.** A stable key
  preserves identity but does not prevent that allocation.

Cost depends on content, runtime and hardware: **profile a representative published build**, and
never quote a sample timing as a constant.

## Events that fire tens of times per second

Pointer moves and scrolling fire far more often than any UI needs to update: **throttle when a
measurement justifies it**, as close to the source as the host allows. **Search and API calls are
debounced, with cancellation, and a stale response never replaces a newer one.**

## Changing when the framework renders is the last resort

Taking over the framework's own decision to render — after an event, or when inputs arrive — is
**the last resort, not the first**: it changes the behaviour of every handler in the component,
and **a missing render is a much harder bug to find than a slow one.** Error handling has to be
preserved when it is done. **And nothing here applies to a component that renders once.**

## Closing checklist

- [ ] The optimisation answers a **measured** problem, compared before and after on a published
      build with representative data.
- [ ] Children receive identifiers and primitives where possible, not whole objects.
- [ ] A large list uses paging or virtualisation chosen on evidence, with its provider honouring
      start, count, token and total.
- [ ] Shared values marked as never changing only where recipients need no notification.
- [ ] High-frequency callbacks are throttled or debounced, with cancellation and no stale result.
- [ ] Any override of when the framework renders is justified and preserves rendering and error
      handling.
- [ ] Nothing was optimised in a component that renders once.
