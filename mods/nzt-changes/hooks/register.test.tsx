import { expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

import { EMPTY_TREE } from './git'

type Engine = Parameters<TestBody>[0]
type On = Parameters<TestBody>[1]

type Git = {
  root?: string
  hasHead?: boolean
  status?: string
  numstat?: string
  diff?: string
  fail?: string
}

const run = (stdout: string, exitCode = 0, stderr = '') => ({
  value: { exitCode, stdout, stderr, isStdoutTruncated: false, isStderrTruncated: false },
})

const PANE = {
  title: 'Cambios',
  isFocused: true,
  bodyColumns: 60,
  placement: 'dock',
  scroll: { offset: 0, bodyRows: 40 },
  view: {},
} as const

const SURFACES = ['terminal', 'desktop'] as const

/** What every `ui.open` asked for, in order. */
const opens: Record<string, unknown>[] = []

/** Answers git as a repository at `C:/repo` would; `calls` keeps every argv it got. */
const fakeGit = (on: On, git: Git, calls: string[][] = [], files: Record<string, string> = {}) => {
  on('process.run', async (_, e) => {
    calls.push([...e.argv])
    const [, command, ...rest] = e.argv
    if (git.root === undefined && command === 'rev-parse') {
      return run('', 128, 'fatal: not a git repository (or any of the parent directories): .git\n')
    }
    if (command === 'rev-parse' && rest[0] === '--show-toplevel') return run(`${git.root}\n`)
    if (command === 'rev-parse') return run(git.hasHead === false ? '' : 'abc\n', git.hasHead === false ? 1 : 0)
    if (git.fail !== undefined) return run('', 128, git.fail)
    if (command === 'status') return run(git.status ?? '')
    if (command === 'diff' && rest.includes('--numstat')) return run(git.numstat ?? '')
    return run(git.diff ?? '')
  })
  on('fs.stat', async () => ({ value: { kind: 'file', size: 4, mtimeMs: 1, isLink: false } }))
  on('fs.read', async (_, e) => {
    const text = files[String(e.path).replace(/\\/g, '/')]
    if (text === undefined && Object.keys(files).length > 0) return { deny: 'ENOENT' } as never
    return { value: text ?? 'a\nb\n' }
  })
  on('turn.start', async () => ({ turnId: 't1' }) as never)
  on('turn.complete', async () => ({ text: '' }) as never)
  on('ui.open', async (_, e) => {
    opens.push(e as unknown as Record<string, unknown>)
    return { value: { isPlaced: true } }
  })
  on('ui.close', async () => ({ value: undefined }) as never)
  on('tool.call', async () => ({ result: {} }) as never)
  return calls
}

const openPane = ($: Engine, presentation = { isFullscreen: false, columns: 120 }) =>
  $.command.run({
    command: 'nzt-changes',
    args: '',
    origin: { kind: 'composer' },
    presentation,
  })

const mount = ($: Engine, surface: (typeof SURFACES)[number]) =>
  $.ui.mount({
    plugin: 'nzt-changes',
    surface,
    component: 'Pane',
    requestId: 'nzt-changes',
    viewport: { columns: 64, rows: 44 },
    props: PANE,
  })

/** A main-loop turn in which Claude made `edits`. */
const turnWith = async ($: Engine, edits: Record<string, unknown>[]) => {
  await $.turn.start({ text: 'go', turnId: 't1' } as never)
  for (const edit of edits) await $.tool.call(edit as never)
  await $.turn.complete({ answer: '', durationMs: 1, isAborted: false, turnId: 't1' } as never)
}

const REPO: Git = {
  root: 'C:/repo',
  status: [' M README.md', 'M  Plan/state.json', '?? specs/new.md', ' D img/logo.png', 'R  docs/b.md', 'docs/a.md', ''].join('\0'),
  numstat: ['3\t1\tREADME.md', '9\t7\tPlan/state.json', '-\t-\timg/logo.png', '0\t2\t', 'docs/a.md', 'docs/b.md', ''].join('\0'),
  diff: 'diff --git a/README.md b/README.md\n--- a/README.md\n+++ b/README.md\n@@ -1,2 +1,2 @@\n keep\n-old\n+new\n',
}

const EDIT = { tool: 'Edit', file_path: 'C:\\repo\\README.md', old_string: 'old', new_string: 'new' }

test('after a turn with edits the pane opens on them, one step at a time', async ($, on) => {
  // Only README.md exists, so the Write makes a new file.
  fakeGit(on, REPO, [], { 'C:/repo/README.md': 'old\n' })
  await turnWith($, [EDIT, { tool: 'Write', file_path: 'C:/repo/new.md', content: 'x\ny\n' }])
  await openPane($)
  for (const surface of SURFACES) {
    const ui = await mount($, surface)
    expect(await ui.find({ type: 'Text', text: /paso 1 de 2/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: '2 ediciones · 2 archivos' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: 'README.md' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /new.md$/ })).toBeDefined()
    expect(await ui.find({ type: 'Code', text: '@@ -1,1 +1,1 @@\n-old\n+new' })).toBeDefined()
    await ui.press({ key: 'next' })
    expect(await ui.find({ type: 'Text', text: /paso 2 de 2/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /archivo nuevo/ })).toBeDefined()
    await ui.press({ key: 'next' })
    expect(await ui.find({ type: 'Text', text: /paso 2 de 2/ })).toBeDefined()
    await ui.press({ key: 'prev' })
    await ui.press({ key: 'prev' })
    expect(await ui.find({ type: 'Text', text: /paso 1 de 2/ })).toBeDefined()
  }
})

test('a Write over an existing file is a rewrite with only its changed lines', async ($, on) => {
  fakeGit(on, REPO, [], { 'C:/repo/a.md': 'one\ntwo\nthree\n' })
  await turnWith($, [{ tool: 'Write', file_path: 'C:/repo/a.md', content: 'one\nTWO\nthree\n' }])
  await openPane($)
  const ui = await mount($, 'terminal')
  expect(await ui.find({ type: 'Text', text: /reescrito/ })).toBeDefined()
  expect(await ui.find({ type: 'Code', text: '@@ -1,3 +1,3 @@\n one\n-two\n+TWO\n three' })).toBeDefined()
})

test('an edit is numbered where it lands in the file', async ($, on) => {
  fakeGit(on, REPO, [], { 'C:/repo/a.md': 'one\ntwo\nthree\n' })
  await turnWith($, [{ tool: 'Edit', file_path: 'C:/repo/a.md', old_string: 'three', new_string: 'THREE' }])
  await openPane($)
  const ui = await mount($, 'terminal')
  expect(await ui.find({ type: 'Code', text: '@@ -3,1 +3,1 @@\n-three\n+THREE' })).toBeDefined()
})

test('the detail line names the kind of file', async ($, on) => {
  fakeGit(on, REPO, [], { 'C:/repo/README.md': 'old\n' })
  await turnWith($, [EDIT])
  await openPane($)
  const ui = await mount($, 'terminal')
  expect(await ui.find({ type: 'Text', text: ' · Markdown' })).toBeDefined()
})

test('the card carries the NZT label and no step strip', async ($, on) => {
  fakeGit(on, REPO)
  await openPane($)
  const ui = await mount($, 'terminal')
  expect(await ui.find({ type: 'Text', text: ' NZT ' })).toBeDefined()
  expect(await ui.findAll({ type: 'Text', text: /^ \d+ $/ })).toHaveLength(0)
})

/** Twelve modified files in `src/`. */
const TWELVE = Array.from({ length: 12 }, (_, n) => ` M src/f${String(n).padStart(2, '0')}.ts`).join('\0')

test('the HEAD index opens closed, one title per mark, and a title opens to its folders and files', async ($, on) => {
  fakeGit(on, REPO)
  await openPane($)
  const ui = await mount($, 'terminal')
  // README.md and Plan/state.json are modified, specs/new.md new, img/logo.png deleted, docs/b.md renamed.
  for (const title of ['Modificados', 'Nuevos', 'Borrados', 'Renombrados']) {
    expect(await ui.find({ type: 'Text', text: title })).toBeDefined()
  }
  expect(await ui.find({ type: 'Text', text: 'En conflicto' })).toBeUndefined()
  expect(await ui.find({ key: 'step-0' })).toBeUndefined()
  await ui.press({ key: 'group-M' })
  expect(await ui.find({ key: 'step-0' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Plan/' })).toBeDefined()
  expect(await ui.find({ key: 'step-1' })).toBeUndefined()
  await ui.press({ key: 'group-M/Plan' })
  expect(await ui.find({ key: 'step-1' })).toBeDefined()
  await ui.press({ key: 'group-M' })
  expect(await ui.find({ key: 'step-0' })).toBeUndefined()
  expect(await ui.find({ key: 'step-1' })).toBeUndefined()
})

test('a git conflict and an untracked file land in their own groups', async ($, on) => {
  fakeGit(on, { ...REPO, status: ['UU a.md', '?? b.md', ' T c.md', ''].join('\0'), numstat: '' })
  await openPane($)
  const ui = await mount($, 'terminal')
  // The type change counts as modified: Modificados, Nuevos, En conflicto, in that order.
  const titles = (await ui.findAll({ type: 'Text', text: /^(Modificados|Nuevos|Borrados|Renombrados|En conflicto)$/ })).map(
    found => found.text,
  )
  expect(titles).toEqual(['Modificados', 'Nuevos', 'En conflicto'])
})

test('the HEAD index windows a long list', async ($, on) => {
  fakeGit(on, { ...REPO, status: `${TWELVE}\0`, numstat: '' })
  await openPane($)
  const ui = await mount($, 'terminal')
  await ui.press({ key: 'group-M' })
  await ui.press({ key: 'group-M/src' })
  expect(await ui.find({ type: 'Text', text: 'src/' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'f00.ts' })).toBeDefined()
  // Docked, the index takes 8 lines: the two titles and 6 of the 12 files.
  expect(await ui.find({ type: 'Text', text: /↓ 6 más/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '12 archivos · ' })).toBeDefined()
})

test('a file in the index is picked by pressing its row', async ($, on) => {
  fakeGit(on, REPO)
  await openPane($)
  const ui = await mount($, 'terminal')
  await ui.press({ key: 'group-M' })
  await ui.press({ key: 'group-M/Plan' })
  await ui.press({ key: 'step-1' })
  expect(await ui.find({ type: 'Text', text: /paso 2 de 5/ })).toBeDefined()
})

test('picking a file leaves the index where it is; stepping moves it only as far as needed', async ($, on) => {
  fakeGit(on, { ...REPO, status: `${TWELVE}\0`, numstat: '' })
  await openPane($)
  const ui = await mount($, 'terminal')
  await ui.press({ key: 'group-M' })
  await ui.press({ key: 'group-M/src' })
  // Docked: both titles and f00 to f05, six below.
  await ui.press({ key: 'step-5' })
  expect(await ui.find({ type: 'Text', text: /paso 6 de 12/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /↓ 6 más/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Modificados' })).toBeDefined()
  // f06 is one line past the window: it moves by one, and the mark's title goes off the top.
  await ui.press({ key: 'next' })
  expect(await ui.find({ type: 'Text', text: /↓ 5 más/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'Modificados' })).toBeUndefined()
})

test('stepping into a closed group opens it and leaves the others as they were', async ($, on) => {
  fakeGit(on, REPO)
  await openPane($)
  const ui = await mount($, 'terminal')
  // On step 1 (README.md) with everything closed, Siguiente goes to Plan/state.json.
  await ui.press({ key: 'next' })
  expect(await ui.find({ type: 'Text', text: /paso 2 de 5/ })).toBeDefined()
  expect(await ui.find({ key: 'step-1' })).toBeDefined()
  expect(await ui.find({ key: 'step-0' })).toBeDefined()
  expect(await ui.find({ key: 'step-2' })).toBeUndefined()
  // Closing Modificados and stepping on opens Nuevos alone.
  await ui.press({ key: 'group-M' })
  await ui.press({ key: 'next' })
  expect(await ui.find({ key: 'step-2' })).toBeDefined()
  expect(await ui.find({ key: 'step-1' })).toBeUndefined()
})

test('opening the pane again closes every group', async ($, on) => {
  fakeGit(on, REPO)
  await openPane($)
  const ui = await mount($, 'terminal')
  await ui.press({ key: 'group-M' })
  expect(await ui.find({ key: 'step-0' })).toBeDefined()
  await openPane($)
  expect(await ui.find({ key: 'step-0' })).toBeUndefined()
})

/** A turn whose one edit writes a new file of `n` lines. */
const longWrite = (n: number) => ({
  tool: 'Write',
  file_path: 'C:/repo/long.md',
  content: Array.from({ length: n }, (_, i) => `line ${i + 1}`).join('\n'),
})

test('the pane is as tall as its body whatever the diff', async ($, on) => {
  fakeGit(on, REPO, [], { 'C:/repo/README.md': 'old\n' })
  await turnWith($, [EDIT, longWrite(60)])
  await openPane($)
  const ui = await mount($, 'terminal')
  expect(await ui.drawn()).toMatchObject({ props: { marginTop: 1, height: 39 } })
  await ui.press({ key: 'next' })
  expect(await ui.drawn()).toMatchObject({ props: { marginTop: 1, height: 39 } })
})

test('a diff taller than its window scrolls, with its position and the ruler', async ($, on) => {
  fakeGit(on, REPO, [], { 'C:/repo/README.md': 'old\n' })
  await turnWith($, [longWrite(60), EDIT])
  await openPane($)
  const ui = await mount($, 'terminal')
  // 40 rows less the blank row over the card, its 13 and two index lines leave the diff 24; ▼ moves half.
  expect(await ui.find({ type: 'Text', text: 'líneas 1–24 de 60' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '▐' })).toBeDefined()
  await ui.press({ key: 'down' })
  expect(await ui.find({ type: 'Text', text: 'líneas 13–36 de 60' })).toBeDefined()
  await ui.press({ key: 'down' })
  await ui.press({ key: 'down' })
  expect(await ui.find({ type: 'Text', text: 'líneas 37–60 de 60' })).toBeDefined()
  await ui.press({ key: 'next' })
  await ui.press({ key: 'prev' })
  expect(await ui.find({ type: 'Text', text: 'líneas 1–24 de 60' })).toBeDefined()
})

/** The card's children as drawn, each with its props and the text it shows. */
const cardRows = async (ui: { drawn: () => Promise<unknown> }) => {
  type Node = { type: string; props?: Record<string, unknown>; children?: unknown[] } | string
  const textOf = (node: unknown): string =>
    typeof node === 'string'
      ? node
      : (node as { props?: { label?: string } }).props?.label ??
        ((node as { children?: unknown[] }).children ?? []).map(textOf).join('')
  const card = (await ui.drawn()) as Exclude<Node, string>
  return (card.children ?? []).map(child => ({
    props: (child as Exclude<Node, string>).props ?? {},
    text: textOf(child),
  }))
}

test('blank rows part the card, the position sits under the rule and the buttons on the right', async ($, on) => {
  fakeGit(on, REPO, [], { 'C:/repo/README.md': 'old\n' })
  await turnWith($, [longWrite(60), EDIT])
  await openPane($)
  const ui = await mount($, 'terminal')
  const rows = await cardRows(ui)
  // Heading, views, index, rule, position, file and detail and diff, buttons.
  expect(rows[0]!.text).toMatch(/paso 1 de 2/)
  expect(rows[1]!.props).toMatchObject({ marginTop: 1 })
  expect(rows[1]!.text).toMatch(/Turno/)
  expect(rows[2]!.props).toMatchObject({ marginTop: 1 })
  expect(rows[3]!.text).toMatch(/^─+$/)
  expect(rows[4]!.props).toMatchObject({ justifyContent: 'flex-end' })
  expect(rows[4]!.text).toMatch(/^líneas 1–24 de 60/)
  const body = rows[5]!.text
  expect(body.indexOf('long.md')).toBeLessThan(body.indexOf('Write'))
  expect(rows[6]!.props).toMatchObject({ justifyContent: 'flex-end' })
  expect(rows[6]!.text).toMatch(/Anterior.*Siguiente.*Cerrar/)
  // The two blank rows inside the body: over the detail and over the diff.
  const drawn = JSON.stringify(await ui.drawn())
  expect(drawn.match(/"marginTop":1/g)!.length).toBeGreaterThanOrEqual(5)
})

test('a view with no steps keeps the blank row under the views', async ($, on) => {
  fakeGit(on, { ...REPO, status: '', numstat: '' })
  await openPane($)
  const ui = await mount($, 'terminal')
  const rows = await cardRows(ui)
  expect(rows[2]!.props).toMatchObject({ marginTop: 1 })
  expect(rows[2]!.text).toMatch(/Sin cambios contra HEAD/)
  expect(rows[3]!.props).toMatchObject({ justifyContent: 'flex-end' })
})

test('a diff that fits has no ruler and says how many lines it has', async ($, on) => {
  fakeGit(on, REPO, [], { 'C:/repo/README.md': 'old\n' })
  await turnWith($, [EDIT])
  await openPane($)
  const ui = await mount($, 'terminal')
  expect(await ui.find({ type: 'Text', text: '2 líneas' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '▐' })).toBeUndefined()
  expect(await ui.find({ key: 'down' })).toBeUndefined()
})

test('with no edits in the turn it opens on HEAD, ordered by mark and then folder', async ($, on) => {
  fakeGit(on, REPO)
  await openPane($)
  for (const surface of SURFACES) {
    const ui = await mount($, surface)
    expect(await ui.find({ type: 'Text', text: /paso 1 de 5/ })).toBeDefined()
    // Modified at the root, modified in Plan, new, deleted, renamed.
    expect(await ui.find({ type: 'Text', text: 'README.md' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /modificado/ })).toBeDefined()
    expect(await ui.find({ type: 'Code', text: '@@ -1,2 +1,2 @@\n keep\n-old\n+new' })).toBeDefined()
    await ui.press({ key: 'next' })
    expect(await ui.find({ type: 'Text', text: 'Plan/state.json' })).toBeDefined()
    await ui.press({ key: 'next' })
    expect(await ui.find({ type: 'Text', text: 'specs/new.md' })).toBeDefined()
    await ui.press({ key: 'next' })
    expect(await ui.find({ type: 'Text', text: 'img/logo.png' })).toBeDefined()
    await ui.press({ key: 'next' })
    expect(await ui.find({ type: 'Text', text: 'docs/a.md → docs/b.md' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /renombrado/ })).toBeDefined()
    for (let i = 0; i < 4; i++) await ui.press({ key: 'prev' })
  }
})

test('the views switch with their buttons', async ($, on) => {
  fakeGit(on, REPO)
  await turnWith($, [EDIT])
  await openPane($)
  const ui = await mount($, 'terminal')
  expect(await ui.find({ type: 'Text', text: /paso 1 de 1/ })).toBeDefined()
  await ui.press({ key: 'view-head' })
  expect(await ui.find({ type: 'Text', text: /paso 1 de 5/ })).toBeDefined()
  await ui.press({ key: 'view-turn' })
  expect(await ui.find({ type: 'Text', text: /paso 1 de 1/ })).toBeDefined()
})

test('a binary file says it has no text diff', async ($, on) => {
  fakeGit(on, { ...REPO, status: ' D img/logo.png\0', numstat: '-\t-\timg/logo.png\0', diff: 'Binary files a/img/logo.png and /dev/null differ\n' })
  await openPane($)
  const ui = await mount($, 'terminal')
  expect(await ui.find({ type: 'Text', text: /Archivo binario/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /binario/ })).toBeDefined()
})

test('a rename asks git for both paths', async ($, on) => {
  const calls = fakeGit(on, { ...REPO, status: 'R  docs/b.md\0docs/a.md\0' })
  await openPane($)
  await mount($, 'terminal')
  expect(calls.some(argv => argv.slice(-3).join(' ') === '-- docs/a.md docs/b.md')).toBe(true)
})

test('a file Claude edited says so in the HEAD view', async ($, on) => {
  fakeGit(on, REPO)
  await $.tool.call(EDIT as never)
  await openPane($)
  const ui = await mount($, 'terminal')
  expect(await ui.find({ type: 'Text', text: /● Claude/ })).toBeDefined()
})

test('an empty turn and a clean tree say so', async ($, on) => {
  fakeGit(on, { root: 'C:/repo', status: '', numstat: '' })
  await openPane($)
  for (const surface of SURFACES) {
    const ui = await mount($, surface)
    expect(await ui.find({ type: 'Text', text: /Sin cambios contra HEAD/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /sin pasos/ })).toBeDefined()
    await ui.press({ key: 'view-turn' })
    expect(await ui.find({ type: 'Text', text: /no editó archivos/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /h muestra todo lo que cambió contra HEAD/ })).toBeDefined()
    await ui.press({ key: 'view-head' })
  }
})

test('outside a repository HEAD says so and the turn view still works', async ($, on) => {
  fakeGit(on, {})
  await turnWith($, [{ ...EDIT, file_path: 'C:/elsewhere/x.md' }])
  await openPane($)
  const ui = await mount($, 'terminal')
  expect(await ui.find({ type: 'Text', text: 'C:/elsewhere/x.md' })).toBeDefined()
  await ui.press({ key: 'view-head' })
  expect(await ui.find({ type: 'Text', text: /no está en un repositorio git/ })).toBeDefined()
})

test('a repository with no commit measures against the empty tree', async ($, on) => {
  const calls = fakeGit(on, { root: 'C:/repo', hasHead: false, status: '?? notes.md\0' })
  await openPane($)
  expect(calls.some(argv => argv[1] === 'diff' && argv[2] === EMPTY_TREE)).toBe(true)
})

test('a git error is shown', async ($, on) => {
  fakeGit(on, { root: 'C:/repo', fail: 'fatal: index file corrupt' })
  await openPane($)
  const ui = await mount($, 'terminal')
  expect(await ui.find({ type: 'Text', text: /No se pudieron leer los cambios/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /index file corrupt/ })).toBeDefined()
})

test('a view an older version left in the session still draws', async ($, on) => {
  fakeGit(on, REPO)
  // What 0.1.0 kept in the session, served until this version writes its own.
  let written = false
  on('state.set', async (_, e, next) => {
    if ((e as { key?: string }).key === 'view') written = true
    return next(e)
  })
  on('state.get', async (_, e, next) =>
    (e as { key?: string }).key === 'view' && !written
      ? ({ value: { selected: null, diff: null, notice: null } } as never)
      : next(e),
  )
  await openPane($)
  const ui = await mount($, 'terminal')
  expect(await ui.find({ type: 'Text', text: /paso 1 de 5/ })).toBeDefined()
})

test('the pane asks for 58 columns docked and 24 rows inline', async ($, on) => {
  fakeGit(on, REPO)
  await openPane($)
  expect(opens[opens.length - 1]).toMatchObject({ id: 'nzt-changes', columns: 58, rows: 24 })
})

test('the command says why the pane is above the prompt, or that it opened', async ($, on) => {
  fakeGit(on, REPO)
  const outside = await openPane($, { isFullscreen: false, columns: 200 })
  expect(outside.text).toMatch(/solo en pantalla completa/)
  const narrow = await openPane($, { isFullscreen: true, columns: 90 })
  expect(narrow.text).toMatch(/tiene 90 columnas y al costado hacen falta 110/)
  const docked = await openPane($, { isFullscreen: true, columns: 140 })
  expect(docked.text).toBe('Panel de cambios abierto.')
})

test('in English the pane speaks English', { options: { language: 'en' } }, async ($, on) => {
  fakeGit(on, REPO)
  await openPane($)
  const ui = await mount($, 'terminal')
  expect(await ui.find({ type: 'Text', text: /step 1 of 5/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /modified/ })).toBeDefined()
})
