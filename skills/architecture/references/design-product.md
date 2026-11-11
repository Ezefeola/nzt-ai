# Product architecture

Produces `Docs/Architecture/architecture.md` — the components, what each owns, how they talk
and why they are shaped so — with its questions in `Docs/Architecture/architecture-decisions.md`.
Every feature design fits into it. Technologies go to `tech.md`, entities to `domain.md`.

## Steps

1. Read `Docs/Product/product.md` (modules, constraints, scope) and the existing specs; on an
   existing product, read the product itself first.
2. The expensive questions are which components, how they talk, which providers and what
   each allows (the router's *Steps*).
3. For every component you are tempted to add, answer: which spec, constraint or objective
   requires it? What breaks without it? What does adding it later cost? The third answer
   goes in *Why*.
4. Write the file. It exists from the first `tech.md` section, even with one row.

## The file

```markdown
# Architecture — Pedidos

## Shape
A web application with one API and one browser client, one relational database, and one
outbound integration with billing.

## Components
| Component | Root | Owns | Talks to | Areas |
|---|---|---|---|---|
| `Pedidos.Api` | `Pedidos.Api/` | orders, coupons | Postgres, Billing (HTTP) | backend |
| `Pedidos.Web` | `Pedidos.Web/` | checkout screens | `Pedidos.Api` (HTTP) | frontend |

## Boundaries
- Coupon validity is decided in the API, never in the client.

## External systems
| Id | System | What we need | When it is unavailable |
|---|---|---|---|
| INT-01 | Billing | invoice for a confirmed order | order confirmed, invoice retried |

## Why it is shaped this way
- **Two components, not one**: they ship on different schedules. Costs one hop per screen.
- **Rejected: a promotions service.** One team, one database. Revisit if promotions get
  their own lifecycle.

## Open questions
QT-02 (in architecture-decisions.md).
```

## Rules

1. **A component is deployed or delivered and evolves on its own.** Two things that always
   ship together are one component. A module (a capability in `product.md`) is not a
   component.
2. Every component says **what it owns**; two owning the same decision is the defect this
   table catches. It lists its **areas** and its **root** (`./` when it is the only one).
3. Every non-obvious choice has its cost; every rejected option its reason and the trigger
   that would change the answer. A decision that earned an ADR (`adr.md`) names it here.
4. External systems get an `INT-NN`, assigned once; feature designs cite it.
5. Earned diagrams: `components` always, `context` with third parties or several actors.
6. What is not built yet is marked *planned*.

## Done when

Someone could design a feature against it without asking where something belongs.
