---
name: nzt-build-frontend-blazor-forms
description: Use when writing or changing a form and its submission - EditForm bound to a model of its own, shape validated here and business rules answered by the backend, and a post that cannot run twice.
---

# Forms

A form is a component with a model, a submission and two kinds of validation that must not be
confused. Everything in `nzt-build-frontend-blazor-components` still applies — this is what the
form adds.

Load `nzt-build-frontend-blazor` before applying this.

## The model belongs to the form

**`EditForm` is bound to a model the form owns**, never to an entity that came back from the
API. A response DTO bound to inputs turns every field the API adds into a field the screen
edits, silently.

- **Supply `Model` or `EditContext`, never both.**
- **Use `OnValidSubmit`/`OnInvalidSubmit`, or manual validation in `OnSubmit` — not both
  approaches in one form.**
- **Every input has a label, and every field can show its own error.**

## Shape here, business rules there

> **The frontend validates shape: required, length, format, range. It never validates a
> business rule.**

A rule duplicated here gives **two rules that drift apart with nothing tying them together** —
and the frontend's copy is the one nobody updates. The outcome of a business rule arrives as
errors in the result of the call, and **the screen shows what it was given**.

Whatever the stack selected for validation is what the form uses. **Do not replace the
project's validator to follow an example.** When the project adopted nested DataAnnotations
validation on .NET 10, that means: validation services registered with `AddValidation`, model
types in `.cs` files, the root model marked `[ValidatableType]`, and `DataAnnotationsValidator`
inside the form.

## A submission that cannot run twice

**The submit button is disabled while the operation is in flight**, and the UI state is restored
when it completes **and when it fails**. Without that, a double click is two orders, and the
second one is the one nobody can explain.

The call goes through the feature's typed client like any other, and its errors are rendered as
errors of the form.

## Posting without interactivity

Under static server rendering there is no live handler: **the form posts and the page comes
back rendered again**. That changes four things, and all four are load-bearing:

- **`FormName`**, unique within its form scope, and **named forms are matched explicitly when
  the page has more than one.**
- **`[SupplyParameterFromForm]`** to receive what was posted.
- **The model is initialised only when absent (`??=`)**, because the lifecycle runs again on the
  POST — **an unconditional `new` overwrites exactly what the user just submitted.**
- **`OnValidSubmit` runs after server validation on the POST.** Binding syntax fills the
  rendered controls, but **typing produces no callback and no client-side validation**: saying
  otherwise in a review is a claim that static SSR cannot support.

`Enhance` is used only when posting to a Blazor endpoint that supports it, and both enhanced
navigation and a full reload are tested.

## Antiforgery is never in the way

`EditForm` includes its token. A plain POST form needs `AntiforgeryToken`, its form
identification and the server middleware. **Protection is never disabled to make a post work** —
that is the vulnerability, not the fix.

## Closing checklist

- [ ] The form is bound to **its own model**, with `Model` or `EditContext` and one submission
      approach, not two.
- [ ] Inputs have labels and fields can show their errors.
- [ ] **Only shape is validated here**; the business rule's answer comes back from the call and
      is rendered as it arrived.
- [ ] The project's validation approach was used unchanged.
- [ ] A second submission cannot start while the first is running, and the UI is restored on
      success **and** on failure.
- [ ] A static post has its `FormName`, its `[SupplyParameterFromForm]`, a model initialised
      only when absent, and no claim of client-side validation.
- [ ] Antiforgery is in place and was not disabled.
- [ ] A valid post, an invalid post, a repeated submission and a failed call were all exercised.
