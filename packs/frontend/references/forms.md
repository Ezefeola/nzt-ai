# Frontend forms

A form is a component (`components.md`) with a model, a submission and validation of shape.

## Rules

1. **The form binds to a model it owns**, never to a response DTO — each field the API adds
   would become a field the screen edits. One way of supplying the model and one submission
   approach per form.
2. **Every input has a label, and every field can show its own error.**
3. **The frontend validates shape** — required, length, format, range — **never a business
   rule**: a copy here drifts from the backend's. The rule's outcome arrives as errors in the
   call's result, shown as they came. Use the validation `tech.md` selected, unchanged.
4. **A submission cannot run twice**: the button is disabled while in flight and the UI restored
   on success **and** failure. The call goes through the typed client; its errors render as
   the form's.
5. **Posting without interactivity** (server rendering with no live handler): the page comes
   back rendered.
   - each form is identified, named forms matched explicitly when there are several;
   - **the model is initialised only when absent** — setup runs again on the POST, and an
     unconditional `new` overwrites what the user sent;
   - validation runs on the server, on the POST — there is no client-side validation to claim.
6. **Request forgery protection is never disabled** to make a post work.

## Done when

A valid post, an invalid post, a repeated submission and a failed call were exercised, and
only shape is validated here.
