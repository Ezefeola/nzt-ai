# Backend domain — anemic model

**Entities are data; the rules live in the use case.** A decision, not an omission: the use
case is the one place anything is decided, and reading it top to bottom shows the whole
operation.

## Rules

1. **The entity**: public settable properties, its id, foreign keys and navigations,
   collections initialised where declared. **No methods, no factory, no private setters, no
   validation**, and no behaviour attached from outside — that is a rich model with extra
   steps.
2. **`Rules` and `Errors` still live on the entity**, as in DDD: a `Rules` group with the
   values the business fixed and an `Errors` group with the messages (in the story's
   language). They are constants; the use case reads `Order.Rules.X` and returns
   `Order.Errors.Y` instead of declaring its own. A rule about a value the entity does not
   store (a password behind a hash) is still the entity's; a failure naming no business
   concept is the operation's.
3. **Member order**: `Rules`, `Errors`, then every property together. A property added later
   joins the properties.
4. **Every business rule runs in the use case** — its entry or a private method — and input
   checks in its validator.
5. **A rule two use cases need is written in each**, never a shared class, helper or domain
   service: each use case stays independent. The copies stay correct only while the rule is
   **stated outside the code**; a rule with no stated source is a gap to report.
6. **Never**: one entity with methods "because it was complex" (two models with no rule — DDD
   is a `tech.md` change for the whole project), a service wrapping the use case, rules in
   the mapper.

## Done when

Entities have no methods, every value and message is in `Rules`/`Errors`, and every
duplicated rule has a stated source.
