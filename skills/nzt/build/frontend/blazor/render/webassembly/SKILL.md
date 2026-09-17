---
name: nzt-build-frontend-blazor-render-webassembly
description: Use when the stack selects WebAssembly rendering and the work touches rendering - the first visit pays for every dependency, one thread means blocking freezes the page, and everything shipped is public.
---

# Interactive WebAssembly

The component **runs in the browser**. No server holds its state and no interaction costs a
round trip: once loaded, the screen responds locally and only calls out for data.

How a component is written does not change — that is
`nzt-build-frontend-blazor-components`. This is only what the host changes.

Load `nzt-build-frontend-blazor` before applying this.

## The first visit pays for everything

Startup downloads the runtime and the client assets. Caching, trimming and deliberate lazy
loading change the cost, so **measure the published build with a cold cache** rather than
assuming every referenced assembly ships eagerly.

What that changes in the code: **every package added to the client project makes the first visit
slower for everyone**, and **a screen nobody visits still ships its code**. A dependency taken
for one screen is weighed against that.

## One thread, and blocking it freezes the page

There is no thread to fall back on. **`.Result`, `.Wait()` and any synchronous wait do not slow
the page down, they freeze it** — including the animation that was telling the user to wait.

**Long work does not get faster wrapped in `Task.Run`**: it runs in the same place. If something
takes long, it belongs on the server, behind the API.

## Everything in the browser is public

The user can read every byte the app downloaded: **there are no secrets here.** No key, no
connection string, no token that is not theirs, and no rule you would mind them reading.

**And nothing the browser sends can be trusted by the backend**, which validates it all again on
its side. A check done here is for the person using the screen, never for the system.

## Prerendering

When prerendering or persistent state is involved, load
`nzt-build-frontend-blazor-prerendering` and apply it with this host's boundaries. **Standalone
WebAssembly has no server pass at all**, so nothing may assume one. Do not load another
render-mode skill just for prerendering.

## Closing checklist

- [ ] No dependency added to the client project without weighing the download, measured on a
      published build with a cold cache.
- [ ] **Nothing synchronous that waits**: no `.Result`, no `.Wait()`, no `Task.Run` pretending
      to be a background thread.
- [ ] **No secret, no key, no privileged rule** in code that ships to the browser, and nothing
      persisted that this user may not read.
- [ ] Browser storage and JavaScript only after the first interactive render.
- [ ] Dependencies resolve in the browser **and** in the prerender host when there is one.
- [ ] `@rendermode InteractiveWebAssembly` on the component that needs interactivity, and **no
      child of it using a different interactive mode**.
- [ ] A cold load, interactive navigation, an unavailable API and restored state were all
      exercised.
