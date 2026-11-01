# Interactive Auto

Builds on `../nzt-frontend/references/rendering.md`, *Either place* — read it first.
Prerendering or persistent state: `prerendering.md`, with both hosts in mind.

The component **runs on whichever host is ready**: on the server during the first visit while
the runtime downloads, in the browser on later visits. **It never moves while running** — the
switch shows on the next visit, so there is nothing to handle mid-session.

## Rules

1. **Nothing synchronous that waits** (WebAssembly freezes); no server-only service, database or
   secret.
2. **Where it runs now is `RendererInfo.Name` / `RendererInfo.IsInteractive`** (.NET 10);
   `AssignedRenderMode` is the assignment, not the host.
3. **Register on both hosts with the lifetime the service deserves**:

   | Service | Registration |
   |---|---|
   | server user state | scoped — never a singleton across users |
   | ordinary browser services | the app's normal lifetime |
   | with prerendered persistent state | scoped on the server with `RegisterPersistentService<T>(RenderMode.InteractiveAuto)`, singleton in `.Client` |

   A service registered only on the browser side fails during prerendering.
4. **No child with another interactive mode.** Interactive roots can coexist under a static
   parent; parameters crossing that boundary are serialisable (no delegates or
   `RenderFragment`s; a cascading value does not cross by itself).
5. **The component lives in the project the browser downloads** (`architecture-vertical-slice.md`);
   on the server side the mode is silently lost. `@rendermode InteractiveAuto` on the component
   that needs it.

## Done when

The first visit and a cached browser run were both exercised with restored and absent state,
and every injected service resolves on both hosts.
