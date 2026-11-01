# Frontend rendering

What the host changes; how a component is written does not (`components.md`). **Read only the
sections `tech.md` selected.** Where code runs and whether a server pass ran first are two
different things.

## Interactive on the server

The component runs on the server; the browser holds the page and a live connection.

1. **Every interaction is a round trip**: search and filter boxes wait for typing to stop.
2. **Every user's state lives in server memory** for the life of the connection: no large
   state in component fields; user state scoped to that connection, never a singleton.
3. **The connection drops**: show reconnection and retry UI, and test recovery and loss.
4. **Server-side is not data-side**: the backend is reached through the typed client here
   too. A screen querying the database pins the component to this host.

## Interactive in the browser

The component runs in the browser; once loaded it responds locally.

1. **The first visit pays for everything**: every package slows it for everyone, and an
   unvisited screen still ships unless loaded later. Measure the published build with a cold
   cache.
2. **Long work belongs on the server**, behind the API.
3. **Everything in the browser is public**: no key, connection string, foreign token or rule
   the user should not read.

## Either place

When the same component may run on both, **the strictest of the two applies**: no
server-only service or database, no secret, no latency assumption, and a "where am I" check
asks the current host.

## Server-rendered, no interactivity

Rendered per request with no live handler; scripts and navigation still work.

1. **A change travels as a request**: a link or a form post (`forms.md`).
2. **Data loads before the render**; streaming shows early content, it does not make the page
   interactive.
3. **Good for pages that show what they were given** (reports, details, landing pages).
4. **A screen that outgrew the mode is reported** with a proposed interactive boundary (a
   `tech.md` change). A native control or a small script does not require it.
5. **What crosses from a static parent into an interactive part is serialisable** (no
   functions or markup).

## A server pass before the interactive one

With prerendering, initialisation may run in a server instance and an interactive one — or
once. **Never rely on it running once, nor twice.**

1. **Persist what prerendering loaded** and fill it only when absent; render both absent and
   restored states; refresh when the route or query key changes.
2. **Browser storage and DOM script run after the first interactive render.**
3. **Persisted state is visible to the user**: nothing they may not read.
4. **Register dependencies on the prerender host too.**
5. **Without streaming, prerendering waits for the tree to settle** — a loading branch
   does not skip that. Pair streaming with persistence when the interactive instance would
   repeat the read.

## Done when

The component is correct on every host `tech.md` selected.
