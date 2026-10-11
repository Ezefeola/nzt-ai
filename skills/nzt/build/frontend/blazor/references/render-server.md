# Interactive Server

**Read `../nzt-build/references/frontend-rendering.md` first** — *Interactive on the server*.
It holds the round trip per interaction, every user's state in server memory, the dropped
connection and why server-side does not mean data-side. This file holds only what is Blazor.

How a component is written does not change — that is
`nzt-build-frontend-blazor-components`. This is only what the host changes.

## Every user's state lives in the circuit

**User state is scoped to the circuit, never a singleton shared across users.**

## The connection can drop

A retained circuit **can** reconnect with its state — but that is not a guarantee.

.NET 10 circuit persistence can retain explicitly serialisable state for pause and resume. It
**does not serialise the component tree and does not replace saving anything durable**; adopt it
only when the agreed state strategy asks for it.

## The trap: server-side does not mean data-side

A screen that queries the database directly silently makes that component unmovable to any
other render mode.

## Prerendering

When prerendering or persistent state is involved, load
`nzt-build-frontend-blazor-prerendering` and apply it with this host's boundaries. **Do not load
another render-mode skill just for prerendering.**

## Closing checklist

- [ ] Reconnection and loss are handled and were actually exercised — temporary drop, expired
      circuit, full reload.
- [ ] Nothing with a side effect in initialisation, which can run twice when prerendering is on.
- [ ] `@rendermode InteractiveServer` sits on the component that needs interactivity, not
      sprinkled over the ones that do not, and **no child of it uses a different interactive
      mode**.
