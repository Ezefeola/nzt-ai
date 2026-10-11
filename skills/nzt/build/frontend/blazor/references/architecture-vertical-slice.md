# Frontend vertical slice on Blazor

**Read `../nzt-build/references/frontend-architecture-vertical-slice.md` first.** It holds the
architecture: the feature as the unit, the tree of roles, the typed client and registration.
This file holds only what is Blazor.

## How many projects: the render mode decides

The browser can only run assemblies built for it, and those are a project of their own.

| The project renders | Projects |
|---|---|
| statically, or interactively on the server | **one** |
| interactively in the browser, or on either host | **two**: the host and the browser-side one, named `<Component>` and `<Component>.Client` |

**With two projects, the host references the browser-side one** and serves it.

> **A feature lives entirely in one project** — the one its render mode needs. Split across
> both, it **compiles**, and then one half cannot be reached from the other.

With a single project, the generic tree sits in it, with the same folder roles.

## The tree with two projects

```
<Component>/                   at its root, the entry point of the application
  wwwroot/                     the static assets the browser downloads
  Components/                  the root document and the router
    Layouts/                   the layouts pages render inside
  Features/<FeaturePlural>/    the features that never run in the browser

<Component>.Client/            at its root, its entry point and the shared usings
  Features/<FeaturePlural>/    at its root, the routable page of the feature and
                               its typed client
```

Below `<Component>.Client/` the roles are the generic tree's: feature `Components/` and
`Dtos/`, and the shared `Components/`, `Results/` and `State/`.

## Registration

**A service registered in only one of the two is the failure the `auto` mode produces**, and
it is silent until the second visit. Registrations are written out, **never discovered by
scanning the assembly**.

## Closing checklist

- [ ] The number of projects matches the render mode, and **no feature is split across both**.
- [ ] Everything injected is registered in `Program.cs` of **its** project — and in both when
      the render mode is `auto`.
