# The work's folder

One folder per work. Everything the method keeps lives here, sorted by what it is about, so
each skill reads only what it needs and a new session can resume from the files alone.

## The map

```
Docs/
  General/              what holds for the whole work, never how it is made
    definition.md       what it is, for whom, what is in and out, its parts   (define)
    questions.md        questions about what, Q-NN                            (define)
    glossary.md         the work's words                                      (any skill)
  How/                  how the whole work is made
    how.md              what is used for each part, and why                   (approach)
    questions.md        questions about how, H-NN                             (approach)
    agent-tools.md      the tools the agent works through                     (tools)
  Parts/
    <NN>-<name>/        one folder per part, created when the part is defined
      definition.md     what this part does, its rules and criteria           (define)
      questions.md      its questions, what and how                           (define, approach)
      how.md            only if the part decides something of its own        (approach)
      change.md         only while a change waits for approval               (define)
  Retros/               one file per retro                                    (retro)
Plan/
  state.md              where the work stands                                 (plan, do, learn)
```

## Rules

- **Folder and file names are fixed, in English;** what is written inside is in the person's
  language. A part's `<name>` is the person's name for it, short, after a two-digit number
  (`01-payments`, `02-catering`).
- **A file exists only once it has content.** A direct task leaves none of these; a
  planned work usually has `General/`, `How/` and `Plan/`; parts appear as they are defined.
- **Each file has one owner,** in brackets above. Another skill that needs a change asks
  its owner: `do` never edits a definition, `define` never writes `how.md`.
- **Any other file** (a deliverable, a draft, a checklist for the person) goes where the
  work's own conventions put it, or in the part's folder it belongs to; never loose in
  `Docs/`.
