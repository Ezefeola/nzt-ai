# NZT trigger evals

Phase 6 of the roadmap: **does the right skill fire, and does nothing else fire**. The
suite is 13 cases in three groups, and each group measures one of the two failure modes.

| Group | Cases | What it measures |
|---|---|---|
| `routing/` | 6 | **Under-triggering.** A request phrased the way a user phrases it reaches the right phase router, and the kernel's stops hold |
| `stack/` | 4 | **The exclusive axes.** The stack document selects one option per axis and only that leaf loads |
| `restraint/` | 3 | **Over-triggering.** A question, a one-word edit and a repository that is not ours must load nothing |

Every case seeds its workspace with the **built kernel as `CLAUDE.md`**. That is not a
detail: NZT's routing is instructed there (R2), so a run without it measures description
matching — a different product than the one being built. `routing/kernel-loaded` is the
smoke case that proves the kernel arrived; **if it fails, no other result means anything.**

## Run it

The target is `dist/plugin/`, the flattened plugin the build assembles — the same flat
skill names the installer writes, so the suite evaluates what actually ships (D23).

```bash
bash install/build.sh                                    # refreshes dist/plugin and the kernel fixture
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

Roughly `cases × runs × 2` agent runs — 13 cases at the default 3 runs with the baseline
arm is **78 runs**, plus three judge calls per `llm` grader per run. Start with
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

**Cost, now that it is measured:** about US$0.31 per run of one case. The 13 cases at 3 runs
**with** the baseline arm are roughly **US$24**; with `--ablation none`, half. Run a group at
a time with `--tag`, not the whole suite at once.

## Adding a case

One directory, one `case.yaml`, one `scaffold.sh` that calls a fixture. Give it a grader on
**what was produced** and a grader on **how it got there** — the second is what tells you
the set did it. Prompts are written the way a user writes them: in Spanish, naming the work
and never the skill.
