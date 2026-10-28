---
name: nzt
description: Use when work starts, when resuming a session, or when it is unclear which phase the work belongs to. Reads the state, classifies the request and picks the phases.
---

# NZT entry point

This skill decides **where the work starts and which phases it needs**. It does not do the
work and does not write specs, code or tests. It ends by handing off.

## 1. Read the state

If `Plan/state.json` exists, read it first, before asking the user anything.

- A unit with `status: "doing"` → that is where you are. Report it and continue there.
- All units `done` → the previous run finished. Treat the new request as a new run, which
  `nzt-plan` writes over it.
- `approved` is `false` → a plan was proposed and never approved. Show it again instead of
  writing a new one.
- `waiting_on` is set → say what it was waiting on before proposing anything new.

## 2. Read the ground

Only if there is no state, and only enough to classify. One cheap pass: top-level entries,
`Docs/`, `Plan/specs/`, README, project and package files. Do not read the source tree.

## 3. Classify and size

**First, two requests leave here** (§5): a learning request — "teach me", "I want to learn",
"help me get better at": the user wants the skill, not the software — and a question that is
not work.

Everything else gets one row. The size is read from what the work touches, never from how
the user phrased it:

| The request | Size | Where the work starts |
|---|---|---|
| A reported bug | Direct | Reproduce, fix, verify. No spec, no plan |
| A small change or a chore | Direct | The work itself; in a project without `Plan/specs/`, only the spec of what it touches |
| An improvement, or a feature of one or two stories that fits the current architecture: no new component, no stack decision, at most one new screen | Standard | Analysis for that feature |
| A new product, a feature of three or more stories, a new component, a stack decision, or several new screens | Full | Analysis, cut into slices |
| "Put this project in order", in code with no `Plan/specs/` | Full | Reverse engineering, module by module |
| Continue the work, with a state | — | Where §1 says |

| Size | How it runs |
|---|---|
| **Direct** | No plan and no state, even when `Plan/state.json` exists. The phases it needs, then report |
| **Standard** | A plan of `phases`, no slices, approved once |
| **Full** | Slices, cut by `nzt-plan` |

- **The documents each phase requires are declared by its router**, whatever the size. In a
  project not on NZT, never back-fill features nobody asked about.
- **In doubt, the lighter size.** When the work outgrows it — a fourth story, a component
  nobody planned — say so and propose the next size; never grow it silently.
- **Size cuts ceremony, never the definition of done**: criteria, coverage per area, `qa`
  and the user's acceptance hold at every size.

## 4. Choose the phases

Name only the phases this work actually needs, in order. A phase earns its place when it
changes what gets built:

- **Analysis** — the request names a product, a feature, users or business rules. Its
  router is `nzt-discovery`; the phase is always called *analysis*.
- **Architecture** — new components, a stack choice, or cross-component interaction.
- **UX** — a person will look at a screen that does not exist yet.
- **Build** — always, if code changes.
- **Verify** — always, if behavior changes. It is QA, and `nzt-plan` places it after build
  has finished the slice.
- **Ship** — the user asked for a release, a pipeline or a deploy.

Be able to say in one line why you skipped each phase you skipped. A one-line change needs
build and verify, nothing else. Skipping is normal; skipping silently is not.

The phases you name become the run's `phases` in `Plan/state.json`, in this order; a
skipped phase is not listed. **Full-size work, or work the user wants delivered early, is
cut into slices**, each with the phases it needs, starting with analysis: `nzt-plan` cuts
them. Say so in your one line.

## 5. Hand off

- The request is about learning a skill → load `nzt-learn` and stop here. So is one that
  continues a topic in `Learn/<topic>/` — a delivery to correct, an assessment, a review that
  is due. That branch keeps its state in `Learn/<topic>/progress.md`, never in
  `Plan/state.json`.
- The user accepted a feature and wants it closed → load `nzt-plan` and stop here: closing
  is its unit. Change markers still in the spec are what the close sweeps, not a new
  change — changing a feature through `nzt-discovery` is for a change that has not been
  agreed yet.
- Work spans more than one unit → load `nzt-plan` and stop here.
- Single unit → load the phase skill for it, per the routing table in your instructions,
  and do it. Report and stop when it is done.
- The request is a question, not work → answer it. NZT does not apply.

## Done when

You can say, in one line, which situation this is, its size and which phases the work
needs, and you have handed off. This skill never produces an artifact.

## Rules

- Never propose a plan from this skill. That is `nzt-plan`.
- Never skip step 1. Resuming from a stale assumption costs more than reading a file.
- Never classify a project by its name or by what the user called it. Look at the ground.
- Say which situation and size you classified and why, in one line, before handing off. A
  wrong classification is cheap to correct now and expensive to correct three units later.
