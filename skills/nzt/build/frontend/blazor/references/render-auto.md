# Interactive Auto

The component **runs on whichever host is ready**. On the first visit, while the WebAssembly
runtime downloads, it runs **on the server** so the screen is usable immediately; once the
runtime is cached, **later visits run in the browser**.

How a component is written does not change — that is
`nzt-build-frontend-blazor-components`. This is only what having two possible hosts changes.

## What it does not do

**It does not move a running component from one host to the other.** The host is chosen when the
component starts; a screen that began on the server finishes there. The switch shows up on the
**next** visit, not in the middle of this one.

So there is no moment to handle, no event to subscribe to and nothing to migrate. What there is
is a component that **must be correct in both places**.

## The strictest of the two always applies

- **No server-only service and no database, ever** — in the browser they do not exist. Every
  call goes through the typed client.
- **No secret, no key, no privileged rule**: it may end up downloaded to the browser.
- **Nothing synchronous that waits.** On WebAssembly it freezes the page.
- **No assumption about latency in either direction.** On the server every interaction is a
  round trip; in the browser the calls to the API are.

On .NET 10, `RendererInfo.Name` and `RendererInfo.IsInteractive` say where the code is executing
now; **`AssignedRenderMode` is the assigned mode, not the current host** — confusing the two is
how a check passes on the visit that does not matter.

## Register on both hosts, with the lifetime the service deserves

| Where | How |
|---|---|
| server user state | scoped, **never a singleton shared across users** |
| ordinary browser services | the app's normal lifetime — **auto does not make everything a singleton** |
| a service with prerendered persistent state | scoped on the server with `RegisterPersistentService<T>(RenderMode.InteractiveAuto)`, **singleton in `.Client`** so restoration and injection resolve the same instance |

And the mirror image: **a service registered only on the browser side fails during
prerendering**, because prerendering runs on the server, where it does not exist.

## A component cannot change the mode of its children

**A component of one interactive mode cannot be a child of a component of another.** Separate
interactive roots can coexist under a static parent, but **parameters crossing the
static-to-interactive boundary must be serialisable** — a delegate or a `RenderFragment` cannot
cross, and a cascading value does not cross by itself.

## Where the component lives is not free

An auto component has to be in the part of the solution the browser can download. **Which
project that is comes from the architecture skill**; what matters here is that putting it on the
server side **silently takes the mode away**.

## Prerendering

When prerendering or persistent state is involved, load
`nzt-build-frontend-blazor-prerendering` and apply it with both hosts in mind. Do not load
another render-mode skill just for prerendering.

## Closing checklist

- [ ] Everything injected exists on **both** hosts, with the lifetime its purpose asks for —
      including the client singleton for a persistent service.
- [ ] **No server-only service, no database, no secret**: the browser is a possible destination.
- [ ] Nothing synchronous that waits.
- [ ] The component sits in the project the browser can download, and **no child of it uses a
      different interactive mode**; boundary parameters are serialisable.
- [ ] Execution checks use `RendererInfo`, not the assigned mode.
- [ ] `@rendermode InteractiveAuto` on the component that needs interactivity.
- [ ] The first visit **and** a cached browser execution were both exercised, with restored and
      absent state.
