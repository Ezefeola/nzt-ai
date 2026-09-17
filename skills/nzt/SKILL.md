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
- All units `done` → the previous run finished. Treat the new request as a new run.
- `approved` is `false` → a plan was proposed and never approved. Show it again instead of
  writing a new one.
- `waiting_on` is set → say what it was waiting on before proposing anything new.

## 2. Read the ground

Only if there is no state, and only enough to classify. One cheap pass: top-level entries,
`Docs/`, `Plan/specs/`, README, project and package files. Do not read the source tree.

## 3. Classify

| What you see | Situation | Where the work starts |
|---|---|---|
| Empty or near-empty directory | New product | Functional analysis |
| Code, no `Plan/specs/` | Existing project, not on NZT | Depends on the request, see below |
| `Plan/specs/` and state | On NZT | Resume from the state |
| Code, no specs, user wants NZT adopted | Adoption | Reverse engineering, module by module |

**Before any of that, check whether this is a learning request.** "Teach me", "I want to
learn", "help me get better at" — the user wants the skill, not the software. Hand off to
`nzt-learn` and stop. That branch keeps its state in `Learn/<topic>/progress.md`, by
objective and with review dates, and has no entry in `Plan/state.json`.

For an existing project not on NZT, the request decides:

- **Small change** → do the work; write only the spec for what you touch.
- **New feature** → analysis for that feature only. Do not back-fill the whole product.
- **Reported bug** → reproduce, fix, verify. No specs, no plan, no ceremony.
- **"Put this project in order"** → adoption: reverse engineering.

## 4. Choose the phases

Name only the phases this work actually needs, in order. A phase earns its place when it
changes what gets built:

- **Analysis** — the request names a product, a feature, users or business rules.
- **Architecture** — new components, a stack choice, or cross-component interaction.
- **UX** — a person will look at a screen that does not exist yet.
- **Build** — always, if code changes.
- **Verify** — always, if behavior changes.
- **Ship** — the user asked for a release, a pipeline or a deploy.

Be able to say in one line why you skipped each phase you skipped. A one-line change needs
build and verify, nothing else. Skipping is normal; skipping silently is not.

## 5. Hand off

- The request is about learning a skill → load `nzt-learn` and stop here.
- Work spans more than one unit → load `nzt-plan` and stop here.
- Single unit → load the phase skill for it, per the routing table in your instructions,
  and do it. Report and stop when it is done.
- The request is a question, not work → answer it. NZT does not apply.

## Done when

You can say, in one line, which situation this is and which phases the work needs, and you
have handed off. This skill never produces an artifact.

## Rules

- Never propose a plan from this skill. That is `nzt-plan`.
- Never skip step 1. Resuming from a stale assumption costs more than reading a file.
- Never classify a project by its name or by what the user called it. Look at the ground.
- Say which situation you classified and why, in one line, before handing off. A wrong
  classification is cheap to correct now and expensive to correct three units later.
