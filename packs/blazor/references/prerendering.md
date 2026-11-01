# Blazor prerendering and initial state

Builds on `../nzt-frontend/references/rendering.md`, *A server pass before the interactive
one* — read it first, with the render-mode file `tech.md` selected.

There is no server pass in standalone WebAssembly or with prerendering off; interactive
routing normally skips it, while enhanced navigation to a static page still renders on the
server.

## Rules

1. **Persist the initial read with `[PersistentState]`** on a public property, filled during
   initialisation only when `null`. The project's .NET version decides the API; it is never
   upgraded to match an example.
2. **Who can read the transfer**: Interactive Server's is protected by the framework (persist
   only what the screen needs); WebAssembly and auto state reach the browser.
3. **A persistent service** is scoped on the server with `RegisterPersistentService<T>` for the
   adopted mode, and **singleton in `.Client`**, so restoration and injection resolve the same
   instance. That does not make every browser service a singleton.
4. **Test**: a full load, an interactive navigation and a changed key, on the hosts this
   project uses, with restored and absent state.

## Done when

Every rule holds and the tests of rule 4 ran.
