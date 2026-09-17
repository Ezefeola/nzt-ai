---
name: nzt-build-frontend-blazor-components
description: Use when writing or changing a Blazor component - parameters in and events out, the lifecycle, the typed client that is the only way to the API, and the three states every screen that loads data has.
---

# Writing a Blazor component

A component is **a piece of screen plus the code that drives it**. Everything it needs to do it
does through a **typed client**; it never talks to the network itself and it never decides a
business rule.

**How the project is laid out belongs to the architecture skill, and how it renders to the
render-mode skill.** This is the component itself. A form has its own:
`nzt-build-frontend-blazor-forms`.

Load `nzt-build-frontend-blazor` before applying this.

## The file, and the order inside it

- **A component's file is named after the component**, and so is its type.
- **Inline or code-behind is the stack's decision**, not a line count: `inline` keeps the C# in
  `@code` at the end of the `.razor`; `code-behind` uses a `.razor.cs` partial with the same
  name and namespace. **Existing components are not reorganised outside the requested scope.**
- **`_Imports.razor` is the one exception to explicit usings** — Razor has no other way to share
  what every component needs. **Nothing is added to the ones the project already has**: a
  component that needs something else declares its own `@using`.

The order is always the same, because a reader looks for the same things in the same place:

1. **Directives** — `@page` when it is routable, `@using` if it needs one, `@inject` when inline.
2. **Markup.**
3. **C#** — parameters, state, lifecycle, handlers, private helpers.

**Everything is typed, including inside `@code` and inside a lambda chain**: in a component the
reader is usually deciding whether a value can be bound to markup.

## Parameters in, events out

- **`[Parameter]` on a public property** for everything that comes from the parent, and
  **`[EditorRequired]`** on the ones without which the component makes no sense — it helps at
  design time and **validates nothing at runtime**.
- **`[Parameter] public EventCallback<T>`** for everything that goes back up, and callbacks are
  awaited. A child **never** reaches its parent any other way: no shared static, no service
  invented to carry a click.
- **A parameter is never mutated by the component that receives it.** It reports the change
  through its callback and lets the owner decide.
- **Repeated items that can be inserted, removed or reordered carry a stable `@key`**, unique
  among siblings and never the position in the list.

The rule underneath: **the owner of a piece of state is the one that can change it**, and
everyone else asks.

## Injection follows the chosen organisation

Inline uses `@inject`; code-behind uses `[Inject]` properties with nullable storage and access
guards, **without `!`**. **The same dependency is never injected in both partials.**

**A plain class is the opposite case.** The typed client is not a component, so it takes its
dependencies in an explicit constructor with `readonly` fields, like any other class.

## The lifecycle

| Method | When it runs | What belongs in it |
|---|---|---|
| `OnInitialized{Async}` | once per instance — **and prerendering can create two instances** | parameter-independent setup; **no side effects** |
| `OnParametersSet{Async}` | right after initialisation, and **every time the parent passes parameters again** | anything that depends on a parameter, reloaded only when the one that matters changed |
| `OnAfterRender{Async}` | after interactive renders, **never in static or prerendered output** | DOM-dependent work and JS setup, guarded by `firstRender` |
| `Dispose` / `DisposeAsync` | when the component goes away | unsubscribing from what it subscribed to, stopping timers |
| `ShouldRender` | before each re-render | nothing, until a measurement says otherwise |
| `SetParametersAsync` | before all of the above | nothing — overriding it is framework-level work |

Four rules that come from how that table actually behaves:

- **Parameter-dependent data loads in `OnParametersSetAsync`**, guarded on the parameter that
  matters, and **not duplicated in initialisation**. Leave a renderable state before awaiting,
  and **ignore the response of a parameter that has already been superseded.**
- **`StateHasChanged` inside `OnAfterRender` triggers another render**, which calls
  `OnAfterRender` again. Only under a condition that stops. It is also the one lifecycle method
  the framework does not rerender after — that is deliberate, and it is what keeps the loop
  from being automatic.
- **`Dispose` is where subscriptions die.** A component that subscribed to a service event and
  never unsubscribes **keeps itself alive after the user left the screen**. Never call
  `StateHasChanged` while disposing.
- **A notification from outside is dispatched with `InvokeAsync`**, which is where state is
  updated and a render requested. Failures of those tasks are observed, not dropped.

## Nothing blocks, and the component owns its cancellation

**No `.Result`, no `.Wait()`, no `Task.Run` to fake a thread.** On WebAssembly there is a single
thread: blocking does not slow the page down, **it freezes it**, including the spinner that was
telling the user to wait.

A component has **no automatic lifetime token**. When a load or a debounce should stop on
replacement or disposal, it owns a `CancellationTokenSource`, passes the token through the typed
client, and cancels and disposes it. **Cancellation is not a guarantee the result never
arrives**: check identity and disposal before assigning anything to state.

## The typed client is how a screen reaches the API

**One client per feature, one method per operation**, injected into the component that needs it.
**A component never sees `HttpClient`**, never builds a URL and never reads a status code.

**The client returns the same result shape the backend answers with** — whether it succeeded,
the payload, the errors — and **it does not throw for an expected failure**: a rejected
operation is a result with errors, exactly as on the other side, and the screen shows them.
That is what stops every screen from interpreting a raw HTTP response its own way.

Keep three things apart: **an expected error, an intentional cancellation and a timeout**. A
timeout must never leave the screen loading forever. Technical detail is logged, **never shown
as a raw exception message**.

## Every screen that loads data has three states

**Loading, empty and error — all three, from the first version.** A screen that only draws the
happy path gets the other two added under pressure, by whoever is fixing something else.

**What each one looks like comes from `Docs/design-system.md`.** This skill only says the
component keeps the state it is in and renders the branch for it.

## What a component never does

- **Talk to the network directly**, or hold an `HttpClient`.
- **Decide a business rule**, or recompute something the backend already decided.
- **Change agreed user-facing text.** Wording the story gave is preserved; routine copy follows
  the design system; wording that carries a business promise is a question.
- **Share state through a static field.** State that outlives a component belongs to a service,
  and which one is the project's decision.

## Interop and authorisation

- **DOM-dependent JS is initialised after interactive rendering**, never during prerendering,
  and **the DOM Blazor owns is not modified behind the renderer's back**.
- **JS and .NET references are disposed**, and `JSDisconnectedException` is handled on Server
  cleanup. For cleanup on DOM removal, use an observer or a custom element's disconnect
  callback — **do not assume a live circuit during disposal.**
- **`AuthorizeView` controls visibility, not permission.** Destinations and backend resources
  are protected on the server; browser input is untrusted; **no secret is serialised into
  client-visible state.**

## Closing checklist

- [ ] Inline or code-behind follows the stack, with the partial's name and namespace matching.
- [ ] Everything in through `[Parameter]`, everything out through an awaited `EventCallback`,
      and no parameter mutated by its receiver.
- [ ] Injection follows the organisation, with no duplicate property and no `!`.
- [ ] Parameter-dependent loads live in `OnParametersSetAsync`, guarded, not duplicated, and a
      superseded response never reaches the UI.
- [ ] `firstRender` guards anything that must happen once, renders cannot loop, and everything
      subscribed to is unsubscribed on disposal.
- [ ] Nothing blocks; cancellable work owns its token source and disposes it.
- [ ] **No `HttpClient` in a component**: every call goes through the typed client, which
      returns the backend's result shape and does not throw on an expected failure.
- [ ] **Loading, empty and error** all present on every screen that loads data.
- [ ] No static shared state, and no user-facing text changed on the way past.
- [ ] JS references disposed, and nothing relies on `AuthorizeView` for permission.
