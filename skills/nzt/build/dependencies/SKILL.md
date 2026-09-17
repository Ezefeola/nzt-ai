---
name: nzt-build-dependencies
description: Use when a package is added, updated or removed: what was checked before adopting it, what the update could break, and the stack document updated.
---

# Dependencies

Produces a dependency change and the stack document that records it, in the same unit. A
package that is in the manifest and not in the stack is a decision nobody made.

If you did not arrive here from `nzt-build`, load it first.

## Before adding one

Three questions, in this order:

1. **Does the project already do this?** A second library for something the project already
   solves is two conventions for one job, and the newer one always looks better in the
   moment.
2. **Is it worth the cost?** A dependency is permanent in practice: it gets updated,
   audited, and inherited by everyone who touches this code. Small problems are cheaper
   written than adopted.
3. **What does it bring with it?** What it pulls in transitively, its licence, whether it is
   maintained, and whether it supports the framework version this project is pinned to.

**Verify those in the authoritative source and name it.** What you remember about a
package's state is not evidence, and the ecosystem moves faster than memory.

A dependency that shapes how the code is written — a framework, an ORM, a DI container, a
UI library — is not an implementation detail. Propose it with its alternative and its cost,
and let the user decide.

## Versions come from the project

- Read the version from the project's own evidence: the lock file, the manifest, the
  central versions file, the SDK pin. **Never from what is newest and never from what
  happens to be installed on this machine.**
- **When the stack document and the manifest disagree, the manifest wins**, and the
  discrepancy is reported so the document gets fixed.
- **Never raise a version to make an example compile.** That is a stack change, and it goes
  through the stack's own door with its own decision.
- If the project centralises versions, the new package goes there too. A version pinned in
  one project and floating in another is the bug you find at deploy time.

## Updating

- Read what changed between the versions before running it. A minor number is a claim, not
  a guarantee.
- **Run what covers the code that uses it**, not just the build. A package update that
  compiles and changes behavior is the expensive kind.
- A major version is its own unit. Bundling it with feature work means every failure has
  two possible causes.
- A known vulnerability is a reason to update and is reported as such, with what it affects
  — including when the fix is not available yet.

## Removing

In this order: the code that used it goes first, then the package, then the stack document.
Removing the package while a call site survives gives you a build error; removing it while
a *string* reference survives gives you a runtime one.

## Do not route around it

Copying a library's code into the project to avoid adding it is still adopting it — without
the updates, the security fixes or the record. If it is worth vendoring, that is a decision
with a reason, written down.

## Closing

- What is affected compiles, and the checks covering the code that uses the package have
  been run.
- The stack document names the package, its version and **why it is here**, in this same
  unit.
- The manifest and lock file changes are the ones you intended. An unrelated version that
  moved is reported, not shipped quietly.

## Done when

Rehearse it: could someone tell, six months from now, why this package is in the project
and what it would take to drop it?

- The stack document has its row, with the reason.
- The version traces to the project's own evidence.
- What the update or removal could break was run, not reasoned about.
- Licence, maintenance and transitive weight were checked in a named source.
