---
name: nzt-build-frontend-blazor-render-server
description: Use when the stack selects interactive server rendering and the work touches rendering - every interaction is a round trip, every user's state lives in server memory, and the connection can drop.
---

# Interactive Server

The component **runs on the server**. The browser holds the rendered HTML and a live connection;
an event travels to the server, which renders and sends back the difference.

How a component is written does not change — that is
`nzt-build-frontend-blazor-components`. This is only what the host changes.

Load `nzt-build-frontend-blazor` before applying this.

## Every interaction is a round trip

An event handler that runs on every keystroke is **one round trip per keystroke**. Filter and
search boxes **wait for the user to stop typing** before they call anything.

## Every user's state is in server memory

What a component keeps in fields is **multiplied by the number of people on that screen** — a
hundred rows per user is a hundred times a hundred rows, alive for as long as their connection
is. Large state does not live in component fields here.

**User state is scoped to the circuit, never a singleton shared across users.**

## The connection can drop

Interaction pauses, and a retained circuit **can** reconnect with its state — but that is not a
guarantee: expiry, a server restart or a full refresh end it. **Show reconnection and retry UI,
and test both recovery and loss.**

.NET 10 circuit persistence can retain explicitly serialisable state for pause and resume. It
**does not serialise the component tree and does not replace saving anything durable**; adopt it
only when the agreed state strategy asks for it.

## The trap: server-side does not mean data-side

Server-only services are technically reachable from here, and that is exactly the problem.
**The frontend reaches the product's backend through its typed client**, and that boundary holds
on this host too.

A screen that queries the database directly works, and it is **the single hardest thing to undo
later**: it silently makes that component unmovable to any other render mode.

## Prerendering

When prerendering or persistent state is involved, load
`nzt-build-frontend-blazor-prerendering` and apply it with this host's boundaries. **Do not load
another render-mode skill just for prerendering.**

## Closing checklist

- [ ] No handler that calls on every keystroke: input that filters or searches waits for the
      typing to stop.
- [ ] No large state in component fields, and no user state in a singleton.
- [ ] **Every backend call goes through the typed client**, host services included.
- [ ] Reconnection and loss are handled and were actually exercised — temporary drop, expired
      circuit, full reload.
- [ ] Nothing with a side effect in initialisation, which can run twice when prerendering is on.
- [ ] `@rendermode InteractiveServer` sits on the component that needs interactivity, not
      sprinkled over the ones that do not, and **no child of it uses a different interactive
      mode**.
