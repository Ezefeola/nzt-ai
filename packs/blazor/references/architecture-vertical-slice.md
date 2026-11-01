# Frontend vertical slice on Blazor

Builds on `../nzt-frontend/references/architecture-vertical-slice.md` — read it first.

## Rules

1. **The render mode decides the projects**: the browser runs only assemblies built for it.

   | Renders | Projects |
   |---|---|
   | statically, or interactively on the server | one |
   | interactively in the browser, or on either host (`auto`) | two: `<Component>` (host, references and serves the other) and `<Component>.Client` |

2. **With two projects**:

   ```
   <Component>/
     wwwroot/                     static assets the browser downloads
     Components/                  the root document and the router, with Layouts/
     Features/<FeaturePlural>/    features that never run in the browser
   <Component>.Client/            its entry point and the shared usings
     Features/<FeaturePlural>/    pages and typed clients that run in the browser
   ```

   Below `.Client/` the roles are the generic tree's.

## Done when

The project count matches the render mode.
