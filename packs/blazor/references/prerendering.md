# Blazor prerendering and initial state

Builds on `../nzt-frontend/references/rendering.md`, *A server pass before the interactive one* —
read it first. Read with the render-mode file `tech.md` selected.

There is no server pass in standalone WebAssembly or with prerendering off; interactive routing
normally skips it, while enhanced navigation to a static page still renders on the server.

## Rules

1. **Persist the initial read** — on the targeted .NET version, `[PersistentState]` on a public
   property, filled during initialisation only when `null`. The project's version decides the
   API; it is never upgraded to match an example.
2. Browser storage and DOM JavaScript after the first interactive render, guarded by
   `firstRender`.
3. **Who can read the transfer**: Interactive Server's is protected by the framework (persist
   only what the screen needs); WebAssembly and auto state reach the browser and are visible to
   that user.
4. **A persistent service** is scoped on the server with `RegisterPersistentService<T>` for the
   adopted mode, and **singleton in `.Client`**, so restoration and injection resolve the same
   instance — that does not make every browser service a singleton.
5. `[StreamRendering]` sends a placeholder first, the result after.

## Done when

A full load, an interactive navigation and a changed key were exercised on the hosts this
project uses, with restored and absent state.
