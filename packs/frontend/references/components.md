# Frontend components

A component is **a piece of screen plus the code that drives it**. It reaches the API only
through a typed client and never decides a business rule. A form adds `forms.md`.

## Steps

1. **Read the UI documents**: `Docs/UX/design-system.md` (look, states, wording) and
   `Docs/UX/ui-components.md` before a shared component. Reuse the component library
   `tech.md` adopted before writing a custom one.
2. **Write it** by the rules below: file and type named after it; where the code sits (in the
   file or beside it) is `tech.md`'s, never a line count; order declarations → markup → code
   (inputs, state, lifecycle, handlers, private helpers). Existing components are not
   reorganised outside the scope.
3. **Check the rendered result** with `nzt-ux`'s `references/generic.md` for a new screen or a
   changed look, or report that it could not be rendered.

## Rules

1. **Inputs in, events out.** Everything from the parent is a declared input (required where
   the framework can say so); everything back up is an awaited event — never a static or a
   service invented to carry a click. **A component never mutates an input it received**: the
   owner of state is the one that changes it.
2. **Repeated items that can move carry a stable key**, unique among siblings, never the
   position.
3. **Loading**: data depending on an input loads when that input changes, guarded and not
   duplicated in initialisation; leave a renderable state before awaiting; ignore a response
   for a superseded input. Initialisation has no side effects — it can run twice.
4. **No render loops, nothing blocks** (on a single UI thread blocking freezes the page), and
   **disposal releases every subscription**.
5. **The component owns its cancellation**: passed through the typed client, cancelled on
   replacement or disposal; identity and disposal checked before assigning a late result.
6. **The typed client — one per feature, one method per operation** — is the only way to the
   API. No HTTP client, URL or status code in a component. It returns the backend's result
   shape and **does not throw for an expected failure**. Expected error, cancellation and
   timeout are kept apart; a timeout never leaves the screen loading; technical detail is
   logged, never shown raw.
7. **Loading, empty and error from the first version**, each looking as the design system says.
8. **Never**: decide or recompute a business rule; change agreed wording (the story's is kept,
   routine copy follows the design system, a business promise is a question); share state
   through a static; touch the DOM the framework owns outside the interactive lifecycle.
9. **Hiding is not protecting**: whether an operation may run is the backend's. Browser input
   is untrusted, and no secret goes into client-visible state.

## Done when

Everything flows through inputs, events and the typed client, every data screen has its three
states, subscriptions and cancellation are released, and nothing relies on hiding for
permission.
