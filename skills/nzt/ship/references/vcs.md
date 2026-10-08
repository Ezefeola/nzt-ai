# Version control

Produces commits, branches, tags and changelog entries. **Only when the user asked**:
finishing a unit is not an instruction to commit.

## The repository's rules win

Read them before anything else: the contribution guide, the commit convention, branch
naming, hooks, required checks. This skill describes how to work, not how this repository
works — where they disagree, the repository wins and you say so.

## Before committing

- **Look at what you are about to commit**: status and diff, not just the file list.
- Commit **only** what belongs to the requested work. Anything else is mentioned and left
  out — a commit that quietly carries unrelated changes is a commit nobody can revert
  cleanly.
- **Review the diff for secrets, local configuration and generated files.** A secret that
  reached a commit is **reported as exposed even if a later commit deletes it**: the history
  keeps it, so rotation is the fix, not deletion.

## One logical change per commit

- Each commit **compiles and stands on its own**. The migration travels with the code that
  needs it; splitting them produces commits that break in the middle of the history.
- Two reasons in one commit means neither can be reverted without the other.
- **The message says why**, not only what, and cites the stories or bugs it serves. *"Fix
  validation"* tells the next reader nothing they could not get from the diff.

## Branches

Follow the project's naming. If there is none, name the branch after the work, not after
yourself or the date.

Never commit to the default branch when the project works with branches — and when in
doubt, branch: an extra branch costs nothing, a direct push to main costs a revert.

## Never rewrite shared history

No force-push, rebase or amend over anything others may already have pulled, unless the
user explicitly asked for that exact operation.

- **Prefer a commit that reverts over rewriting published history.**
- Before any destructive operation, show what will be lost and confirm it.
- A published tag does not move. If it was wrong, publish another.

## The changelog

Written for **whoever uses the product**, not assembled from commit messages. Grouped:
added, changed, deprecated, removed, fixed, security.

- **Removed and changed always appear.** They are the entries a reader actually needs, and
  the ones a commit-derived changelog silently drops.
- Each entry says what it means for the reader, in their language — not the internal name of
  the module that changed.
- Semantic versioning: breaking changes are a major, and calling a breaking change a patch
  does not make it one.

## Done when

Rehearse it: could someone revert exactly this change, or read the changelog and know
whether it affects them?

- Every commit holds one logical change, compiles alone, and says why.
- Nothing unrelated was committed; what was left out was mentioned.
- No secret, local config or generated file is in the diff — and any secret that ever
  reached the history was reported for rotation.
- Nothing published was rewritten.
- The changelog entry is readable by someone who does not know the codebase.
