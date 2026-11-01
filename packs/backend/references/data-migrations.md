# Data migrations

A migration records **one schema or data change**, created only for a concrete operation — a
model change, an agreed data transformation, a database object outside the model.

## Steps

1. **Identify** the tool and its version, the provider, the handle, the projects involved and
   the existing tooling; read the intended change.
2. **Announce foreseeable manual editing before generating** (a rename, a data
   transformation, operations in an empty migration): what, why, how it is verified.
   Generating does not authorise customising; a need seen only in the output stops there to
   be proposed. A confirmation covers that exact edit.
3. **Generate with the tool — never write one by hand**, the empty data-only one included.
   The tool keeps state beside the migration (snapshot, checksum, history); a hand-made file
   breaks the *next* migration. If the tool does not run (not installed, no build, no entry
   point, no connection string), fix what is in scope or report the command, its failure and
   what is missing — **the migration is not done**.
4. **Read what came out**: an unrequested drop (usually a renamed property), a rename
   generated as drop + add (the data is lost on apply — propose a rename and confirm it).
   Unexpected destructive output is reported, not applied.
5. **Customise as agreed**, forward and reverse; check provider statements, data preservation
   and reversibility. Data that cannot be reconstructed is said, with its recovery.
6. **Verify** — build, inspect the statements, and on an authorised disposable database
   check representative data before and after and the reversal. Report inspection, build and
   execution separately: nothing executed means preservation untested.

## Rules

1. **Generating never authorises applying.** A local or disposable database can verify it; a
   shared environment is the release's (`nzt-ship`). An unknown connection string is not local.
   No apply on startup.
2. **Remove only the latest unapplied migration, with the tool.** One already in a shared
   environment is kept and corrected by a new one.
3. **The name says what changed** (*add customer tax id*), in the code's language and case —
   never a date or ticket. One coherent change per migration; a model changed again before
   applying regenerates it instead of stacking a second that cancels the first.

## Done when

A concrete operation justified it, the tool generated it, every manual edit was confirmed
before, nothing was applied beyond a disposable database, and the report separates
inspection, build and execution.
