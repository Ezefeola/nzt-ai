---
name: nzt-build
description: Use when the work is produced or changed - implementing a story, fixing a defect, refactoring, removing behavior, touching dependencies or secrets, and the automated tests that ship with it.
---

# Build — producing the work

Turns one story into working product and marks its criteria's areas. **Owns** the work, its
setup and the automated tests that ship with it. **Does not own** what to build
(`nzt-discovery`), how it is structured (`nzt-architecture`), or the test plan, its data and
its runs (`nzt-verify`): what the enabled test levels cannot reach is reported as *not
covered until QA*.

## References

| The unit is | Read | Read with |
|---|---|---|
| Surveying what exists before changing it | `references/recon.md` | — |
| Implementing a story, or repairing a reported defect | `references/implement.md` | `references/tests.md` |
| Changing structure without changing behavior | `references/refactor.md` | `references/tests.md` |
| Removing a behavior | `references/remove.md` | — |
| Adding, updating or removing a dependency | `references/dependencies.md` | — |
| Credentials or sensitive configuration | `references/secrets.md` | — |
| Writing the test first — **only if `tech.md` selected test-first** | `references/tdd.md` | `references/tests.md`, `references/implement.md` |

Writing what a person sees (a screen, a page, a component's look) also reads
`../nzt-design/references/generic.md` first.

## Steps

1. **Read the story**, its criteria, the rules it cites and the glossary. A domain term with
   no glossary entry stops the work that names it until `nzt-discovery` writes it.
2. **Read `tech.md`** for the component and area you touch, and **load `nzt-software`**
   for code (kernel *Software rules*). It says how this technology does it; these
   references say what holds anywhere.
   - Only what `tech.md` declares applies: a rule for a technology it does not declare does not.
   - A missing fact is checked in the project (manifests, configuration, the work already
     there), never invented. When `tech.md` and the manifest disagree, the manifest wins
     and you report it. A mechanism `tech.md` does not record is a gap: ask once, write it.
3. **Choose the escape** when it applies: a small edit in an established place follows the
   convention next to it; work in a part this project does not document follows how that
   part is written, and the difference is reported, not applied.
4. **Do the unit** with its reference. Project setup the technologies need is authorised
   work before the first story; a dependency `tech.md` does not list is not setup.
5. **Run the checks** the unit owns and **mark coverage** on the criteria you built.
6. Keep `tech.md` and affected documents current in the same unit.

## One unit

One story. Its criteria, with their area marks (`backend ✓ · frontend — · qa —`), are its
closing list. A story too big for one unit is cut by behavior, never by file or area.

## Where it lands

The work and its tests go wherever the project's structure puts them — follow it. Coverage
marks go on the story's criteria in `Plan/specs/<feature>/stories/US-NNN-<slug>.md`.

## Rules

- **Read before writing**: the existing work is the specification of how it is done here.
- **No work no spec asks for**, outside authorised setup and repairs to your own change.
- Work you find and do not do is reported; deferred by the user, it becomes a
  `Docs/Architecture/tech-debt.md` entry — never a comment, never silence.
- A change marker is `nzt-discovery`'s authorisation: never add or clear one.
- **Generated artifacts come from their command**, never by hand (a migration is the usual
  case). If the command does not run, the artifact is not written.
- Never claim it works because it compiles or renders; report skipped edges, stubs, deferrals.
- No commits unless asked (`nzt-ship`); deploying is never implicit.

## Done when

The unit's reference *Done when* holds, the checks ran and their real result is reported,
and what they cannot reach is listed as not covered until QA — never as green.
