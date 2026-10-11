# Frontend vertical slice

## Contents
- Where the code runs decides the units
- The tree
- `Features/` — the slice
- No feature reaches into another
- The typed client belongs to its feature
- Registration
- Closing checklist

**The unit of organisation is the feature, not the technical role.** Everything one screen needs
sits in one folder, so changing it touches one place and removing it is a deleted folder.

**This reference decides units and folders, and names each folder by the role it holds —
nothing else does.** What each file *is* comes from the components reference, and how it
renders from the rendering one.

## Where the code runs decides the units

When the browser-side code has to be built as a unit of its own, apart from the host that
serves it, the frontend is two units; otherwise it is one. **It is the one thing that changes
the layout**, and it is not a preference. With two, the host references the browser-side one
and serves it. Nothing goes the other way.

> **A feature lives entirely in one project** — the one where it runs. A feature split across
> both is the mistake this rule exists to prevent: its page in one and its components in the
> other builds, and then one of them cannot be reached from the other.

## The tree

Each line is a **role**: what belongs there, never what it is called. The annotation says what
sits directly in that folder. **The tree is the build unit's folder, not the component's
root**: the root holds the units (under `src/` when the project uses one), their tests and the
component's `Docs/`, and that root is the folder `architecture.md` names.

```
<Component>/                   at its root, the entry point of the application
  Features/<FeaturePlural>/    at its root, the routable page of the feature and
                               its typed client
    Components/                the components only this feature uses
    Dtos/                      what its client sends and receives
  Components/                  the components more than one feature uses
    Layouts/                   the layouts pages render inside
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
`Docs/UX/ui-components.md` is where it is recorded.

## The typed client belongs to its feature

**One per feature, in the feature folder**, and nowhere else. It is not shared between features
even when two of them call the same part of the API: **the second caller always wants a
different shape back, and a client serving two screens ends up serving neither.**

**Its DTOs are its own**, in the folder beside it, and they do not travel to another feature.
What a screen shows is what its own client returned.

## Registration

**Whatever the application injects is registered in the entry point of the project it runs in.**
With two units, the browser-side one registers what its features use and the host registers
what its own use; a service registered in only one of the two fails only where the other one
runs.

Registrations are written out, **never discovered by scanning the code**.

## Closing checklist

- [ ] The number of units matches where the code runs, and **no feature is split across both**.
- [ ] Every folder name is a plural, and none matches a type name.
- [ ] No folder that nothing fills.
- [ ] The feature folder holds its **page and its typed client**, with its own components and
      DTOs below it.
- [ ] **No reference from one feature into another.** What is shared went to the root
      `Components/` or `State/`, or was duplicated.
- [ ] No typed client shared between features, and no DTO travelling between them.
- [ ] Everything injected is registered in the entry point of **its** project — and in both when
      both run it.
