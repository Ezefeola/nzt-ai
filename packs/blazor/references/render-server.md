# Interactive Server

Builds on `../nzt-frontend/references/rendering.md`, *Interactive on the server* — read it
first. Prerendering or persistent state: `prerendering.md`.

## Rules

1. **User state is scoped to the circuit**, never a singleton shared across users.
2. **A retained circuit may reconnect — not guaranteed.** .NET 10 circuit persistence keeps
   explicitly serialisable state for pause and resume; it does not serialise the component tree
   or replace durable saving. Adopt it only when the agreed state strategy asks.
3. **No database from a component**: it would pin the component to this mode.
4. **`@rendermode InteractiveServer` on the component that needs interactivity**, not sprinkled;
   no child of it uses another interactive mode.

## Done when

A temporary drop, an expired circuit and a full reload were exercised, and initialisation has no
side effect.
