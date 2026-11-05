# NZT trigger evals

Phase 6 of the roadmap: **does the right skill fire, and does nothing else fire**. The
suite is 40 cases in four groups: three measure one of the two failure modes each, and `skill/` measures that the plugin's `nzt:nzt`, which carries the kernel, loads first (specs/nzt-plugin.md, QT-109).

| Group | Cases | What it measures |
|---|---|---|
| `routing/` | 20 | **Under-triggering.** A request phrased the way a user phrases it reaches the right phase router, and the kernel's stops hold; `pack-setup` measures that a fresh clone gets its listed packs proposed, not installed unasked, and `tool-research` that choosing an agent's tools looks at the catalogue and researches too (DB-03) |
| `stack/` | 7 | **The packs' exclusive axes, and the conventions they carry.** `Docs/Architecture/tech.md` selects one value per axis, only that reference of the pack loads, and its rules show up in the emitted code. The packs are installed in the workspace as project skills (`.claude/skills/nzt-<pack>/`, D88), so a reference is graded as a `Read` of its file there |
| `restraint/` | 9 | **Over-triggering.** A question, a one-word edit, a diagram nobody earned, a design nobody asked for, a test level nobody enabled, QA in the middle of building, a package nobody confirmed and a repository that is not ours must load nothing |
| `skill/` | 4 | **The kernel inside `nzt:nzt`.** No `CLAUDE.md` in the workspace, like every case since QT-111: `nzt:nzt` has to be the first skill loaded, before any other and before any edit, for a feature, a story, a one-word change and a question (QT-110). `implement` and `small-edit` need `--allow-tools Edit Write` |

Since QT-111 **no case seeds `CLAUDE.md`**: the kernel reaches the run only inside the plugin's
`nzt:nzt`, which is how NZT ships (D92). A seeded kernel would load it twice and measure the
old product. Where a case once said "no skill", it now says "no skill but `nzt:nzt`"
(`restraint/trivial`). `routing/kernel-loaded` is the smoke case that proves `nzt:nzt` loaded; **if it fails, no other result means anything.**

## Run it

The target is `dist/plugin/`, the flattened plugin the build assembles — the same flat
skill names the installer writes, so the suite evaluates what actually ships (D23).

```bash
bash install/build.sh                                    # refreshes dist/plugin and the pack fixtures
claude plugin eval dist/plugin --scaffold --case kernel-loaded --ablation none
claude plugin eval dist/plugin --scaffold --tag smoke
claude plugin eval dist/plugin --scaffold --threshold 0.8
```

- **`--scaffold` is required.** Every case builds its workspace with a Bash script, and the
  runner refuses to run one unless you pass it. These scripts are in this repository and
  run as you — read them once before you trust them.
- **Rebuild before every run.** `dist/plugin/` is generated, and `install/build.*` copies
  this directory and the freshly built `CLAUDE.md` into it. A stale build evaluates a stale
  kernel.
- **`--ablation none` halves the cost** by skipping the no-plugin arm. Use it while
  iterating on a case; use the default when you want to know what NZT contributed.
- **Results land in `dist/plugin/evals/results/`, which the next build deletes.** To keep
  one, pass `--report evals/results/<fecha>.html`.

## What a run costs

Roughly `cases × runs × 2` agent runs — 20 cases at the default 3 runs with the baseline
arm is **120 runs**, plus three judge calls per `llm` grader per run. Start with
`--case kernel-loaded`, then `--tag smoke`, then the whole suite.

## Reading the result

- **`WITH` and `W/OUT`, and `Δ`.** Δ is what NZT contributed. **A case that scores 1.0 in
  both arms is not measuring NZT** — the model would have done it anyway, and the case needs
  a sharper grader or it is not worth its cost.
- **`tool_used: Skill` graders are indicators, not score.** They cannot pass without the
  plugin, so they are excluded from both arms and reported in the with-arm only. The
  "must not load" graders carry `arm: both` so they are scored in both — that is deliberate:
  over-triggering is a failure the baseline can fail too.
- **A failing `llm` grader with a passing skill grader is usually the judge**, not the set.
  Re-run with `--judge-model sonnet` before believing it.

## What the first run settled

Run on 2026-09-17: `kernel-loaded`, 3 runs, no ablation arm, 247s, **US$0.94**.

1. ✅ **A `CLAUDE.md` seeded into the workspace does reach the child session.** The entry
   point fired, the project was read, and the reply proposed instead of executing — which is
   kernel behaviour, not the model's own. The scaffold works on Windows.
2. ✅ **The skill name resolves inside the plugin.** The graders accept both the bare and the
   namespaced form, so **which one it used is still unknown**, and it does not matter: it
   resolves.
3. **Score 0.83** — two runs at 1.00 and one at 0.50. The one that failed ran out of turns
   (`max_turns: 14`), and with no final message the two graders that read the reply fail on
   their own. **That was a calibration defect in the case, not in the set**; every case's
   turn and time caps were raised afterwards, and the case then scored **1.00** on a
   confirming run.

**Cost, now that it is measured:** about US$0.31 per run of one case. The 20 cases at 3 runs
**with** the baseline arm are roughly **US$38**; with `--ablation none`, half. Run a group at
a time with `--tag`, not the whole suite at once.

**The twelve newest cases have not been run** — `close-feature`, `diagram-offered` and
`no-diagram` came with the second pass over Temper (13.12), `test-data` with D36, `manual`
with D37, `entity-shape` and `result-inline` with D38 and D39, `design-mode` and
`design-unasked` with D41, `test-levels-unasked` with D42, `qa-unasked` with D43, and `package-unasked` with D44. They are calibrated the way the others were **after** their first
run, not before it. Expect the first run of each to be a calibration run.

**No case has been run since D88.** The workspaces moved to `Docs/Architecture/tech.md`, the
packs are seeded as project skills, `entity-shape` lost its second-part grader with the
file, and `routing/pack-setup` and `routing/tool-research` are new: the first run of each is
a calibration run. The `ux-*` cases are `design-*` since D88, graded the same way.

**`routing/retro` has not been run either** (D87). `nzt-retro` has no row in the kernel's
routing table, so its description is its only trigger: this case is what says whether that
is enough.

**`test-levels-unasked` has no pair yet.** It measures only the restraint half of D42 —
that no level gets built without its opt-in. That a tech.md being written *asks* for the
levels is not measured, and a set that passes this case has not been shown to do it.

**`design-mode` and `design-unasked` are a pair and are read together.** One measures that
the questions get derived and the mode gets asked; the other, that neither happens when
nobody asked for a design. A set that passes the first and fails the second has not fixed
the behaviour — it has moved the over-triggering one step earlier.

## What the plugin cases settled (retired)

The three `plugin/` cases measured the block `/nzt:setup` wrote. They were removed with the
setup design in unit 476 (QT-109); the record stays because it explains the decision.

Calibration run on 2026-11-04, Claude Code 2.1.312, one run per case: **US$1.00** in
all, measured. Reports in `evals/results/2026-11-04-plugin-*.html`. `--case` keeps only
the last one when repeated: run one case per call.

| Case | Arms | Score | What it showed |
|---|---|---|---|
| `plugin-names` | with | 1.00 | `nzt:nzt` and the next router loaded by their plugin names, no bare name: QT-97's option A holds, so far on one run |
| `plugin-setup-unasked` | with, `--allow-tools Edit Write` | 1.00 | no setup skill, no edit; it compared the block's version with `plugin.json` and pointed to `/nzt:setup` |
| `plugin-guard` | with / without | 1.00 / 0.67 | without the plugin it warned once, with the install line and how to remove the block, and loaded nothing. Then it answered with NZT's shape anyway: phases spec → stories → design → build and options marked *(recommended)*. `guard-or-method` failed on that, 3 of 3 judge votes |

The user settled `plugin-guard`'s without-arm the same day (QT-106 in `specs/nzt-plugin.md`):
without the plugin, not applying NZT means warning once and not running the loop - no skills,
no `Plan/state.json`, no plan in units waiting for approval - and the answer's style does not
count. `guard-or-method` was rewritten to say that, and **has not been re-run since**.

## What the skill cases settled

Run on 2026-11-05, Claude Code 2.1.318, 3 runs per case, with-arm only, no `CLAUDE.md` in
the workspace: **US$3.15** in all, measured. Reports in `evals/results/2026-11-05-skill-*.html`.
The order below was read from each run's trace, not only from the judge.

| Case | Score | First tool, 3 of 3 | What it did after |
|---|---|---|---|
| `skill-question` | 1.00 | `Skill(nzt:nzt)` | answered from the docs and the code; read `references/entry.md` in 1 of 3 |
| `skill-small-edit` | 1.00 | `Skill(nzt:nzt)` | changed the label in 2 runs; in 1 it wrote `Plan/state.json` instead of editing |
| `skill-implement` | 1.00 | `Skill(nzt:nzt)` | read the entry, wrote a plan as not approved and wrote no code; 1 of 3 also wrote `Docs/Architecture/architecture-decisions.md` before approval |
| `skill-feature` | 1.00 | `Skill(nzt:nzt)` | read the entry, proposed a plan pending approval, nothing executed |

Measured live in unit 475: after `/compact`, Claude Code restores `nzt:nzt` by itself; with the
plugin disabled, nothing of NZT is left.

## Adding a case

One directory, one `case.yaml`, one `scaffold.sh` that calls a fixture. Give it a grader on
**what was produced** and a grader on **how it got there** — the second is what tells you
the set did it. Prompts are written the way a user writes them: in Spanish, naming the work
and never the skill.
