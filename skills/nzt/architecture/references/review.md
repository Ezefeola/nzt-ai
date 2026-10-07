---
name: nzt-architecture-review
description: Use when an existing structure has to be judged rather than designed: where changes, defects or load keep hurting, on evidence and never on taste.
---

# Architecture review

Produces **findings with proposals**, and changes nothing. Its output is a report whose items
end up somewhere that survives: a decision record, an entry of deferred work, a guard, or a
drift verdict.

If you did not arrive here from `nzt-architecture`, load it first.

Its risk is the opposite of every other reading here: **turning into taste**. That is why
every finding stands on evidence and on a requirement the product actually has.

> **A finding names the evidence, the quality it hurts, and the case that breaks.**

## Start from the question and the qualities

Write why the review was asked — changes are slow, defects cluster in one place, a component
does not scale, a boundary nobody understands — and cut the scope to it.

Then establish what this architecture has to optimise: the non-functional requirements of
the features, the constraints in `Docs/product.md`, the stack documents and the accepted
ADRs. **A structure is good or bad against those.** A monolith is not a finding; a monolith
that prevents a deployment the product requires is.

## Read what was declared, first

Read `Docs/architecture.md`, `Docs/context-map.md` if it exists, the stacks in scope and the
ADRs. Where the code contradicts them, **that is drift, not a finding of this reading**:
report it as a verdict, or run `nzt-verify-audit` when the cut deserves one. The rest of the
review starts from the architecture as it actually is.

## Structural evidence

Measure the dependencies instead of imagining them: project references, imports and
namespaces say the direction.

- **Direction.** Dependencies pointing against the declared layers, or from a core outward
  into infrastructure.
- **Cycles** between projects, modules or contexts.
- **Mixed responsibilities.** One component serving several contexts, or one business
  concept spread across components.
- **Hidden sharing.** Two components writing the same tables, a shared model that couples
  their deployments, a synchronous chain where one failure takes the others down.

Record each one with the reference that shows it: the file, the project, the count.

## Change-history evidence

Version control shows how the system actually evolves, which structure alone cannot. Over a
stated period, usually the last six to twelve months:

- **Hotspots** — files that change often **and** are large or complex. Improving one pays
  back on every future change; a messy file nobody touches can wait.
- **Change coupling** — files in different modules that keep changing in the same commit. It
  is usually a hidden dependency, or a boundary drawn in the wrong place.

```bash
git log --since="12 months ago" --name-only --format= | grep -v '^$' \
  | sort | uniq -c | sort -rn | head -30
```

**State the limits of this evidence**, always: squashed merges, renames, generated files,
bulk reformatting and a short history all distort the counts.

## Runtime evidence

When the question is about performance, availability or scale, use measurements: logs,
traces, metrics, incidents, load results. **Without them the finding is a hypothesis**, and
it says so, with how it would be measured before anything is changed. A measurement of one
scenario is `nzt-verify-performance`'s, and its numbers are valid evidence here; what only
shows under real traffic comes from what `nzt-ship-observability` instrumented.

## The findings

```text
[2] Pedidos ↔ Stock are one deployment pretending to be two
    Evidence: 23 of the 31 commits touching Pedidos/Reservas.cs in 12 months also touch
              Stock/Disponibilidad.cs; Pedidos reads Stock's table directly
    Hurts:    Stock's independent deployment, required by Docs/product.md
    Case:     changing how Stock stores reservations forces Pedidos to ship with it
    Options:  a) Stock exposes availability by contract · medium cost, removes the
                 coupling (recommended)
              b) document the dependency and accept it · free, and the constraint stops
                 being met
    Becomes:  an architecture decision
```

- **Order by impact on the stated qualities, and by how often the area changes.** Let the
  reader disagree with the order.
- **Every proposal has an incremental path.** A rewrite is not a proposal unless the evidence
  shows no incremental path exists, and then it says why.
- **No severity field.** What it costs is read off *Hurts* and *Case*; a number you invented
  would be weighed instead of the evidence.

Each finding says where it lands, and that is what makes the report actionable:

| Becomes | Where it goes |
|---|---|
| an architecture decision | proposed now, recorded as an ADR once the user decides |
| deferred work | `Docs/tech-debt.md`, with its evidence |
| a guard | a test that fails when the rule breaks again, written by `nzt-build` |
| drift | a verdict of `nzt-verify-audit`, not a new decision |

A guard is written with the framework the stack already has. A library for it is a
dependency decision, not a detail.

## What this reading does not do

- **It does not change the architecture.** A material change is the user's decision, and it
  goes back through `nzt-architecture-design-product`.
- It does not report style, pattern fashion or a rewrite as a finding.
- It does not hunt defects line by line — that is `nzt-verify-review`.
- It does not present a hypothesis as a fact.

## Done when

Rehearse it: could the user pick one finding and act on it, or argue with it, using only
what the report says?

- The question, the scope and the qualities being measured against are stated.
- Every finding has evidence, the quality it hurts, a concrete case and options with cost.
- Structural, history and runtime evidence are distinguished, each with its limits.
- Every proposal names an incremental path and where it lands.
- What was reviewed and found adequate is reported, and so is what could not be measured.
- Nothing was proposed as a finding on taste alone.
