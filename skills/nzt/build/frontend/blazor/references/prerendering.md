# Prerendering and initial state

With prerendering on, a full page load can create **a server-rendered instance and an
interactive one**, and initialisation can run in both. Standalone WebAssembly and components
with prerendering disabled have no server pass; interactive routing normally skips it, while
enhanced navigation to a static page still renders on the server.

> **Never rely on initialisation running exactly once — nor on it running twice.**

## Preserve the initial read

**Persist what prerendering produced instead of fetching it twice.** On the .NET version this
project targets, that is `[PersistentState]` on a public property, filled during initialisation
**only when it is null**. Handle both cases — absent and restored — and **refresh the data when
the route or query key it depends on changes.**

**The project's version decides the API; it is never upgraded to match an example here.**

**Nothing with a side effect belongs in initialisation.** Browser storage and DOM-dependent
JavaScript belong after the first interactive render, guarded by `firstRender`: during
prerendering they do not exist.

## What crosses to the browser, and who can read it

- **Interactive Server transfer is protected by the framework** — persist only what the screen
  needs anyway.
- **WebAssembly and auto state reach the browser and are visible to that user.** **No secret,
  and nothing they may not inspect**, ever goes into persisted state.
- **Register dependencies on every host that executes the component**, the prerender host
  included.
- For a **persistent service**: scoped registration on the server with
  `RegisterPersistentService<T>` for the adopted render mode, and **singleton in `.Client`**, so
  restoration and injection resolve the same instance. **That requirement is about restoration —
  it does not make every browser service a singleton.**

## Streaming

Without streaming, **prerendering waits for the tree to settle** before sending anything, so a
slow load delays the whole page. `[StreamRendering]` sends a placeholder first and the result
after — **and a loading branch on its own does not skip that wait.**

When the interactive instance would repeat the read, pair streaming with persistence.

## Closing checklist

- [ ] What initialisation loads is **persisted, not fetched twice**, and filled only when absent.
- [ ] Absent state and restored state both render correctly, and a changed route or query key
      refreshes the data.
- [ ] No side effect in initialisation; browser storage and JS only after the first interactive
      render.
- [ ] **Nothing persisted is a secret or data this user may not inspect.**
- [ ] Dependencies resolve on every host that runs the component, prerender host included, and a
      persistent service is scoped on the server and singleton in `.Client`.
- [ ] A full load, an interactive navigation and a changed key were all exercised on the hosts
      this project actually uses.
