# Interactive WebAssembly

**Read `../nzt-build/references/frontend-rendering.md` first** — *Interactive in the browser*.
It holds the first visit paying for everything, long work belonging on the server, everything in
the browser being public and the backend trusting nothing it sends. This file holds only what is
Blazor.

How a component is written does not change — that is
`nzt-build-frontend-blazor-components`. This is only what the host changes.

## The first visit pays for everything

Startup downloads the runtime and the client assets. Caching, trimming and deliberate lazy
loading change the cost, so measure rather than assuming every referenced assembly ships
eagerly. **Every package added to the client project makes the first visit slower for
everyone.**

## One thread, and blocking it freezes the page

There is no thread to fall back on. **`.Result`, `.Wait()` and any synchronous wait do not slow
the page down, they freeze it** — including the animation that was telling the user to wait.

**Long work does not get faster wrapped in `Task.Run`**: it runs in the same place.

## Prerendering

When prerendering or persistent state is involved, load
`nzt-build-frontend-blazor-prerendering` and apply it with this host's boundaries. **Standalone
WebAssembly has no server pass at all**, so nothing may assume one. Do not load another
render-mode skill just for prerendering.

## Closing checklist

- [ ] **Nothing synchronous that waits**: no `.Result`, no `.Wait()`, no `Task.Run` pretending
      to be a background thread.
- [ ] Browser storage and JavaScript only after the first interactive render.
- [ ] Dependencies resolve in the browser **and** in the prerender host when there is one.
- [ ] `@rendermode InteractiveWebAssembly` on the component that needs interactivity, and **no
      child of it using a different interactive mode**.
- [ ] A cold load, interactive navigation, an unavailable API and restored state were all
      exercised.
