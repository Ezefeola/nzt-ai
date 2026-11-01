# Static server rendering

Builds on `../nzt-frontend/references/rendering.md`, *Server-rendered, no interactivity* — read
it first. HTML per request with no live circuit or runtime; enhanced navigation still works.

## Rules

1. **DOM events invoke no .NET handler.** A form POST runs a server handler in a **new
   request** — not interactivity, and never described as such.
2. **`OnAfterRender{Async}` never runs**: no timer-driven UI, no `StateHasChanged` loop.
   Initialisation and the parameter lifecycle do run.
3. **Data loads in the initial lifecycle**, without side effects. `[StreamRendering]` shows early
   content for a slow read and can send several updates — still no circuit.
4. **The post is the interaction**: the component receives it, works through the typed client
   and renders the outcome. Every mechanic in `forms.md` applies — `FormName`,
   `[SupplyParameterFromForm]`, `??=`, antiforgery, `Enhance`.
5. **A screen needing live handlers** gets a proposed interactive boundary; a native control like
   `<details>` does not require one.

## Done when

A valid post, an invalid one, several forms on a page, enhanced navigation and a full reload were
exercised where they apply, with no claim of client-side validation.
