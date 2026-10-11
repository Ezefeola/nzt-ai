# Writing a Blazor component

## Contents
- The file, and the order inside it
- Parameters in, events out
- Injection follows the chosen organisation
- The lifecycle
- Nothing blocks, and the component owns its cancellation
- The typed client
- Interop and authorisation
- Closing checklist

**Read `../nzt-build/references/frontend-components.md` first.** It holds the library and the
UI documents before writing, inputs in and events out, the owner of the state, loading on the
input that changed, disposal, cancellation, the typed client with the backend's result shape,
the three states, what a component never does and hiding is not protecting. This file holds
only what is Blazor.

A form has its own: `nzt-build-frontend-blazor-forms`.

## The file, and the order inside it

- **Inline or code-behind is the stack's decision**, not a line count: `inline` keeps the C# in
  `@code` at the end of the `.razor`; `code-behind` uses a `.razor.cs` partial with the same
  name and namespace.
- **`_Imports.razor` is the one exception to explicit usings** — Razor has no other way to share
  what every component needs. **Nothing is added to the ones the project already has**: a
  component that needs something else declares its own `@using`.

The order:

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
  awaited.
- **Repeated items that can be inserted, removed or reordered carry a stable `@key`.**

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

- **Parameter-dependent data loads in `OnParametersSetAsync`**, guarded on the parameter that
  matters.
- **`StateHasChanged` inside `OnAfterRender` triggers another render**, which calls
  `OnAfterRender` again. Only under a condition that stops. It is also the one lifecycle method
  the framework does not rerender after — that is deliberate, and it is what keeps the loop
  from being automatic.
- **`Dispose` is where subscriptions die.** Never call `StateHasChanged` while disposing.
- **A notification from outside is dispatched with `InvokeAsync`**, which is where state is
  updated and a render requested. Failures of those tasks are observed, not dropped.

## Nothing blocks, and the component owns its cancellation

**No `.Result`, no `.Wait()`, no `Task.Run` to fake a thread.** On WebAssembly there is a single
thread.

A component has **no automatic lifetime token**: it owns a `CancellationTokenSource`, passes the
token through the typed client, and cancels and disposes it.

## The typed client

**A component never sees `HttpClient`**, never builds a URL and never reads a status code.

## Interop and authorisation

- **DOM-dependent JS is initialised after interactive rendering**, never during prerendering,
  and **the DOM Blazor owns is not modified behind the renderer's back**.
- **JS and .NET references are disposed**, and `JSDisconnectedException` is handled on Server
  cleanup. For cleanup on DOM removal, use an observer or a custom element's disconnect
  callback — **do not assume a live circuit during disposal.**
- **`AuthorizeView` controls visibility, not permission.**

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
- [ ] JS references disposed, and nothing relies on `AuthorizeView` for permission.
