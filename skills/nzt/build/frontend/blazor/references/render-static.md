---
name: nzt-build-frontend-blazor-render-static
description: Use when the stack selects static server rendering and the work touches rendering - no live .NET handlers, so everything the user changes travels as a navigation or a form post.
---

# Static server rendering

The server renders HTML per request, **without a live interactive .NET circuit or runtime for
that page**. The browser still runs scripts and enhanced navigation still works: static does not
mean the page is dead.

How a component is written does not change — that is
`nzt-build-frontend-blazor-components`. This is only what having no interactivity changes.

Load `nzt-build-frontend-blazor` before applying this.

## What does not exist here

- **DOM events do not invoke live .NET handlers.** A form POST invokes a server-side handler
  during a **new request** — that is not the same thing.
- **`OnAfterRender{Async}` never runs.** Initialisation and the parameter lifecycle do. **No
  timer-driven UI, no `StateHasChanged` loop.**
- **Streaming can deliver several HTML updates for one request**, and it still establishes no
  interactive circuit.

**Anything the user does that changes something travels as a request**: a link that navigates,
or a form that posts.

## The data is loaded before the render

What the page shows is loaded in the initial lifecycle, and **nothing there has a side effect**.
For a slow read-only load, `[StreamRendering]` can show early content — it does not change what
this mode is.

## Forms post, and the page comes back

The form submits and the response is a new render: the component receives what was submitted,
does the work through the typed client, and renders the outcome — the errors it got back, or the
page in its new state.

**The mechanics of that post live in `nzt-build-frontend-blazor-forms`**: `FormName`,
`[SupplyParameterFromForm]`, initialising the model only when absent, antiforgery, and `Enhance`.
They are not optional here, because this is the mode where the post *is* the interaction.

## When a screen has outgrown this mode

When the requirement genuinely needs live .NET event handling, **propose an interactive
boundary and record the adopted mode and its scope**. That is a decision about the project, not
about the screen: it is reported, and **the stack file is what changes.**

A native control like `<details>`, or a small justified piece of JS, does not by itself require
making the whole application interactive.

## What it is good at

A page that shows what it was given and asks for nothing back: a report, a printable document, a
detail screen, a landing page. It avoids an interactive runtime for that page — **the actual
latency still depends on the data and the rendering**, not on the mode alone.

## Closing checklist

- [ ] Nothing relies on a live .NET handler or on `OnAfterRender`, and a POST handler is not
      described as interactivity.
- [ ] The data is loaded in the initial lifecycle, with no side effect there.
- [ ] Everything the user changes travels as a navigation or a form post.
- [ ] The form mechanics of the forms skill are all in place, antiforgery included.
- [ ] Shape is validated here and business rules are answered by the backend — **and no claim of
      client-side validation in static SSR.**
- [ ] A valid post, an invalid post, more than one form on the page, enhanced navigation and a
      full reload were exercised where they apply.
- [ ] Outgrowing the mode was reported as a stack decision, not worked around in the screen.
