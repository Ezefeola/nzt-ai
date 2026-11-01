# Writing a Blazor component

Builds on `../nzt-frontend/references/components.md` — read it first. This file holds only what
is Blazor. A form adds `forms.md`.

## The file

1. **`inline` or `code-behind` is `tech.md`'s**: `inline` puts the C# in `@code` at the end of
   the `.razor`; `code-behind` uses a `.razor.cs` partial with the same name and namespace.
2. **Order**: directives (`@page` when routable, `@using` if needed, `@inject` when inline) ·
   markup · C# (parameters, state, lifecycle, handlers, helpers). Everything typed, inside
   `@code` and lambdas too.
3. **`_Imports.razor` is the one exception to explicit usings**; nothing is added to it — a
   component needing more declares its own `@using`.

## Rules

1. **`[Parameter]` public properties in, `[Parameter] EventCallback<T>` out**, awaited.
   `[EditorRequired]` on the essential ones — design-time help, no runtime check. Movable
   repeated items take a stable `@key`.
2. **Injection follows the organisation**: `@inject` inline; `[Inject]` properties with nullable
   storage and guards (no `!`) in code-behind; never in both partials. The typed client is a
   plain class with constructor injection.
3. **The lifecycle**:

   | Method | Runs | Holds |
   |---|---|---|
   | `OnInitialized{Async}` | once per instance — prerendering can make two | parameter-independent setup, no side effects |
   | `OnParametersSet{Async}` | after init and on every new parameters | parameter-dependent loads, guarded on the one that matters |
   | `OnAfterRender{Async}` | after interactive renders, never static or prerendered | DOM and JS setup, guarded by `firstRender` |
   | `Dispose{Async}` | when it goes away | unsubscribing, stopping timers — never `StateHasChanged` |
   | `ShouldRender`, `SetParametersAsync` | — | nothing, until a measurement says otherwise |

   `StateHasChanged` in `OnAfterRender` re-renders and runs it again: only under a condition
   that stops. Outside notifications go through `InvokeAsync`, and their failures are observed.
4. **Nothing blocks** — no `.Result`, `.Wait()` or `Task.Run` to fake a thread (WebAssembly has
   one). **There is no automatic lifetime token**: the component owns a
   `CancellationTokenSource`, passes its token through the client, cancels and disposes it.
5. **No `HttpClient`, URL or status code in a component.**
6. **Interop**: DOM-dependent JS after interactive rendering, never touching the DOM Blazor
   owns; JS and .NET references disposed; `JSDisconnectedException` handled on Server cleanup;
   no live circuit assumed during disposal.
7. **`AuthorizeView` controls visibility, not permission.**

## Done when

Organisation follows `tech.md`, loads live in `OnParametersSetAsync` guarded, `firstRender`
guards one-time work, token sources and JS references are disposed, and no component holds an
`HttpClient`.
