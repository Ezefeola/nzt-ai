# Writing a Blazor component

Builds on `../nzt-frontend/references/components.md` — read it first. A form adds `forms.md`.

## The file

1. **`inline`** puts the C# in `@code` at the end of the `.razor`; **`code-behind`** uses a
   `.razor.cs` partial with the same name and namespace.
2. **Order**: directives (`@page` when routable, `@using` if needed, `@inject` when inline) ·
   markup · C# (parameters, state, lifecycle, handlers, helpers).
3. **Everything typed**, inside `@code` and lambdas too.
4. **`_Imports.razor` is the one exception to explicit usings**, and nothing is added to it: a
   component needing more declares its own `@using`.

## Rules

1. **`[Parameter]` public properties in, `[Parameter] EventCallback<T>` out**, awaited.
2. **`[EditorRequired]` on the essential parameters**: it is design-time help, no runtime
   check.
3. **Injection follows the organisation**: `@inject` inline; `[Inject]` properties with
   nullable storage and guards in code-behind; never in both partials.
4. **The typed client is a plain class with constructor injection.**
5. **The lifecycle**:

   | Method | Runs | Holds |
   |---|---|---|
   | `OnInitialized{Async}` | once per instance — prerendering can make two | parameter-independent setup, no side effects |
   | `OnParametersSet{Async}` | after init and on every new parameters | parameter-dependent loads, guarded on the one that matters |
   | `OnAfterRender{Async}` | after interactive renders, never static or prerendered | DOM and JS setup, guarded by `firstRender` |
   | `Dispose{Async}` | when it goes away | unsubscribing, stopping timers — never `StateHasChanged` |
   | `ShouldRender`, `SetParametersAsync` | — | nothing, until a measurement says otherwise |

6. **`StateHasChanged` in `OnAfterRender`** re-renders and runs it again: only under a
   condition that stops.
7. **Outside notifications go through `InvokeAsync`**, and their failures are observed.
8. **No `Task.Run` to fake a thread**: WebAssembly has one.
9. **There is no automatic lifetime token**: the component owns a `CancellationTokenSource`,
   passes its token through the client, cancels and disposes it.
10. **Interop**: DOM-dependent JS after interactive rendering, never touching the DOM Blazor
    owns; JS and .NET references disposed; `JSDisconnectedException` handled on Server
    cleanup; no live circuit assumed during disposal.

## Done when

Every rule holds for the components you wrote.
