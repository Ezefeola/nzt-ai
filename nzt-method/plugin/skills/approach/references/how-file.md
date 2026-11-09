# The how file

`Docs/How/how.md` says what the work is made with or by, for each part, and why: whoever
does a unit reads it before starting, and never chooses again what is written here. A part
that decides something of its own has its own `how.md` in its folder, for that only.

## The file

Headings fixed, in English; the rest in the person's language. Empty sections are not
written.

```markdown
# How — <work name>
Updated: <date>

## <Part, or "All of it">
| Decision | Choice | Why | What it implies |
|---|---|---|---|
| … | the real name of what is used | the person's reason, with H-NN | cost, effort, what can and cannot be done later |

## Agent's tools
What the agent works through for this, as recorded in the agent's tools file.

## By hand
What the person does themselves, step by step: install, create an account, sign, pay.

## Open
- H-NN · <question still open, and what it blocks>
```

## Rules

1. **Only choices the person made, or evidence already settled.** A recommendation not yet
   answered is an open question, never a row.
2. **Real names and versions** where they matter ("SQLite 3", ".NET 10", "Mudanzas Sur,
   truck for 4 hours"), so nobody guesses later.
3. **Why, in the person's reason,** citing the question where it was decided.
4. **What it implies,** so whoever works with it knows the limit: "local only: no sync
   between devices".
5. **Never what the work must do:** that belongs to the definition.
6. **A changed choice** replaces its row, and the reason goes in the how log as a new
   question that supersedes the old one.

## Example: something built (an app)

```markdown
# How — Task list
Updated: 2026-11-09

## All of it
| Decision | Choice | Why | What it implies |
|---|---|---|---|
| Where it runs | A web page served from this laptop | Only I use it, on the laptop (H-01) | Opened at http://localhost; not reachable from the phone |
| Made with | .NET 10 (ASP.NET Core) | I already work with .NET (H-02) | `dotnet run` to start it; the .NET 10 SDK is installed |
| Where tasks are kept | SQLite, file `tasks.db` in the folder | I want a real database, no server (H-03) | Copying the file is the backup |
| How it is checked | Opening it in the browser and trying each rule | — | No automated tests for now (H-04) |

## Agent's tools
- The official .NET documentation, to check APIs before using them.

## By hand
1. Run `dotnet run` in the folder and open the address it prints.
```

## Example: something done in the world (a house move)

```markdown
# How — Move to Caballito
Updated: 2026-11-09

## 01 · Movers
| Decision | Choice | Why | What it implies |
|---|---|---|---|
| Who moves us | A moving company, truck and 3 people | No car, a 3rd floor without lift (H-01) | Booked at least 10 days ahead; quoted by the hour |
| When | The 15th, 8 a.m. | Keys handed over at noon (H-02) | Everything packed the night before |

## 03 · Packing
| Decision | Choice | Why | What it implies |
|---|---|---|---|
| Boxes | Bought from the moving company | Same price, delivered (H-03) | They arrive 5 days before |

## By hand
1. Call the two companies on the list and ask for a quote for the 15th.
2. Sign and pay the deposit of the one you choose.

## Open
- H-04 · Who looks after the cat on the day? Blocks: the cat's plan.
```
