# Frontend forms

A form is a component (`components.md`) with a model, a submission and validation of shape.

## Rules

1. **The form binds to a model it owns**, never to a response DTO: each field the API adds
   would become a field the screen edits.
2. **One way of supplying the model and one submission approach per form.**
3. **Every input has a label, and every field can show its own error.**
4. **The frontend validates shape** — required, length, format, range — **never a business
   rule**, with the validation `tech.md` selected, unchanged.
5. **A business rule's outcome arrives as errors in the call's result**, shown as they
   came, as the form's.
6. **A submission cannot run twice**: the button is disabled while in flight and the UI
   restored on success **and** failure.
7. **Posting without interactivity** (server rendering with no live handler) — the page comes
   back rendered:
   - each form is identified, named forms matched explicitly when there are several;
   - **the model is initialised only when absent**: setup runs again on the POST, and an
     unconditional `new` overwrites what the user sent;
   - validation runs on the server, on the POST.
8. **Request forgery protection is never disabled** to make a post work.
9. **Test**: a valid post, an invalid post, a repeated submission and a failed call.

## Done when

Every rule holds and the tests of rule 9 ran.
