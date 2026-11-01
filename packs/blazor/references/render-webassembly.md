# Interactive WebAssembly

Builds on `../nzt-frontend/references/rendering.md`, *Interactive in the browser* — read it
first. Prerendering or persistent state: `prerendering.md` (standalone WebAssembly has no server
pass at all).

## Rules

1. **Startup downloads the runtime and client assets**: caching, trimming and lazy loading
   change the cost — measure; every package in the client project slows the first visit.
2. **One thread**: `.Result`, `.Wait()` or any synchronous wait freezes the page, and `Task.Run`
   does not make long work faster.
3. Browser storage and JavaScript after the first interactive render; dependencies resolve in
   the browser and in the prerender host when there is one.
4. **`@rendermode InteractiveWebAssembly` on the component that needs it**; no child of it uses
   another interactive mode.

## Done when

A cold load, interactive navigation, an unavailable API and restored state were exercised, and
nothing waits synchronously.
