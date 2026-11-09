# The how file

`Docs/How/how.md` says what the work is made with or by, for each part, and why: whoever
does a unit reads it before starting, and never chooses again what is written here. A part
that decides something of its own has its own `how.md` in its folder, for that only. It
starts from `assets/how.md`: headings fixed, in English; the rest in the person's language;
empty sections are not written.

## Rules

1. **Only choices the person made, or evidence already settled.** A recommendation not yet
   answered is an open question, never a row.
2. **One line per decision.** The options, the discussion and the long reasons live in the
   how log (`H-NN`); `how.md` is read in a minute.
3. **Real names and versions** where they matter ("PostgreSQL 17", ".NET 10", "Mudanzas
   Sur, truck for 4 hours"), so nobody guesses later.
4. **Why, in the person's reason,** citing the question where it was decided.
5. **What it implies,** so whoever works with it knows the limit: "local only: no sync
   between devices".
6. **A convention is one line** that the work cannot deduce from the rest; anything longer
   is a decision with its own row.
7. **Never what the work must do** (that is the definition) **nor the agent's tools** (that
   is `Docs/How/agent-tools.md`).
8. **A changed choice** replaces its row, and the reason goes in the how log as a new
   question that supersedes the old one.

## Example: something built (an app)

```markdown
# How — Task list
Updated: 2026-11-09

## All of it
| Topic | Decision | Choice | Why | What it implies |
|---|---|---|---|---|
| Base | Where it runs | A web page served from this laptop | Only I use it, on the laptop (H-01) | Not reachable from the phone |
| Base | Made with | Python 3.13 with FastAPI | I know Python (H-02) | `uvicorn` starts it |
| Base | Where tasks are kept | PostgreSQL 17, local | I want a real database (H-03) | Must be running; a dump is the backup |
| Structure | How the code is split | One folder per feature | Easy to remove a feature (H-04) | Some code repeats between features |
| Quality | Automated tests | Unit tests for the rules, one end-to-end test of the list | I want to change it without fear (H-05) | Each rule ships with its test |
| Delivery | How I use it | Started by hand on the laptop | No server to pay (H-06) | Off when the laptop is off |

## Conventions
- Code and names in English, messages to the user in Spanish (H-07).

## Not applicable
- Dependencies: only the framework and the database driver, both under Base.

## By hand
1. Install PostgreSQL 17 and create the `tasks` database.
```

## Example: something done in the world (a house move)

```markdown
# How — Move to Caballito
Updated: 2026-11-09

## 01 · Movers
| Topic | Decision | Choice | Why | What it implies |
|---|---|---|---|---|
| Base | Who moves us | A moving company, truck and 3 people | No car, 3rd floor without lift (H-01) | Booked 10 days ahead; quoted by the hour |
| Structure | Who coordinates the day | I am at the old flat, my sister at the new one | We cannot both be at both (H-02) | She needs the new keys the day before |
| Quality | How we check nothing is lost | Numbered boxes and a list per room | Last move we lost a box (H-03) | Each box is listed as it is closed |

## Not applicable
- Conventions: a one-day job with two people.

## By hand
1. Call the two companies on the list and ask for a quote for the 15th.

## Open
- H-04 · Who looks after the cat on the day? · blocks: the cat's plan
```
