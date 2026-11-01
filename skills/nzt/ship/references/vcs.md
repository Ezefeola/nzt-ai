# Version control

Produces commits, branches, tags and changelog entries — **only when the user asked**.
Finishing a unit is not an instruction to commit. Say where the repository's rules differ
from this.

## Steps

1. **Look at what you will commit**: status and diff, not the file list. Commit only what
   belongs to the requested work; mention and leave out the rest.
2. **Review the diff** for secrets, local configuration and generated files. A secret that
   ever reached history is reported as exposed — rotation is the fix, not deletion.
3. **One logical change per commit**, building on its own (a migration travels with the work
   that needs it). The message says **why** and cites its stories or defects.
4. **Branch** by the project's naming, or after the work. Never commit to the default branch
   when the project uses branches; in doubt, branch.
5. **Never rewrite shared history** (force-push, rebase, amend over what others may have
   pulled) unless the user asked for that exact operation. Prefer a revert commit. Before
   anything destructive, show what is lost and confirm. A published tag never moves.
6. **The changelog is for whoever uses the product**, grouped added · changed · deprecated ·
   removed · fixed · security. Removed and changed always appear, in the reader's language.
   Semantic versioning: breaking is major.

## Done when

Someone could revert exactly this change, or read the changelog and know whether it affects
them.
