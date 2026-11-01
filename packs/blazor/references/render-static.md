# Static server rendering

Builds on `../nzt-frontend/references/rendering.md`, *Server-rendered, no interactivity* —
read it first. HTML per request with no live circuit or runtime; enhanced navigation still
works.

## Rules

1. **DOM events invoke no .NET handler.** A form POST runs a server handler in a new request:
   never describe it as interactivity.
2. **`OnAfterRender{Async}` never runs**: no timer-driven UI, no `StateHasChanged` loop.
   Initialisation and the parameter lifecycle do run.
3. **`[StreamRendering]` can send several updates**, still with no circuit.
4. **Test**, where they apply: a valid post, an invalid one, several forms on a page, enhanced
   navigation and a full reload.

## Done when

Every rule holds and the tests of rule 4 ran.
