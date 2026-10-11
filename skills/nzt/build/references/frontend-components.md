# Frontend components

## Contents
- Before writing one
- The file, and the order inside it
- Parameters in, events out
- Loading data, and the work a component starts
- The typed client is how a screen reaches the API
- Every screen that loads data has three states
- What a component never does
- Hiding is not protecting
- Closing checklist

A component is **a piece of screen plus the code that drives it**. Everything it needs to do it
does through a **typed client**; it never talks to the network itself and it never decides a
business rule.

**How the project is laid out belongs to the architecture reference, and how it renders to the
rendering one.** This is the component itself. A form adds its own: `frontend-forms.md`.

## Before writing one

**The UI documents decide what the screen looks like**: `Docs/UX/design-system.md` for visual
work, states and wording, `Docs/UX/ui-components.md` before adding a shared component.
**Reuse the component library the stack adopted before writing a custom component.**

## The file, and the order inside it

- **A component's file is named after the component**, and so is its type.
- **Where the code sits — in the component's file or beside it — is the stack's decision**, not
  a line count. **Existing components are not reorganised outside the requested scope.**
- What the framework shares with every component is not added to on the way past: a component
  that needs something else declares it itself.

The order is always the same, because a reader looks for the same things in the same place:
**declarations, then markup, then code** — inputs, state, lifecycle, handlers, private helpers.

## Parameters in, events out

- **Everything that comes from the parent is a declared input**, and the ones without which the
  component makes no sense are marked required where the framework can say so.
- **Everything that goes back up is an event the parent handles**, and its handling is awaited.
  A child **never** reaches its parent any other way: no shared static, no service invented to
  carry a click.
- **A parameter is never mutated by the component that receives it.** It reports the change
  through its event and lets the owner decide.
- **Repeated items that can be inserted, removed or reordered carry a stable key**, unique
  among siblings and never the position in the list.

The rule underneath: **the owner of a piece of state is the one that can change it**, and
everyone else asks.

## Loading data, and the work a component starts

- **Data that depends on an input loads when that input changes**, guarded on the input that
  matters, and **not duplicated in initialisation**. Leave a renderable state before awaiting,
  and **ignore the response of a parameter that has already been superseded.**
- **Initialisation has no side effects**: depending on how the page renders, it can run more
  than once.
- **A render never unconditionally requests another render** — that is a loop.
- **Disposal is where subscriptions die.** A component that subscribed to a service event and
  never unsubscribes **keeps itself alive after the user left the screen**.
- **Nothing blocks.** Where the UI runs on a single thread, blocking does not slow the page down,
  **it freezes it**, including the spinner that was telling the user to wait.
- **The component owns its cancellation.** When a load or a debounce should stop on replacement
  or disposal, the component owns the cancellation, passes it through the typed client, and
  cancels it. **Cancellation is not a guarantee the result never arrives**: check identity and
  disposal before assigning anything to state.

## The typed client is how a screen reaches the API

**One client per feature, one method per operation**, injected into the component that needs it.
**A screen never talks to the network itself.** A component never holds the HTTP client, never
builds a URL and never reads a status code.

**The client returns the same result shape the backend answers with** — whether it succeeded,
the payload, the errors — and **it does not throw for an expected failure**: a rejected
operation is a result with errors, exactly as on the other side, and the screen shows them.
That is what stops every screen from interpreting a raw HTTP response its own way.

Keep three things apart: **an expected error, an intentional cancellation and a timeout**. A
timeout must never leave the screen loading forever. Technical detail is logged, **never shown
as a raw exception message**.

## Every screen that loads data has three states

**Loading, empty and error — all three, from the first version.** A screen that only draws the
happy path gets the other two added under pressure, by whoever is fixing something else.

**What each one looks like comes from `Docs/UX/design-system.md`.** This reference only says the
component keeps the state it is in and renders the branch for it.

## What a component never does

- **Talk to the network directly**, or hold an HTTP client.
- **Decide a business rule**, or recompute something the backend already decided.
- **Change agreed user-facing text.** Wording the story gave is preserved; routine copy follows
  the design system; wording that carries a business promise is a question.
- **Share state through a static field.** State that outlives a component belongs to a service,
  and which one is the project's decision.
- **Modify behind the renderer's back the DOM the framework owns.** DOM-dependent script runs
  after the component is interactive, and what it creates is released when the component goes.

## Hiding is not protecting

**Hiding a control decides what the screen shows, not whether the operation may run.** That is
decided by the backend (`backend-security.md`). A hidden button is not a permission:
destinations and backend resources are protected on the server; browser input is untrusted;
**no secret is serialised into client-visible state.**

## Closing checklist

- [ ] The design system and the component inventory were read, and the adopted library reused
      before writing a custom component.
- [ ] The code organisation follows the stack, and nothing was reorganised outside the scope.
- [ ] Everything in through declared inputs, everything out through awaited events, and no
      parameter mutated by its receiver.
- [ ] Input-dependent loads are guarded, not duplicated, and a superseded response never
      reaches the UI.
- [ ] Renders cannot loop, and everything subscribed to is released on disposal.
- [ ] Nothing blocks; cancellable work owns its cancellation.
- [ ] **No HTTP client in a component**: every call goes through the typed client, which
      returns the backend's result shape and does not throw on an expected failure.
- [ ] **Loading, empty and error** all present on every screen that loads data.
- [ ] No static shared state, and no user-facing text changed on the way past.
- [ ] Nothing relies on hiding a control for permission.
