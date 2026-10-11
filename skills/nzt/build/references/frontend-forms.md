# Frontend forms

A form is a component with a model, a submission and two kinds of validation that must not be
confused. Everything in `frontend-components.md` still applies — this is what the form adds.

## The model belongs to the form

**The form is bound to a model the form owns**, never to an entity that came back from the
API. A response DTO bound to inputs turns every field the API adds into a field the screen
edits, silently.

- **One way of supplying the model and one submission approach per form** — never two
  mechanisms competing for the same form.
- **Every input has a label, and every field can show its own error.**

## Shape here, business rules there

> **The frontend validates shape: required, length, format, range. It never validates a
> business rule.**

A rule duplicated here gives **two rules that drift apart with nothing tying them together** —
and the frontend's copy is the one nobody updates. The outcome of a business rule arrives as
errors in the result of the call, and **the screen shows what it was given**.

Whatever the stack selected for validation is what the form uses. **Do not replace the
project's validator to follow an example.**

## A submission that cannot run twice

**The submit button is disabled while the operation is in flight**, and the UI state is restored
when it completes **and when it fails**. Without that, a double click is two orders, and the
second one is the one nobody can explain.

The call goes through the feature's typed client like any other, and its errors are rendered as
errors of the form.

## Posting without interactivity

Where the page is rendered on the server with no live handler, **the form posts and the page
comes back rendered again**. Then:

- **Each form is identified, and named forms are matched explicitly when the page has more than
  one.**
- **The model is initialised only when absent**, because the page's setup runs again on the
  POST — **an unconditional `new` overwrites exactly what the user just submitted.**
- **Validation runs on the server, on the POST.** Typing produces no callback and no client-side
  validation, and a review that claims otherwise is wrong.

## Request forgery protection is never in the way

**Protection is never disabled to make a post work** — that is the vulnerability, not the fix.

## Closing checklist

- [ ] The form is bound to **its own model**, with one way of supplying it and one submission
      approach, not two.
- [ ] Inputs have labels and fields can show their errors.
- [ ] **Only shape is validated here**; the business rule's answer comes back from the call and
      is rendered as it arrived.
- [ ] The project's validation approach was used unchanged.
- [ ] A second submission cannot start while the first is running, and the UI is restored on
      success **and** on failure.
- [ ] A post without interactivity identifies its form, initialises the model only when absent,
      and claims no client-side validation.
- [ ] Request forgery protection is in place and was not disabled.
- [ ] A valid post, an invalid post, a repeated submission and a failed call were all exercised.
