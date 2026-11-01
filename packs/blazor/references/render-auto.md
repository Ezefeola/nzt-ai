# Interactive Auto

Builds on `../nzt-frontend/references/rendering.md`, *Either place* — read it first.
Prerendering or persistent state: `prerendering.md`, with both hosts in mind.

The component **runs on whichever host is ready**: on the server during the first visit while
the runtime downloads, in the browser on later visits. **It never moves while running**: there
is nothing to handle mid-session.

## Rules

1. **Where it runs now is `RendererInfo.Name` / `RendererInfo.IsInteractive`** (.NET 10);
   `AssignedRenderMode` is the assignment, not the host.
2. **Register on both hosts with the lifetime the service deserves**:

   | Service | Registration |
   |---|---|
   | server user state | scoped — never a singleton across users |
   | ordinary browser services | the app's normal lifetime |
   | with prerendered persistent state | scoped on the server with `RegisterPersistentService<T>(RenderMode.InteractiveAuto)`, singleton in `.Client` |

3. **No child with another interactive mode.** Interactive roots can coexist under a static
   parent; a cascading value does not cross that boundary by itself.
4. **The component lives in `.Client`** (`architecture-vertical-slice.md`): on the server side
   the mode is silently lost.
5. **`@rendermode InteractiveAuto` on the component that needs it.**
6. **Test**: the first visit and a cached browser run, with restored and absent state.

## Done when

Every rule holds and the tests of rule 6 ran.
