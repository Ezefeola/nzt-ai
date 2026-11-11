# Frontend vertical slice

The unit of organisation is **the feature**: a change touches one folder and removing it
deletes the folder. This file decides units and folders; what a file *is* comes from
`components.md`, how it renders from `rendering.md`.

## Units

1. **Where the code runs decides them**: browser-side code that must build apart from its
   host makes two units; otherwise one.
2. **The host references and serves the browser unit**, never the reverse.
3. **A feature lives entirely in the unit where it runs**: split across both, one half cannot
   reach the other.
4. **The units sit in the component's root** (under `src/` when used), beside their tests and
   `Docs/`.

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
2. **Folder names are plurals**, never a type's name.
3. **A feature is a section of the product in plural** (`Features/Orders/`): one name for the
   folder, the pages and the route. Every screen of the section sits at the feature level.
4. **No feature references another.** Shared moves up — a component to the root
   `Components/` (recorded in `Docs/Design/ui-components.md`), state to `State/` — or is
   **written twice**: a shared component growing optional parameters is the expensive problem.
5. **One typed client per feature, in its folder, never shared**, even when two features call
   the same API: the second caller wants another shape. Its DTOs stay with it.
6. **Everything injected is registered, written out, in the entry point of every unit it runs
   in**: registered in only one, it fails where the other runs.

## Done when

Every rule holds for the features you touched.
