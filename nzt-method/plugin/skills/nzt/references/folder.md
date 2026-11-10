# The work's folder

One folder per work. Everything the method keeps lives here, sorted by what it is about, so
each skill reads only what it needs and a new session can resume from the files alone.

## The map

```
Docs/
  General/              what holds for the whole work, never how it is made
    definition.md       what it is, for whom, what is in and out, its parts   (define)
    questions.md        questions about what, Q-NN                            (define)
    glossary.md         the work's words, in both languages                   (any skill)
    change.md           only while a change to several definitions waits      (define)
  How/                  how the whole work is made
    how.md              what is used for each part, and why                   (approach)
    questions.md        questions about how, H-NN                             (approach)
    agent-tools.md      the tools the agent works through                     (tools; do marks Checked)
  Parts/
    <NN>-<name>/        one folder per part, created when the part is defined
      definition.md     what this part covers, its rules and limits,
                        the index of its capabilities                         (define)
      questions.md      its questions, what and how                           (define, approach)
      <NN>-<name>.md    one capability: what can be done or achieved,
                        with its acceptance criteria                          (define)
      how.md            only if the part decides something of its own        (approach)
      change.md         only while a change waits for approval               (define)
  Retros/               one file per retro                                    (retro)
Plan/
  state.md              where the work stands                                 (plan, do, learn)
<result folders>        what the work produces, one folder per piece          (do)
```

## Rules

- **Folder and file names are fixed, in English;** what is written inside is in the person's
  language. A part's or a capability's `<name>` is its English name in the glossary, short,
  after a two-digit number (`01-tasks`, `02-edit`; `02-catering`, `01-taste-the-menu`).
- **A part is what is understood, accepted and grows on its own** (a module of an app, a
  stage of a move, a section of a course). Two levels only: a part and its capabilities. A
  part that grows past about eight capabilities is split into two parts.
- **A file exists only once it has content.** A direct task leaves none of these; a
  planned work usually has `General/`, `How/` and `Plan/`; parts appear as they are
  defined, and a capability's file when its unit is near.
- **Each file has one owner,** in brackets above. Another skill that needs a change asks
  its owner: `do` never edits a definition, `define` never writes `how.md`.
- **The result lives in its own folders,** never loose at the root beside `Docs/` and
  `Plan/`: one folder per piece of the work's shape, named as `how.md` says (`TaskList.Api/`
  and `TaskList.Web/`; `Manuscript/`; `Invitations/`). A single piece still gets its
  folder. In existing work, the layout it has is kept; moving anything is proposed and
  asked, never done alone.
- **Any other file** (a draft, a checklist for the person) goes in the result folder or the
  part's folder it belongs to; never loose in `Docs/`.
