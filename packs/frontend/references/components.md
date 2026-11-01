# Frontend components

A component is **a piece of screen plus the code that drives it**. A form adds `forms.md`.

## Steps

1. **Read the UI documents**: `Docs/Design/design-system.md` (look, states, wording), and
   `Docs/Design/ui-components.md` before a shared component.
2. **Reuse the component library `tech.md` adopted** before writing a custom one.
3. **Write it** by the rules below:
   - file and type named after it;
   - where the code sits (in the file or beside it) is `tech.md`'s, never a line count;
   - order: declarations → markup → code (inputs, state, lifecycle, handlers, private
     helpers);
   - existing components are not reorganised outside the scope.
4. **Check the rendered result** with `nzt-design`'s `references/generic.md` for a new screen
   or a changed look, or report that it could not be rendered.

## Rules

1. **Inputs in, events out**: everything from the parent is a declared input (required where
   the framework can say so); everything back up is an awaited event, never a static or a
   service invented to carry a click.
2. **A component never mutates an input it received**: the owner of state changes it.
3. **Repeated items that can move carry a stable key**, unique among siblings, never the
   position.
4. **Data depending on an input loads when that input changes**, guarded, not duplicated in
   initialisation; a response for a superseded input is ignored.
5. **Leave a renderable state before awaiting.**
6. **Initialisation has no side effects**: it can run twice (`rendering.md`).
7. **No render loops, nothing blocks** the UI thread, and **disposal releases every
   subscription**.
8. **The component owns its cancellation**: passed through the typed client, cancelled on
   replacement or disposal; identity and disposal checked before assigning a late result.
9. **The typed client is the only way to the API**, one method per operation: no HTTP client,
   URL or status code in a component.
10. **The client returns the backend's result shape and does not throw for an expected
    failure.** Expected error, cancellation and timeout are kept apart; a timeout never leaves
    the screen loading; technical detail is logged, never shown raw.
11. **Loading, empty and error from the first version**, each as the design system says.
12. **Never decide or recompute a business rule.**
13. **Never change agreed wording**: the story's is kept, routine copy follows the design
    system, a business promise is a question.
14. **Never share state through a static**, nor touch the DOM the framework owns outside the
    interactive lifecycle.
15. **Hiding is not protecting**: whether an operation may run is the backend's.
16. **Browser input is untrusted, and no secret goes into client-visible state.**

## Done when

Every step ran and every rule holds for the components you wrote.
