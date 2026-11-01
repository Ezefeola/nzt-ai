# Blazor forms

Builds on `../nzt-frontend/references/forms.md` — read it first, with `components.md`. This file
holds only what is Blazor.

## Rules

1. **`EditForm` with `Model` or `EditContext`, never both**, and `OnValidSubmit`/
   `OnInvalidSubmit` or manual validation in `OnSubmit`, never both.
2. **Nested DataAnnotations on .NET 10**, when the project adopted it: `AddValidation`
   registered, model types in `.cs` files, the root marked `[ValidatableType]`,
   `DataAnnotationsValidator` inside the form.
3. **Static server rendering**:
   - `FormName`, unique in its scope, matched explicitly when the page has several;
   - `[SupplyParameterFromForm]` receives the post;
   - the model initialised with `??=` — the lifecycle runs again on the POST;
   - `OnValidSubmit` runs after server validation; typing triggers nothing.
   - `Enhance` only toward a Blazor endpoint that supports it, testing enhanced navigation and
     a full reload.
4. **Antiforgery**: `EditForm` includes the token; a plain POST form needs `AntiforgeryToken`,
   its form identification and the server middleware.

## Done when

One model source and one submission approach per form, a static post with `FormName`,
`[SupplyParameterFromForm]` and `??=`, and antiforgery in place.
