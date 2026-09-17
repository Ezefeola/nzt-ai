---
name: nzt-build-frontend-blazor-architecture-vertical-slice
description: Use when the frontend stack selects vertical-slice and code is added or moved - the feature is the unit, the render mode decides how many projects, and no feature reaches into another.
---

# Frontend vertical slice

**The unit of organisation is the feature, not the technical role.** Everything one screen needs
sits in one folder, so changing it touches one place and removing it is a deleted folder.

**This skill decides projects and folders, and names each folder by the role it holds — nothing
else does.** What each file *is* comes from the components skill, and how it renders from the
render mode's.

Load `nzt-build-frontend-blazor` before applying this.

## How many projects: the render mode decides

**It is the one thing that changes the layout**, and it is not a preference — the browser can
only run assemblies built for it, and those are a project of their own.

| The project renders | Projects |
|---|---|
| statically, or interactively on the server | **one** |
| interactively in the browser, or on either host | **two**: the host and the browser-side one, named `<Component>` and `<Component>.Client` |

**With two projects, the host references the browser-side one** and serves it. Nothing goes the
other way.

> **A feature lives entirely in one project** — the one its render mode needs. A feature split
> across both is the mistake this rule exists to prevent: its page in one and its components in
> the other **compiles**, and then one of them cannot be reached from the other.

With a single project, everything below sits in it, with the same folder roles.

## The tree

Each line is a **role**: what belongs there, never what it is called. The annotation says what
sits directly in that folder.

```
<Component>/                   at its root, the entry point of the application
  wwwroot/                     the static assets the browser downloads
  Components/                  the root document and the router
    Layouts/                   the layouts pages render inside
  Features/<FeaturePlural>/    the features that never run in the browser

<Component>.Client/            at its root, its entry point and the shared usings
  Features/<FeaturePlural>/    at its root, the routable page of the feature and
                               its typed client
    Components/                the components only this feature uses
    Dtos/                      what its client sends and receives
  Components/                  the components more than one feature uses
  Results/                     the result type every client method returns
  State/                       state that outlives the component that set it
```

**This is a catalogue of roles, not a set of folders to create up front.** A folder exists when
something fills it: no shared component, no root `Components/`; no state beyond a screen, no
`State/`. **An empty folder invites something unrelated into it.**

**Folder names are plurals**, the form that never collides with the type name beside it.

## `Features/` — the slice

**A feature is a section of the product, named in plural**: `Features/Orders/`. One name governs
the folder, the page and the route. Two levels, each holding a different kind of thing:

- **At the feature level** — what the feature as a whole is: its **routable page** and its
  **typed client**, the one every screen of the feature calls.
- **Below it** — the **components only this feature uses**, and the **shapes its client
  exchanges** with the API.

**A feature with several screens keeps them all at the feature level.** Two pages of the same
section share the client and the components; that is why they are one feature and not two.

## No feature reaches into another

A file inside `Features/Orders/` **never references anything under another feature folder**.
What two features share moves up: a component to the root `Components/`, state to `State/`.
**What does not belong at the root is written twice.**

**The duplicate is the cheap problem.** The shared component between two features is the
expensive one: the second caller needs one more parameter, the first gets an optional one, and
the component stops being removable. A shared component is a decision, and
`Docs/ui-components.md` is where it is recorded.

## The typed client belongs to its feature

**One per feature, in the feature folder**, and nowhere else. It is not shared between features
even when two of them call the same part of the API: **the second caller always wants a
different shape back, and a client serving two screens ends up serving neither.**

**Its DTOs are its own**, in the folder beside it, and they do not travel to another feature.
What a screen shows is what its own client returned.

## Registration

**Whatever the application injects is registered in the entry point of the project it runs in.**
With two projects, the browser-side one registers what its features use and the host registers
what its own use. **A service registered in only one of the two is the failure the `auto` mode
produces**, and it is silent until the second visit.

Registrations are written out, **never discovered by scanning the assembly**.

## Closing checklist

- [ ] The number of projects matches the render mode, and **no feature is split across both**.
- [ ] Every folder name is a plural, and none matches a type name.
- [ ] No folder that nothing fills.
- [ ] The feature folder holds its **page and its typed client**, with its own components and
      DTOs below it.
- [ ] **No reference from one feature into another.** What is shared went to the root
      `Components/` or `State/`, or was duplicated.
- [ ] No typed client shared between features, and no DTO travelling between them.
- [ ] Everything injected is registered in the entry point of **its** project — and in both when
      both run it.
