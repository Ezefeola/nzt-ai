# Frontend vertical slice

The unit of organisation is **the feature**: everything a section of the product needs sits in
one folder, so a change touches one place and removing it deletes a folder. This file decides
units and folders; what a file *is* comes from `components.md`, how it renders from
`rendering.md`.

## Units

**Where the code runs decides them**: browser-side code that must build apart from its host
makes two units (the host references and serves the browser one, never the reverse);
otherwise one. **A feature lives entirely in the unit where it runs** — split across both, one
half cannot reach the other. The units sit in the component's root (under `src/` when used),
beside their tests and `Docs/`.

## The tree

```
<Component>/                    the entry point
  Features/<FeaturePlural>/     the feature's routable pages and its typed client
    Components/                 components only this feature uses
    Dtos/                       what its client sends and receives
  Components/                   components more than one feature uses
    Layouts/
  Results/                      the result type every client method returns
  State/                        state that outlives the component that set it
```

## Rules

1. **A catalogue of roles, not folders to create**: a folder exists when something fills it.
   Names are plurals, never a type's name.
2. **A feature is a section of the product in plural** (`Features/Orders/`): one name for the
   folder, the pages and the route. Every screen of the section sits at the feature level,
   sharing its client and components.
3. **No feature references another.** Shared moves up — a component to the root
   `Components/` (recorded in `Docs/UX/ui-components.md`), state to `State/` — or is **written
   twice**: the duplicate is cheap, a shared component growing optional parameters is not.
4. **One typed client per feature, in its folder, never shared**, even when two features call
   the same API: the second caller wants another shape. Its DTOs stay with it.
5. **Everything injected is registered, written out, in the entry point of the unit it runs
   in** — in both when both run it; registered in only one, it fails where the other runs.

## Done when

No feature is split across units or references another, each has its own client and DTOs,
and every injected service is registered where it runs.
