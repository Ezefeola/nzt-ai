# Interactive WebAssembly

Prerendering or persistent state: `prerendering.md` (standalone WebAssembly has no server
pass).

## Rules

1. **Caching, trimming and lazy loading change the startup cost**: measure.
2. **`@rendermode InteractiveWebAssembly` on the component that needs it**; no child of it
   uses another interactive mode.
3. **Test**: a cold load, interactive navigation, an unavailable API and restored state.

## Done when

Every rule holds and the tests of rule 3 ran.
