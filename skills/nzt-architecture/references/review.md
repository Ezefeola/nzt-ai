# Architecture review

Produces **findings with proposals** and changes nothing. Each finding lands in a document
that survives: an ADR, a debt entry, a guard, or a drift verdict. **A finding names the
evidence, the quality it hurts, and the case that breaks** — otherwise it is taste.

## Steps

1. **State the question** (changes are slow, defects cluster, it does not scale) and cut the
   scope to it.
2. **State the qualities** it must optimise: the features' non-functional requirements,
   `product.md`'s constraints, `tech.md`, the ADRs. A monolith is not a finding; one that
   prevents a required deployment is.
3. **Read what was declared** (`architecture.md`, `tech.md`, the ADRs). Where the product
   contradicts it, that is drift: a verdict (`nzt-verify`'s audit), not a finding here.
4. **Gather evidence**, each with its limits:
   - *Structure*: measured dependencies — direction against declared layers, cycles, mixed
     responsibilities, hidden sharing (two components writing the same data).
   - *History* over a stated period: hotspots (changed often **and** large) and change
     coupling (files in different modules changing in the same commit):
     ```bash
     git log --since="12 months ago" --name-only --format= | grep -v '^$' \
       | sort | uniq -c | sort -rn | head -30
     ```
     Squashed merges, renames, generated files and bulk reformatting distort it.
   - *Runtime*: logs, traces, metrics, incidents, load results. Without them a performance
     finding is a hypothesis, with how it would be measured.
5. **Write the findings**, ordered by impact on the qualities and how often the area changes:

   ```text
   [2] Pedidos ↔ Stock are one deployment pretending to be two
       Evidence: 23 of 31 commits touching Reservas also touch Disponibilidad
       Hurts:    Stock's independent deployment, required by product.md
       Case:     changing how Stock stores reservations forces Pedidos to ship with it
       Options:  a) Stock exposes availability by contract · medium cost (recommended)
                 b) accept and document it · free, the constraint stops being met
       Becomes:  an architecture decision
   ```

   Every proposal has an incremental path; a rewrite only when evidence shows there is none.
   No severity field. `Becomes`: an ADR once the user decides, a `tech-debt.md` entry, a
   guard test (`nzt-build`, with the framework already in use), or a drift verdict.
6. Report what was found adequate and what could not be measured.

## Done when

The user can act on or argue with any finding using only the report.
