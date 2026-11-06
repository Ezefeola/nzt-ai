# Backend domain — anemic model

**Entities are data; the rules live in the use case**, so reading it top to bottom shows the
whole operation.

## Rules

1. **The entity**: public settable properties, its id, foreign keys and navigations,
   collections initialised where declared.
2. **No methods, no factory, no private setters, no validation** on the entity, and no
   behaviour attached from outside.
3. **`Rules` and `Errors` still live on the entity**: `Rules` holds the values the business
   fixed, `Errors` the messages in the story's language. The use case reads `Order.Rules.X`
   and returns `Order.Errors.Y`, never its own copy.
   - A rule about a value the entity does not store (a password behind a hash) is still the
     entity's.
   - A failure naming no business concept is the operation's.
4. **Member order**: `Rules`, `Errors`, then the properties.
5. **Every business rule runs in the use case** — its entry or a private method; input checks
   in its validator.
6. **A rule two use cases need is written in each**, never a shared class, helper or domain
   service.
7. **Every duplicated rule has a source stated outside the code**; one without it is a gap
   to report.
8. **Never** one entity with methods "because it was complex" (moving to DDD is a `tech.md`
   change for the whole project), a service wrapping the use case, or rules in the mapper.

## Done when

Every rule holds for the entities and use cases you touched.
