# Blazor forms

Builds on `../nzt-frontend/references/forms.md` — read it first, with `components.md`.

## Rules

1. **`EditForm` with `Model` or `EditContext`, never both.**
2. **`OnValidSubmit`/`OnInvalidSubmit` or manual validation in `OnSubmit`, never both.**
3. **Nested DataAnnotations on .NET 10**, when the project adopted it: `AddValidation`
   registered, model types in `.cs` files, the root marked `[ValidatableType]`,
   `DataAnnotationsValidator` inside the form.
4. **Static server rendering**: `FormName` unique in its scope, `[SupplyParameterFromForm]`
   receiving the post, the model initialised with `??=`.
5. **`Enhance`** only toward a Blazor endpoint that supports it, testing enhanced navigation
   and a full reload.
6. **Antiforgery**: `EditForm` includes the token; a plain POST form needs `AntiforgeryToken`,
   its form identification and the server middleware.

## Done when

Every rule holds for the forms you wrote.
