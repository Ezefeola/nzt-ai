# Interactive Server

Prerendering or persistent state: `prerendering.md`.

## Rules

1. **A retained circuit may reconnect — not guaranteed.** .NET 10 circuit persistence keeps
   explicitly serialisable state for pause and resume; it does not serialise the component
   tree or replace durable saving. Adopt it only when the agreed state strategy asks.
2. **`@rendermode InteractiveServer` on the component that needs interactivity**, not
   sprinkled; no child of it uses another interactive mode.
3. **Test**: a temporary drop, an expired circuit and a full reload.

## Done when

Every rule holds and the tests of rule 3 ran.
