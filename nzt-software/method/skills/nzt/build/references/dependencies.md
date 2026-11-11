# Dependencies

Produces a dependency change — a package, library, plugin, store asset — and its row in
`tech.md`, in the same unit. A dependency in the manifest and not in `tech.md` is a decision
nobody made.

## Adding

1. **Does the project already do this?** A second library for the same job is two conventions.
2. **Is it worth it?** A dependency is permanent in practice; small problems are cheaper
   written than adopted.
3. **What comes with it?** Transitive weight, licence, maintenance, support for the version
   the project pins — **verified in a named source**, never from memory.
4. **The user confirms every new dependency**, with at least one alternative (another one, or
   writing it here) and each one's cost. Everything the unit needs goes in one question.
   Pause only what depends on it. No "just technical" exemption.
5. Install it, with the version the project's evidence dictates (lock file, manifest,
   central versions, SDK pin) — never "the newest" or what this machine has.

## Updating

Read what changed between versions first. Run what covers the code that uses it, not only
the build. A major version is its own unit. A known vulnerability is reported with what it
affects, even with no fix available.

## Removing

The usage first, then the dependency, then its `tech.md` row — string references included.

Copying a library's code in to avoid adding it is adopting it without updates or record:
vendoring is a decision with a written reason.

## Done when

Someone could tell in six months why it is here and what dropping it takes: the user
confirmed it, `tech.md` has its row (with version, what for, when), the version traces to
evidence, and unrelated manifest changes were reported.
