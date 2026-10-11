# Forms

**Read `../nzt-build/references/frontend-forms.md` first.** It holds the model the form owns,
shape here and business rules in the backend, the submission that cannot run twice, posting
without interactivity and never disabling forgery protection. This file holds only what is
Blazor.

Everything in `nzt-build-frontend-blazor-components` still applies.

## `EditForm`

**`EditForm` is bound to a model the form owns.**

- **Supply `Model` or `EditContext`, never both.**
- **Use `OnValidSubmit`/`OnInvalidSubmit`, or manual validation in `OnSubmit` — not both
  approaches in one form.**

When the project adopted nested DataAnnotations validation on .NET 10, that means: validation
services registered with `AddValidation`, model types in `.cs` files, the root model marked
`[ValidatableType]`, and `DataAnnotationsValidator` inside the form.

## Posting without interactivity

Under static server rendering there is no live handler. Four things are load-bearing:

- **`FormName`**, unique within its form scope, and **named forms are matched explicitly when
  the page has more than one.**
- **`[SupplyParameterFromForm]`** to receive what was posted.
- **The model is initialised only when absent (`??=`)**, because the lifecycle runs again on the
  POST.
- **`OnValidSubmit` runs after server validation on the POST.** Binding syntax fills the
  rendered controls, but **typing produces no callback and no client-side validation**: saying
  otherwise in a review is a claim that static SSR cannot support.

`Enhance` is used only when posting to a Blazor endpoint that supports it, and both enhanced
navigation and a full reload are tested.

## Antiforgery is never in the way

`EditForm` includes its token. A plain POST form needs `AntiforgeryToken`, its form
identification and the server middleware.

## Closing checklist

- [ ] The form is bound to **its own model**, with `Model` or `EditContext` and one submission
      approach, not two.
- [ ] A static post has its `FormName`, its `[SupplyParameterFromForm]`, a model initialised
      only when absent, and no claim of client-side validation.
- [ ] Antiforgery is in place and was not disabled.
