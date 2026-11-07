# Frontend rendering performance

**Most components never need this.** It matters in three cases: a component **repeated at
scale**, an event **firing many times per second**, a cheap change **rerendering a large
subtree**. The user-facing number comes from `nzt-verify`'s `references/performance.md`; this
is what you do after it located the cost in the render.

## Steps

1. **Measure before**, on a representative published build with representative data.
2. **Apply the cheapest tool that fits**:
   - **Pass a child the identifier, not the object**: objects, collections and markup often
     count as changed whatever their contents.
   - **Skip rendering** an expensive subtree with unchanged inputs, or a component that never
     changes after its first render — only there.
   - **Large list**: paging or virtualisation, chosen on evidence; sizing, scroll container and
     focus must survive it. A row provider honours start, count and cancellation, returns the
     total and never fetches every row for a viewport.
   - **Many instances**: inline a row into its parent; reuse markup without a component;
     bundle what every instance shares (the bundle may count as changed); mark a shared value
     as never changing only where no recipient needs notification; no new function per item
     inside a loop.
   - **High-frequency events**: throttle pointer and scroll near the source when measured;
     debounce search and API calls with cancellation, never letting a stale response replace
     a newer one.
   - **Taking over when the framework renders is the last resort**: a missing render is harder
     to find than a slow one, and error handling must survive it.
3. **Measure after.** Never quote a sample timing as a constant.

## Done when

Each optimisation answers a measured problem with a before and after.
