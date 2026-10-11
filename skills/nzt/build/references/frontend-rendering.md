# Frontend rendering

## Contents
- Where it runs, and whether a server pass ran first
- Interactive on the server
- Interactive in the browser
- A component that may run in either place
- Rendered on the server, with no interactivity
- A server pass before the interactive one
- Closing checklist

How a component is written does not change with where it renders — that is
`frontend-components.md`. This is only what the host changes. **Which hosts this component uses
is the stack's decision**, written in its stack document; read only the sections it selected.

## Where it runs, and whether a server pass ran first

**Where the component runs and whether a server pass also ran are two things.** The host says
where its code executes; prerendering says the server may also have rendered it once before the
interactive instance started. Some interactive hosts have that pass and some do not, and **code
that assumes two initialisations is wrong in both directions.**

## Interactive on the server

The component **runs on the server**. The browser holds the rendered page and a live
connection; an event travels to the server, which renders and sends back the difference.

- **Every interaction is a round trip.** A handler that runs on every keystroke is one round trip
  per keystroke: filter and search boxes **wait for the user to stop typing** before they call
  anything.
- **Every user's state is in server memory**, multiplied by the number of people on that
  screen and alive for as long as their connection is. Large state does not live in component
  fields here, and **user state is scoped to that user's connection, never a singleton shared
  across users.**
- **The connection can drop.** A retained session may reconnect with its state, but expiry, a
  server restart or a full refresh end it: **show reconnection and retry UI, and test both
  recovery and loss.**
- **Server-side does not mean data-side.** Server-only services are technically reachable from
  here, and that is exactly the problem: **the frontend reaches the product's backend through
  its typed client**, on this host too. A screen that queries the database directly works, and
  it is **the single hardest thing to undo later** — it pins that component to this host.

## Interactive in the browser

The component **runs in the browser**. No server holds its state and no interaction costs a
round trip: once loaded, the screen responds locally and only calls out for data.

- **The first visit pays for everything.** **Every package added to the browser-side code makes
  the first visit slower for everyone**, and **a screen nobody visits still ships its code**
  unless it is deliberately loaded later. A dependency taken for one screen is weighed against
  that: **measure the published build with a cold cache**.
- **Long work does not get faster in the browser** by moving it to another task: it runs in the
  same place. If something takes long, it belongs on the server, behind the API.
- **Everything in the browser is public.** The user can read every byte the app downloaded:
  **there are no secrets here** — no key, no connection string, no token that is not theirs, and
  no rule you would mind them reading.
- **And nothing the browser sends can be trusted by the backend**, which validates it all again
  on its side. A check done here is for the person using the screen, never for the system.

## A component that may run in either place

When the stack lets the same component run on the server or in the browser, it **must be correct
in both places**, and **the strictest of the two always applies**:

- **No server-only service and no database, ever** — in the browser they do not exist. Every
  call goes through the typed client.
- **No secret, no key, no privileged rule**: it may end up downloaded to the browser.
- **No assumption about latency in either direction.** On the server every interaction is a
  round trip; in the browser the calls to the API are.
- **Everything injected exists on both hosts**, with the lifetime its purpose asks for, and a
  check of where the code runs asks the current host, never the configured one.

## Rendered on the server, with no interactivity

The server renders the page per request, **with no live handler behind it**. Scripts and
navigation still work in the browser: static does not mean the page is dead.

- **Anything the user does that changes something travels as a request**: a link that
  navigates, or a form that posts (`frontend-forms.md`).
- **The data is loaded before the render**, in the page's initial setup, and **nothing there
  has a side effect**. Streaming may show early content for a slow read; it does not make the
  page interactive.
- **A page that only shows what it was given does not need to be interactive**: a report, a
  printable document, a detail screen, a landing page. **The actual latency still depends on
  the data and the rendering**, not on the mode alone.
- **When a screen has outgrown this mode, propose an interactive boundary and record the adopted
  mode and its scope.** That is a decision about the project, not about the screen: it is
  reported, and **the stack file is what changes.** A native control or a small justified piece
  of script does not by itself require making the whole application interactive.
- **What crosses from a static parent into an interactive part must be serialisable**: a
  function or a piece of markup cannot cross.

## A server pass before the interactive one

With prerendering on, a full page load can create **a server-rendered instance and an
interactive one**, and initialisation can run in both. Hosts without a server pass, and
components with prerendering off, have only one.

> **Never rely on initialisation running exactly once — nor on it running twice.**

- **Persist what prerendering produced instead of fetching it twice**, filled during
  initialisation **only when it is absent**. Handle both cases — absent and restored — and
  **refresh the data when the route or query key it depends on changes.**
- **Nothing with a side effect belongs in initialisation.** Browser storage and DOM-dependent
  script belong after the first interactive render: during prerendering they do not exist.
- **State that crosses to the browser is visible to that user.** **No secret, and nothing they
  may not inspect**, ever goes into persisted state.
- **Register dependencies on every host that executes the component**, the prerender host
  included.
- Without streaming, **prerendering waits for the tree to settle** before sending anything, so
  a slow load delays the whole page — **and a loading branch on its own does not skip that
  wait.** When the interactive instance would repeat the read, pair streaming with persistence.

## Closing checklist

- [ ] Only the hosts the stack selected were applied, and the component is correct on each of
      them.
- [ ] No handler that calls on every keystroke: input that filters or searches waits for the
      typing to stop.
- [ ] No large state in component fields, and no user state in a singleton.
- [ ] **Every backend call goes through the typed client**, host services included.
- [ ] Reconnection and loss are handled and were actually exercised where the host keeps a
      connection.
- [ ] No dependency added to the browser-side code without weighing the download, measured on a
      published build with a cold cache.
- [ ] **No secret, no key, no privileged rule** in code that ships to the browser, and nothing
      persisted that this user may not read.
- [ ] Everything the user changes on a static page travels as a navigation or a form post, and
      outgrowing the mode was reported as a stack decision.
- [ ] What initialisation loads is **persisted, not fetched twice**, and filled only when absent.
- [ ] Absent state and restored state both render correctly, and a changed route or query key
      refreshes the data.
- [ ] No side effect in initialisation; browser storage and script only after the first
      interactive render.
- [ ] Dependencies resolve on every host that runs the component, prerender host included.
