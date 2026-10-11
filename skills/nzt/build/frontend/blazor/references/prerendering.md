# Prerendering and initial state

**Read `../nzt-build/references/frontend-rendering.md` first** — its last section, *A server
pass before the interactive one*. It holds initialisation that can run twice or once,
persisting the initial read, no side effect in initialisation, what crosses to the browser and
streaming. This file holds only what is Blazor.

Standalone WebAssembly and components with prerendering disabled have no server pass;
interactive routing normally skips it, while enhanced navigation to a static page still renders
on the server.

## Preserve the initial read

On the .NET version this project targets, that is `[PersistentState]` on a public property,
filled during initialisation **only when it is null**.

**The project's version decides the API; it is never upgraded to match an example here.**

Browser storage and DOM-dependent JavaScript belong after the first interactive render, guarded
by `firstRender`.

## What crosses to the browser, and who can read it

- **Interactive Server transfer is protected by the framework** — persist only what the screen
  needs anyway.
- **WebAssembly and auto state reach the browser and are visible to that user.**
- For a **persistent service**: scoped registration on the server with
  `RegisterPersistentService<T>` for the adopted render mode, and **singleton in `.Client`**, so
  restoration and injection resolve the same instance. **That requirement is about restoration —
  it does not make every browser service a singleton.**

## Streaming

`[StreamRendering]` sends a placeholder first and the result after.

## Closing checklist

- [ ] A persistent service is scoped on the server and singleton in `.Client`.
- [ ] A full load, an interactive navigation and a changed key were all exercised on the hosts
      this project actually uses.
