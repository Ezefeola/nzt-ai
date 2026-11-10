import { expect, mock, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

type Engine = Parameters<TestBody>[0]
type On = Parameters<TestBody>[1]

const ROOT = 'C:/proj'
// 2026-10-19 12:00 UTC; the files below were last changed an hour before.
const NOW = 1_792_411_200_000
const AN_HOUR_AGO = NOW - 3_600_000
const VIOLET = '#c084fc'
const ORANGE = '#fb923c'
const GREEN = '#4ade80'

/** A project on disk: each folder's entries and each file's text; a folder not listed cannot be read. */
type Disk = {
  folders: Record<string, { name: string; kind: 'file' | 'dir' }[]>
  files: Record<string, string>
  status?: string
  numstat?: string
  /** What `git diff HEAD -U0` says of each file, by its path from the project folder. */
  diff?: Record<string, string>
  isRepo?: boolean
  /** What the system says when asked to open a file; unset, it opens. */
  openError?: string
}

const run = (stdout: string, exitCode = 0, stderr = '') => ({
  value: { exitCode, stdout, stderr, isStdoutTruncated: false, isStderrTruncated: false },
})

const DISK: Disk = {
  folders: {
    [ROOT]: [
      { name: '.git', kind: 'dir' },
      { name: 'README.md', kind: 'file' },
      { name: 'src', kind: 'dir' },
      { name: 'logo.bin', kind: 'file' },
    ],
    [`${ROOT}/src`]: [{ name: 'main.ts', kind: 'file' }],
  },
  files: {
    [`${ROOT}/README.md`]: '# Proj\n',
    [`${ROOT}/src/main.ts`]: "export const a = 1\nexport const b = 'two'\n",
    [`${ROOT}/logo.bin`]: 'PNG\0\0data',
  },
  status: ['## mods...origin/mods [ahead 2]', ' M src/main.ts', ' D old.png', ''].join('\0'),
  numstat: ['12\t3\tsrc/main.ts', ''].join('\0'),
}

const at = (path: unknown) => String(path).replace(/\\/g, '/')

/** The world beneath the pane: the disk, git, the clock, the panes and the clipboard. Returns what it saw. */
const fakeDisk = (on: On, disk: Disk) => {
  const seen = { argv: [] as string[][], copied: [] as string[], opened: [] as string[], titles: [] as string[], closed: [] as string[] }
  const clock = mock.clock(on, { now: NOW })
  on('session.root', async () => ({ value: ROOT }) as never)
  on('command.register', async () => ({ value: undefined }) as never)
  on('fs.list', async (_, e) => {
    const entries = disk.folders[at(e.path)]
    if (entries === undefined) return { deny: 'EACCES: permission denied' } as never
    return {
      value: entries.map(entry => ({
        ...entry,
        size: disk.files[`${at(e.path)}/${entry.name}`]?.length ?? 0,
        mtimeMs: entry.kind === 'file' ? AN_HOUR_AGO : 0,
        isLink: false,
      })),
    }
  })
  on('fs.stat', async (_, e) => {
    const path = at(e.path)
    if (disk.folders[path] !== undefined) return { value: { kind: 'dir', size: 0, mtimeMs: 0, isLink: false } }
    const text = disk.files[path]
    if (text === undefined) return { deny: 'ENOENT' } as never
    return { value: { kind: 'file', size: text.length, mtimeMs: AN_HOUR_AGO, isLink: false } }
  })
  on('fs.read', async (_, e) => {
    const text = disk.files[at(e.path)]
    if (text === undefined) return { deny: 'ENOENT' } as never
    return { value: text }
  })
  on('process.run', async (_, e) => {
    seen.argv.push([...e.argv])
    if (e.argv[0] !== 'git') return disk.openError === undefined ? run('') : run('', 1, disk.openError)
    if (disk.isRepo === false) return run('', 128, 'fatal: not a git repository')
    if (e.argv.includes('--show-prefix')) return run('\n')
    if (e.argv.includes('-U0')) return run(disk.diff?.[e.argv[e.argv.length - 1]!] ?? '')
    if (e.argv.includes('--numstat')) return run(disk.numstat ?? '')
    if (e.argv[1] === 'show') return run(['README.md', ''].join('\0'))
    if (e.argv[1] === 'log') return run('Update the readme\n')
    return run(disk.status ?? '')
  })
  on('ui.open', async (_, e) => {
    seen.opened.push(e.id)
    seen.titles.push(e.title ?? e.id)
    return { value: { isPlaced: true } }
  })
  on('ui.close', async (_, e) => {
    seen.closed.push(e.id)
    return { value: undefined } as never
  })
  on('ui.focus', async () => ({ value: {} }) as never)
  on('ui.copy', async (_, e) => {
    seen.copied.push(e.text)
    return { value: { isCopied: true } } as never
  })
  return { clock, seen }
}

const openPane = ($: Engine) =>
  $.command.run({
    command: 'nzt-files',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 160 },
  })

const mount = ($: Engine, bodyRows = 40, bodyColumns = 60, surface: 'terminal' | 'desktop' = 'terminal') =>
  $.ui.mount({
    plugin: 'nzt-files',
    surface,
    component: 'Pane',
    requestId: 'nzt-files',
    viewport: { columns: bodyColumns + 4, rows: bodyRows + 4 },
    props: {
      title: 'Archivos',
      isFocused: true,
      bodyColumns,
      placement: 'dock',
      scroll: { offset: 0, bodyRows },
      view: {},
    },
  })

/** The chosen file's own pane, which the app opens beside the tree's. */
const mountFile = ($: Engine, bodyRows = 40, bodyColumns = 60) =>
  $.ui.mount({
    plugin: 'nzt-files',
    surface: 'desktop',
    component: 'Pane',
    requestId: 'nzt-files-file',
    viewport: { columns: bodyColumns + 4, rows: bodyRows + 4 },
    props: {
      title: 'main.ts',
      isFocused: true,
      bodyColumns,
      placement: 'dock',
      scroll: { offset: 0, bodyRows },
      view: {},
    },
  })

/** A tool call that waits for `release` before the tool answers, to look at the pane while it runs. */
const heldTool = (on: On, answer: Record<string, unknown> = { result: 'ok' }) => {
  let release = () => {}
  const held = new Promise<void>(resolve => {
    release = resolve
  })
  on('tool.call', async () => {
    await held
    return answer as never
  })
  return () => release()
}

/** A click on a row of the tree in the app, released where it went down: at its far right, past the name. */
const clickRow = async (ui: Awaited<ReturnType<typeof mount>>, path: string) => {
  const row = `n:${path}`
  await ui.resize({ columns: 40, rows: 1, in: row })
  await ui.pointer({ type: 'down', x: 38, y: 0, button: 'left', in: row })
  await ui.pointer({ type: 'up', x: 38, y: 0, button: 'left', in: row })
}

const nameRow = (ui: Awaited<ReturnType<typeof mount>>, name: string) =>
  ui.find({ type: 'Text', text: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}$`) })

// The pane as it was.

test('the pane opens on the project: folders first, .git hidden, marks and counts of git', async ($, on) => {
  fakeDisk(on, DISK)
  expect(await openPane($)).toEqual({})
  const ui = await mount($)
  expect(await nameRow(ui, 'src/')).toBeDefined()
  expect(await nameRow(ui, 'README.md')).toBeDefined()
  expect(await nameRow(ui, '.git/')).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: 'M:1' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Elegí un archivo del árbol\.$/ })).toBeDefined()
})

test('the card keeps a blank row under the pane tabs and still fills the body', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  expect(await ui.drawn()).toMatchObject({ props: { marginTop: 1, height: 39 } })
  expect(await ui.find({ type: 'Box', key: 'body' })).toMatchObject({ props: { marginTop: 1 } })
})

test('a folder opens with a click and its file shows beneath, numbered, with its detail', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:src' })
  expect(await nameRow(ui, 'main.ts')).toBeDefined()
  await ui.press({ key: 'n:src/main.ts' })
  expect(await ui.find({ type: 'Text', text: 'src/main.ts' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'M modificado' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /TypeScript · \d+ B · 2 líneas/ })).toBeDefined()
  expect(await ui.find({ type: 'Code', text: "export const a = 1\nexport const b = 'two'" })).toBeDefined()
  await ui.press({ key: 'n:src' })
  expect(await nameRow(ui, 'main.ts')).toBeUndefined()
})

test('a C# file is colored by the pane, methods and types too, with its line numbers', async ($, on) => {
  const disk = {
    ...DISK,
    folders: { ...DISK.folders, [ROOT]: [...DISK.folders[ROOT]!, { name: 'App.cs', kind: 'file' as const }] },
    files: { ...DISK.files, [`${ROOT}/App.cs`]: 'var list = items.ToList();\r\nreturn new Catalog(list);\r\n' },
  }
  fakeDisk(on, disk)
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:App.cs' })
  expect(await ui.find({ type: 'Code' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: /^ToList$/ })).toMatchObject({ props: { color: '#DCDCAA' } })
  expect(await ui.find({ type: 'Text', text: /^Catalog$/ })).toMatchObject({ props: { color: '#4EC9B0' } })
  expect(await ui.find({ type: 'Text', text: /^return$/ })).toMatchObject({ props: { color: '#D8A0DF' } })
  expect(await ui.find({ type: 'Text', text: /^2 $/ })).toBeDefined()
})

test('a file longer than the viewer has a scroll bar, and a click on its last row goes to the end', async ($, on) => {
  const long = Array.from({ length: 300 }, (_, i) => `export const v${i + 1} = ${i + 1}`).join('\n')
  fakeDisk(on, { ...DISK, files: { ...DISK.files, [`${ROOT}/src/main.ts`]: long } })
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:src' })
  await ui.press({ key: 'n:src/main.ts' })
  const track = await ui.find({ type: 'Box', key: 'track' })
  expect(track).toBeDefined()
  const rows = (track as { children: unknown[] }).children.length
  await ui.press({ key: `bar:${rows - 1}` })
  expect(await ui.find({ type: 'Code', text: /export const v300 = 300/ })).toBeDefined()
})

test('in the app a file chosen opens in a pane of its own titled with its name, and the tree pane holds no file', async ($, on) => {
  const { seen } = fakeDisk(on, DISK)
  await openPane($)
  const tree = await mount($, 40, 60, 'desktop')
  await clickRow(tree, 'src')

  await clickRow(tree, 'src/main.ts')

  expect(seen.opened).toContain('nzt-files-file')
  expect(seen.titles).toContain('main.ts')
  expect(await tree.find({ type: 'Code' })).toBeUndefined()
  expect(await tree.find({ key: 'rule' })).toBeUndefined()
  expect(await tree.find({ key: 'copy' })).toBeUndefined()
  const file = await mountFile($)
  expect(await file.find({ type: 'Code', text: /export const b = 'two'/ })).toBeDefined()
  expect(await file.find({ type: 'Text', text: 'src › ' })).toBeDefined()
  expect(await file.find({ type: 'Text', text: 'main.ts' })).toBeDefined()
})

test('in the app a row is chevron or outline icon and name, with only its git mark at the right', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)

  const tree = await mount($, 40, 60, 'desktop')
  expect(await tree.find({ type: 'Text', text: 'ᐳ', in: 'n:src' })).toBeDefined()
  await clickRow(tree, 'src')

  expect(await tree.find({ type: 'Text', text: 'ᐯ', in: 'n:src' })).toBeDefined()
  const icons = (await tree.findAll({ type: 'Svg' })).map(icon => icon.props.alt)
  expect(icons).toEqual(expect.arrayContaining(['TypeScript', 'Markdown']))
  expect(await tree.find({ type: 'Text', text: 'M', in: 'n:src/main.ts' })).toMatchObject({ props: { color: 'yellow' } })
  expect(await tree.find({ type: 'Text', text: /hace|ayer|\d{2}:\d{2}/ })).toBeUndefined()
  expect(await tree.find({ key: 'sum' })).toBeUndefined()
})

test('in the app a click anywhere along a row presses it, and its chevron keeps its place open and closed', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const tree = await mount($, 40, 60, 'desktop')
  const closed = await tree.drawn({ in: 'n:src' })

  await clickRow(tree, 'src')

  const open = await tree.drawn({ in: 'n:src' })
  expect(await tree.find({ type: 'Button', key: 'n:src' } as never)).toBeUndefined()
  expect(await tree.find({ type: 'Text', text: 'main.ts', in: 'n:src/main.ts' })).toBeDefined()
  expect(JSON.stringify(open).replace('ᐯ', 'ᐳ')).toBe(JSON.stringify(closed))
})

test('in the app a click that slides off the row presses nothing', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const tree = await mount($, 40, 60, 'desktop')
  await tree.resize({ columns: 40, rows: 1, in: 'n:src' })

  await tree.pointer({ type: 'down', x: 5, y: 0, button: 'left', in: 'n:src' })
  await tree.pointer({ type: 'up', x: 5, y: 3, button: 'left', in: 'n:src' })

  expect(await tree.find({ type: 'Text', text: 'ᐳ', in: 'n:src' })).toBeDefined()
})

test('in the app beside the search goes only Solo lo cambiado, primary while it is on, and no Unfold or Fold', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const tree = await mount($, 40, 60, 'desktop')
  expect(await tree.find({ key: 'open-all' })).toBeUndefined()
  expect(await tree.find({ key: 'close-all' })).toBeUndefined()
  expect((await tree.findAll({ type: 'Svg' })).map(icon => icon.props.alt)).toContain('Buscar')

  await tree.press({ key: 'changes' })

  expect(await tree.find({ type: 'Button', key: 'changes' } as never)).toMatchObject({ props: { variant: 'primary', label: 'Solo lo cambiado' } })
})

test('in the app what Claude writes goes as a dot of its color beside the name', async ($, on) => {
  const { clock } = fakeDisk(on, DISK)
  const release = heldTool(on)
  await openPane($)
  const tree = await mount($, 40, 60, 'desktop')

  const call = $.tool.call({ tool: 'Edit', file_path: `${ROOT}/README.md`, old_string: 'P', new_string: 'Q' } as never)
  await clock.settle()

  expect(await tree.find({ type: 'Text', text: '●', in: 'n:README.md' })).toMatchObject({ props: { color: ORANGE } })
  release()
  await call
})

test('in the app </> turns a Markdown file to its source and back', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const tree = await mount($, 40, 60, 'desktop')
  await clickRow(tree, 'README.md')
  const file = await mountFile($)
  expect(await file.find({ type: 'Markdown' })).toBeDefined()

  await file.press({ key: 'markdown' })

  expect(await file.find({ type: 'Code', text: /# Proj/ })).toBeDefined()
  expect(await file.find({ type: 'Button', key: 'markdown' } as never)).toMatchObject({ props: { variant: 'primary', label: 'Ver dibujado' } })
})

test('on the terminal a file chosen shows beneath the tree and opens no other pane', async ($, on) => {
  const { seen } = fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:src' })

  await ui.press({ key: 'n:src/main.ts' })

  expect(seen.opened).not.toContain('nzt-files-file')
  expect(await ui.find({ type: 'Code', text: /export const b = 'two'/ })).toBeDefined()
})

test('in the app the file pane draws the file whole, cut at the width, with no arrows and no scroll bar of its own', async ($, on) => {
  const long = Array.from({ length: 300 }, (_, i) => `export const v${i + 1} = ${i + 1}`).join('\n')
  fakeDisk(on, { ...DISK, files: { ...DISK.files, [`${ROOT}/src/main.ts`]: long } })
  await openPane($)
  const tree = await mount($, 40, 60, 'desktop')
  await clickRow(tree, 'src')
  await clickRow(tree, 'src/main.ts')

  const file = await mountFile($)

  const code = await file.find({ type: 'Code' })
  expect(code?.props).toMatchObject({ startLine: 1, wrap: 'truncate-end' })
  expect(String(code?.props.source)).toMatch(/^export const v1 = 1\n[\s\S]*export const v300 = 300$/)
  expect(await file.find({ key: 'view-down' })).toBeUndefined()
  expect(await file.find({ key: 'bar' })).toBeUndefined()
  expect(await file.find({ type: 'Text', text: /líneas \d/ })).toBeUndefined()
})

test('in the app the tree pane draws every row of the tree, however short the body, for the app to scroll', async ($, on) => {
  const names = Array.from({ length: 30 }, (_, i) => ({ name: `f${String(i + 1).padStart(2, '0')}.ts`, kind: 'file' as const }))
  fakeDisk(on, { ...DISK, folders: { ...DISK.folders, [ROOT]: [...DISK.folders[ROOT]!, ...names] } })
  await openPane($)

  const tree = await mount($, 10, 60, 'desktop')

  expect(await tree.find({ type: 'Text', text: 'f01.ts', in: 'n:f01.ts' })).toBeDefined()
  expect(await tree.find({ type: 'Text', text: 'f30.ts', in: 'n:f30.ts' })).toBeDefined()
  expect(await tree.find({ type: 'Text', text: /más$/ })).toBeUndefined()
})

test('in the app a file larger than one drawing shows its first lines and says how many', async ($, on) => {
  const big = Array.from({ length: 4000 }, (_, i) => `export const value${String(i + 1).padStart(4, '0')} = ${i + 1}`).join('\n')
  fakeDisk(on, { ...DISK, files: { ...DISK.files, [`${ROOT}/src/main.ts`]: big } })
  await openPane($)
  const tree = await mount($, 40, 60, 'desktop')
  await clickRow(tree, 'src')
  await clickRow(tree, 'src/main.ts')

  const file = await mountFile($)

  const source = String((await file.find({ type: 'Code' }))?.props.source)
  expect(source.length).toBeLessThanOrEqual(95_000)
  const shown = source.split('\n').length
  expect(shown).toBeLessThan(4000)
  const detail = (await file.find({ type: 'Text', text: /4\.000 líneas · se ven [\d.]+/ }))?.text ?? ''
  expect(detail.match(/se ven ([\d.]+)/)?.[1]?.replace('.', '')).toBe(String(shown))
})

test('in the app the file pane copies the chosen file path', async ($, on) => {
  const { seen } = fakeDisk(on, DISK)
  await openPane($)
  const tree = await mount($, 40, 60, 'desktop')
  await clickRow(tree, 'src')
  await clickRow(tree, 'src/main.ts')
  const file = await mountFile($)

  await file.press({ key: 'copy' })

  expect(seen.copied).toEqual(['src/main.ts'])
})

/** A line of code as the app gets it: its spaces hard, so it keeps its indent. */
const hard = (text: string) => text.replace(/ /g, ' ')

/** src/main.ts, 300 lines long, with one line added at 250 since the last commit. */
const LONG_CHANGED = {
  ...DISK,
  diff: { 'src/main.ts': '@@ -249,0 +250 @@\n+export const v250 = 250\n' },
  files: { ...DISK.files, [`${ROOT}/src/main.ts`]: Array.from({ length: 300 }, (_, i) => `export const v${i + 1} = ${i + 1}`).join('\n') },
}

const fileWheel = (by: number) => ({
  component: 'Pane' as const,
  requestId: 'nzt-files-file',
  offset: Math.max(0, by),
  by,
  bodyRows: 20,
  contentRows: 20,
  origin: { kind: 'person' as const },
})

test('in the app a changed file is drawn as code, as one with no changes, and its detail counts the lines', async ($, on) => {
  fakeDisk(on, { ...DISK, diff: { 'src/main.ts': "@@ -2 +2 @@\n-export const b = 2\n+export const b = 'two'\n" } })
  await openPane($)
  const tree = await mount($, 40, 60, 'desktop')
  await clickRow(tree, 'src')
  await clickRow(tree, 'src/main.ts')

  const file = await mountFile($)

  expect(await file.find({ type: 'Code' })).toMatchObject({ props: { source: "export const a = 1\nexport const b = 'two'", startLine: 1 } })
  expect(await file.find({ type: 'Text', text: /^\+12$/ })).toMatchObject({ props: { color: 'green' } })
  expect(await file.find({ type: 'Text', text: /^-3$/ })).toMatchObject({ props: { color: 'red' } })
})

test('in the app a changed C# file is drawn as Visual Studio diff: its colors on each changed line background', async ($, on) => {
  const disk = {
    ...DISK,
    status: ['## mods', ' M App.cs', ''].join('\0'),
    diff: { 'App.cs': '@@ -2 +2 @@\n-return null;\n+return new Catalog(list);\n' },
    folders: { ...DISK.folders, [ROOT]: [...DISK.folders[ROOT]!, { name: 'App.cs', kind: 'file' as const }] },
    files: { ...DISK.files, [`${ROOT}/App.cs`]: 'var list = items.ToList();\nreturn new Catalog(list);\n' },
  }
  fakeDisk(on, disk)
  await openPane($)
  const tree = await mount($, 40, 60, 'desktop')
  await clickRow(tree, 'App.cs')

  const file = await mountFile($)

  expect(await file.find({ type: 'Code' })).toBeUndefined()
  expect(await file.find({ type: 'Text', text: /@@/ })).toBeUndefined()
  expect(await file.find({ type: 'Text', text: /^Catalog$/ })).toMatchObject({ props: { color: '#4EC9B0' } })
  const painted = (await file.findAll({ type: 'Box' })).map(box => box.props.backgroundColor).filter(Boolean)
  expect(painted).toEqual(['#f8514933', '#2ea04333'])
})

const wheel = (contentRows: number) => ({
  component: 'Pane' as const,
  requestId: 'nzt-files',
  offset: 1,
  by: 1,
  bodyRows: 10,
  contentRows,
  origin: { kind: 'person' as const },
  pointer: { row: 4, column: 3 },
})

test('a wheel over a tree taller than the body goes on to the app, which scrolls it', async ($, on) => {
  fakeDisk(on, DISK)
  const reached: number[] = []
  on('ui.scroll', async (_, e) => {
    reached.push(e.offset)
    return {} as never
  })
  await openPane($)

  await $.ui.scroll(wheel(40))

  expect(reached).toEqual([1])
})

test('a wheel over a tree as tall as the body is the pane own, as on the terminal', async ($, on) => {
  fakeDisk(on, DISK)
  const reached: number[] = []
  on('ui.scroll', async (_, e) => {
    reached.push(e.offset)
    return {} as never
  })
  await openPane($)
  await mount($)

  await $.ui.scroll(wheel(10))

  expect(reached).toEqual([])
})

test('closing the explorer closes the file pane with it', async ($, on) => {
  const { seen } = fakeDisk(on, DISK)
  await openPane($)
  const tree = await mount($, 40, 60, 'desktop')
  await clickRow(tree, 'src')
  await clickRow(tree, 'src/main.ts')
  await mountFile($)

  await openPane($)

  expect(seen.closed).toEqual(expect.arrayContaining(['nzt-files-file', 'nzt-files']))
})

test('a file that fits has no scroll bar', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:src' })
  await ui.press({ key: 'n:src/main.ts' })
  expect(await ui.find({ type: 'Box', key: 'bar' })).toBeUndefined()
})

test('a binary file shows what it is, not its bytes', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:logo.bin' })
  expect(await ui.find({ type: 'Text', text: /Archivo binario/ })).toBeDefined()
  expect(await ui.find({ type: 'Code' })).toBeUndefined()
})

test('a file deleted since the last commit stays in its place, struck through, and says where its diff is', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  expect((await nameRow(ui, 'old.png'))?.props).toMatchObject({ strikethrough: true })
  await ui.press({ key: 'n:old.png' })
  expect(await ui.find({ type: 'Text', text: /Se borró desde el último commit/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /\/nzt-changes/ })).toBeDefined()
})

test('a folder that cannot be read says so in its place and the rest keeps working', async ($, on) => {
  fakeDisk(on, { ...DISK, folders: { ...DISK.folders, [ROOT]: [...DISK.folders[ROOT]!, { name: 'secrets', kind: 'dir' }] } })
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:secrets' })
  expect(await ui.find({ type: 'Text', text: /⚠ no se pudo leer: .*EACCES/ })).toBeDefined()
  await ui.press({ key: 'n:README.md' })
  expect(await ui.find({ type: 'Markdown', text: '# Proj' })).toBeDefined()
})

test('a file taller than its window scrolls and says which lines show', async ($, on) => {
  const long = Array.from({ length: 60 }, (_, i) => `line ${i + 1}`).join('\n')
  fakeDisk(on, { ...DISK, files: { ...DISK.files, [`${ROOT}/src/main.ts`]: long } })
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:src' })
  await ui.press({ key: 'n:src/main.ts' })
  expect(await ui.find({ type: 'Text', text: /^líneas 1–\d+ de 60$/ })).toBeDefined()
  await ui.press({ key: 'view-down' })
  expect(await ui.find({ type: 'Text', text: /^líneas 2–\d+ de 60$/ })).toBeDefined()
})

// Context zero: the pane adds nothing to what Claude reads.

test('the command opens and closes the pane beside the conversation without printing a line', async ($, on) => {
  fakeDisk(on, DISK)
  expect(await openPane($)).toEqual({})
  await mount($)
  expect(await openPane($)).toEqual({})
})

test('the command prints one line only when the pane cannot go beside the conversation', async ($, on) => {
  fakeDisk(on, DISK)
  const opened = await $.command.run({
    command: 'nzt-files',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 160 },
  })
  expect(opened.text).toMatch(/sobre el prompt/)
})

test('in the app the command opens the pane beside the conversation and prints nothing', async ($, on) => {
  fakeDisk(on, DISK)
  on('session.surfaces', async () => ({ value: ['desktop'] }) as never)

  const opened = await $.command.run({
    command: 'nzt-files',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 160 },
  })

  expect(opened.text).toBeUndefined()
})

test('in the app the pane goes unframed, untitled, with no Close and no key on its buttons; the terminal keeps them', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)

  const desk = await mount($, 40, 60, 'desktop')
  const term = await mount($, 40, 60, 'terminal')

  expect((await desk.findAll({ type: 'Box' })).map(box => box.props.borderStyle).filter(Boolean)).toEqual([])
  expect(await desk.find({ key: 'close' })).toBeUndefined()
  expect(await desk.find({ type: 'Text', text: ' NZT ' })).toBeUndefined()
  expect((await desk.findAll({ type: 'Button' })).map(button => button.props.hotkey).filter(Boolean)).toEqual([])
  expect(await term.find({ key: 'close' })).toBeDefined()
  expect((await term.findAll({ type: 'Button' })).map(button => button.props.hotkey)).toContain('g')
})

test('in the app a C# file keeps the Visual Studio colors, in the code font, one row a line, its indent kept', async ($, on) => {
  const disk = {
    ...DISK,
    folders: { ...DISK.folders, [ROOT]: [...DISK.folders[ROOT]!, { name: 'App.cs', kind: 'file' as const }] },
    files: { ...DISK.files, [`${ROOT}/App.cs`]: 'var list = items.ToList();\r\n    return new Catalog(list);\r\n' },
  }
  fakeDisk(on, disk)
  await openPane($)
  const tree = await mount($, 40, 60, 'desktop')
  await clickRow(tree, 'App.cs')

  const file = await mountFile($)

  expect(await file.find({ type: 'Code' })).toBeUndefined()
  expect(await file.find({ type: 'Text', text: /^return$/ })).toMatchObject({ props: { color: '#D8A0DF' } })
  expect((await file.findAll({ type: 'Text', text: /Catalog/ })).map(found => found.props)).toContainEqual(expect.objectContaining({ mono: true, wrap: 'truncate-end' }))
  expect(await file.find({ type: 'Text', text: /^ {4}/ })).toBeDefined()
  expect(await file.find({ type: 'Text', text: '2 ' })).toMatchObject({ props: { mono: true } })
})

test('a tool call reaches the tool as it came and its result comes back untouched', async ($, on) => {
  fakeDisk(on, DISK)
  const seen: unknown[] = []
  on('tool.call', async (_, e) => {
    seen.push(e)
    return { result: 'the file' } as never
  })
  await openPane($)
  await mount($)
  const ran = await $.tool.call({ tool: 'Read', file_path: `${ROOT}/README.md` } as never)
  expect(ran).toEqual({ result: 'the file' })
  expect(seen[0]).toMatchObject({ tool: 'Read', file_path: `${ROOT}/README.md` })
  expect((seen[0] as Record<string, unknown>).context).toBeUndefined()
})

test('a tool whose result the pane cannot follow still gets it back untouched', async ($, on) => {
  fakeDisk(on, DISK)
  on('tool.call', async () => ({ result: { filenames: 'not a list' } }) as never)
  await openPane($)
  await mount($)
  expect(await $.tool.call({ tool: 'Grep', pattern: 'x' } as never)).toEqual({ result: { filenames: 'not a list' } })
})

test('a message naming @path reaches Claude as typed, with nothing added', async ($, on) => {
  fakeDisk(on, DISK)
  const seen: { text: string; context?: readonly string[] }[] = []
  on('prompt.submit', async (_, e) => {
    seen.push({ text: e.text, ...(e.context === undefined ? {} : { context: e.context }) })
    return { text: e.text }
  })
  await openPane($)
  await mount($)
  await $.prompt.submit({ text: 'look at @src/main.ts please' } as never)
  expect(seen).toEqual([{ text: 'look at @src/main.ts please' }])
})

// Claude's activity.

test('a file Claude reads is violet while the tool runs and goes out a few seconds after it ends', async ($, on) => {
  const { clock } = fakeDisk(on, DISK)
  const release = heldTool(on)
  await openPane($)
  const ui = await mount($)
  const call = $.tool.call({ tool: 'Read', file_path: `${ROOT}/README.md` } as never)
  await clock.settle()
  expect((await nameRow(ui, 'README.md'))?.props).toMatchObject({ color: VIOLET, bold: true })
  release()
  await call
  expect((await nameRow(ui, 'README.md'))?.props).toMatchObject({ color: VIOLET, dimColor: true })
  await clock.advance(3000)
  expect((await nameRow(ui, 'README.md'))?.props.color).toBeUndefined()
})

test('a file Claude writes is orange, and the tree opens its folders to show it', async ($, on) => {
  const { clock } = fakeDisk(on, DISK)
  const release = heldTool(on)
  await openPane($)
  const ui = await mount($)
  const call = $.tool.call({ tool: 'Edit', file_path: `${ROOT}/src/main.ts`, old_string: 'a', new_string: 'b' } as never)
  await clock.settle()
  expect((await nameRow(ui, 'main.ts'))?.props).toMatchObject({ color: ORANGE })
  release()
  await call
})

test('without following, a closed folder takes the color of the file Claude writes inside it', { options: { follow: false } }, async ($, on) => {
  const { clock } = fakeDisk(on, DISK)
  const release = heldTool(on)
  await openPane($)
  const ui = await mount($)
  const call = $.tool.call({ tool: 'Write', file_path: `${ROOT}/src/main.ts`, content: 'x' } as never)
  await clock.settle()
  expect(await nameRow(ui, 'main.ts')).toBeUndefined()
  expect((await nameRow(ui, 'src/'))?.props).toMatchObject({ color: ORANGE })
  release()
  await call
})

test('a tool that fails or is refused takes its color away at once', async ($, on) => {
  fakeDisk(on, DISK)
  on('tool.call', async () => ({ deny: 'the person said no' }) as never)
  await openPane($)
  const ui = await mount($)
  await $.tool.call({ tool: 'Read', file_path: `${ROOT}/README.md` } as never)
  expect((await nameRow(ui, 'README.md'))?.props.color).toBeUndefined()
})

test('a shell command that only reads paints the project files it names', async ($, on) => {
  const { clock } = fakeDisk(on, DISK)
  const release = heldTool(on)
  await openPane($)
  const ui = await mount($)
  const call = $.tool.call({ tool: 'Bash', command: 'cat README.md | head -n 5' } as never)
  await clock.settle()
  expect((await nameRow(ui, 'README.md'))?.props).toMatchObject({ color: VIOLET })
  release()
  await call
})

test('a search paints the files it found', async ($, on) => {
  fakeDisk(on, DISK)
  on('tool.call', async () => ({ result: { filenames: [`${ROOT}/README.md`], numFiles: 1 } }) as never)
  await openPane($)
  const ui = await mount($)
  await $.tool.call({ tool: 'Grep', pattern: 'Proj' } as never)
  expect((await nameRow(ui, 'README.md'))?.props).toMatchObject({ color: VIOLET })
})

test('what Claude reads outside the project paints nothing', async ($, on) => {
  const { clock } = fakeDisk(on, DISK)
  const release = heldTool(on)
  await openPane($)
  const ui = await mount($)
  const call = $.tool.call({ tool: 'Read', file_path: 'D:/elsewhere/README.md' } as never)
  await clock.settle()
  expect((await nameRow(ui, 'README.md'))?.props.color).toBeUndefined()
  release()
  await call
})

test('with the activity setting on writing only, what Claude reads is not painted', { options: { activity: 'write' } }, async ($, on) => {
  const { clock } = fakeDisk(on, DISK)
  const release = heldTool(on)
  await openPane($)
  const ui = await mount($)
  const call = $.tool.call({ tool: 'Read', file_path: `${ROOT}/README.md` } as never)
  await clock.settle()
  expect((await nameRow(ui, 'README.md'))?.props.color).toBeUndefined()
  release()
  await call
})

// The git line.

test('a commit Claude makes paints its files green and the last row says it is done', async ($, on) => {
  fakeDisk(on, DISK)
  on('tool.call', async () => ({ result: { stdout: '', stderr: '' } }) as never)
  await openPane($)
  const ui = await mount($)
  await $.tool.call({ tool: 'Bash', command: 'git commit -m "Update the readme"' } as never)
  expect((await nameRow(ui, 'README.md'))?.props).toMatchObject({ color: GREEN })
  expect(await ui.find({ type: 'Text', text: '● commit hecho' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: ' · Update the readme' })).toBeDefined()
})

test('a git operation says it is running, then that it failed, and the row goes after 45 seconds', async ($, on) => {
  const { clock } = fakeDisk(on, DISK)
  let release = () => {}
  const held = new Promise<void>(resolve => {
    release = resolve
  })
  on('tool.call', async () => {
    await held
    return { isError: true, result: 'rejected', text: 'rejected' } as never
  })
  await openPane($)
  const ui = await mount($)
  const call = $.tool.call({ tool: 'Bash', command: 'git push' } as never)
  await clock.settle()
  expect(await ui.find({ type: 'Text', text: '↻ haciendo push…' })).toBeDefined()
  release()
  await call
  expect(await ui.find({ type: 'Text', text: '✗ push falló' })).toBeDefined()
  await clock.advance(45_000)
  expect(await ui.find({ type: 'Text', text: '✗ push falló' })).toBeUndefined()
})

test('the heading says the branch, the remote one and how far ahead it is', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  expect(await ui.find({ type: 'Text', text: /⑂ mods → origin\/mods/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: ' ↑2' })).toBeDefined()
})

test('a modified file shows the lines it gained and lost', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:src' })
  expect(await ui.find({ type: 'Text', text: '+12' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^-3$/ })).toBeDefined()
})

test('a narrow pane shows only the letters, and a dot on the folder in place of its counts', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($, 40, 40)
  await ui.press({ key: 'n:src' })
  expect(await ui.find({ type: 'Text', text: '+12' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: 'M:1' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: '●' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'M' })).toBeDefined()
})

test('outside a repository the tree shows with no marks, and a line says when they show', async ($, on) => {
  fakeDisk(on, { ...DISK, isRepo: false })
  await openPane($)
  const ui = await mount($)
  expect(await nameRow(ui, 'README.md')).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /sin git/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /después de git init/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '●' })).toBeUndefined()
})

// Changed lines and ± Changes.


test('a modified file is drawn whole as a diff, the changed line removed and added again', async ($, on) => {
  const diff = { 'src/main.ts': ['@@ -1 +1 @@', '-export const a = 0', '+export const a = 1', '@@ -2,0 +3 @@', '+export const c = 3', ''].join('\n') }
  const text = "export const a = 1\nexport const b = 'two'\nexport const c = 3\n"
  fakeDisk(on, { ...DISK, diff, files: { ...DISK.files, [`${ROOT}/src/main.ts`]: text } })
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:src' })
  await ui.press({ key: 'n:src/main.ts' })
  const source = ['@@ -1,2 +1,3 @@', '-export const a = 0', '+export const a = 1', " export const b = 'two'", '+export const c = 3'].join('\n')
  expect(await ui.find({ type: 'Code' })).toMatchObject({ props: { format: 'diff', source } })
})

test('a removed line shows between the lines it went between', async ($, on) => {
  fakeDisk(on, { ...DISK, diff: { 'src/main.ts': '@@ -2 +1,0 @@\n-gone\n' } })
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:src' })
  await ui.press({ key: 'n:src/main.ts' })
  const source = ['@@ -1,3 +1,2 @@', ' export const a = 1', '-gone', " export const b = 'two'"].join('\n')
  expect(await ui.find({ type: 'Code' })).toMatchObject({ props: { format: 'diff', source } })
})

test('a file git does not follow yet is added whole', async ($, on) => {
  fakeDisk(on, { ...DISK, status: ['## mods', '?? src/main.ts', ''].join('\0') })
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:src' })
  await ui.press({ key: 'n:src/main.ts' })
  const source = ['@@ -0,0 +1,2 @@', '+export const a = 1', "+export const b = 'two'"].join('\n')
  expect(await ui.find({ type: 'Code' })).toMatchObject({ props: { format: 'diff', source } })
})

test('a file with no changes is drawn as code, with no change map beside the bar', async ($, on) => {
  const long = Array.from({ length: 300 }, (_, i) => `export const v${i + 1} = ${i + 1}`).join('\n')
  fakeDisk(on, { ...DISK, files: { ...DISK.files, [`${ROOT}/src/main.ts`]: long } })
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:src' })
  await ui.press({ key: 'n:src/main.ts' })
  expect(await ui.find({ type: 'Code' })).toMatchObject({ props: { startLine: 1 } })
  expect(((await ui.find({ type: 'Code' })) as { props: { format?: string } }).props.format).toBeUndefined()
  expect(await ui.find({ type: 'Box', key: 'track' })).toBeDefined()
  expect(await ui.find({ type: 'Box', key: 'map' })).toBeUndefined()
})

test('the change map colors the stretch that holds a change, apart from the track, and a click there goes to it', async ($, on) => {
  const long = Array.from({ length: 300 }, (_, i) => `export const v${i + 1} = ${i + 1}`).join('\n')
  fakeDisk(on, { ...DISK, diff: { 'src/main.ts': '@@ -249,0 +250 @@\n+export const v250 = 250\n' }, files: { ...DISK.files, [`${ROOT}/src/main.ts`]: long } })
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:src' })
  await ui.press({ key: 'n:src/main.ts' })
  const map = (await ui.find({ type: 'Box', key: 'map' })) as { children: { props?: { key?: string }; children?: { props?: { color?: string } }[] }[] }
  const marked = map.children.filter(row => row.children?.[0]?.props?.color === 'green')
  expect(marked.length).toBe(1)
  const track = (await ui.find({ type: 'Box', key: 'track' })) as { children: { children?: { props?: { color?: string } }[] }[] }
  expect(track.children.every(row => row.children?.[0]?.props?.color !== 'green')).toBe(true)
  await ui.press({ key: marked[0]!.props!.key! })
  expect(await ui.find({ type: 'Code', text: /^@@ -248,\d+ \+248,\d+ @@\n export const v248 = 248/ })).toBeDefined()
})

test('a drawn Markdown shows its changes on the change map only', async ($, on) => {
  const long = Array.from({ length: 80 }, (_, i) => `Párrafo ${i + 1}.\n`).join('\n')
  const status = ['## mods', ' M README.md', ''].join('\0')
  fakeDisk(on, { ...DISK, status, diff: { 'README.md': '@@ -69 +69 @@\n-x\n+y\n' }, files: { ...DISK.files, [`${ROOT}/README.md`]: long } })
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:README.md' })
  expect(await ui.find({ type: 'Markdown' })).toBeDefined()
  expect(await ui.find({ type: 'Code' })).toBeUndefined()
  const map = (await ui.find({ type: 'Box', key: 'map' })) as { children: { children?: { props?: { color?: string } }[] }[] }
  expect(map.children.some(row => row.children?.[0]?.props?.color === 'red')).toBe(true)
})

test('± Changes leaves only what changed, and pressed again brings the whole tree back as it was', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'changes' })
  expect(await nameRow(ui, 'main.ts')).toBeDefined()
  expect(await nameRow(ui, 'old.png')).toBeDefined()
  expect(await nameRow(ui, 'README.md')).toBeUndefined()
  expect(await ui.find({ type: 'Button', key: 'open-all' })).toBeUndefined()
  await ui.press({ key: 'changes' })
  expect(await nameRow(ui, 'README.md')).toBeDefined()
  expect(await nameRow(ui, 'main.ts')).toBeUndefined()
})

test('± Changes with nothing changed says so', async ($, on) => {
  fakeDisk(on, { ...DISK, status: ['## mods', ''].join('\0'), numstat: '' })
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'changes' })
  expect(await ui.find({ type: 'Text', text: /Nada cambió desde el último commit$/ })).toBeDefined()
})

test('outside a repository there is no ± Changes', async ($, on) => {
  fakeDisk(on, { ...DISK, isRepo: false })
  await openPane($)
  const ui = await mount($)
  expect(await ui.find({ type: 'Button', key: 'changes' })).toBeUndefined()
})

test('with notices off the git init line is gone', { options: { notices: false } }, async ($, on) => {
  fakeDisk(on, { ...DISK, isRepo: false })
  await openPane($)
  const ui = await mount($)
  expect(await ui.find({ type: 'Text', text: /después de git init/ })).toBeUndefined()
})

// Markdown.

test('a drawn Markdown keeps its line breaks, from a file saved with Windows line endings too', async ($, on) => {
  fakeDisk(on, { ...DISK, files: { ...DISK.files, [`${ROOT}/README.md`]: '# Proj\r\n\r\n> state: written\r\n\r\n- one\r\n- two\r\n' } })
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:README.md' })
  expect(await ui.find({ type: 'Markdown', text: '# Proj\n\n> state: written\n\n- one\n- two' })).toBeDefined()
})

const LONG_MD = Array.from({ length: 30 }, (_, i) => `## Part ${i + 1}\n\nText of part ${i + 1}.`).join('\n\n')

test('a Markdown file is drawn, with its box checked, and unchecking it shows the source', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:README.md' })
  expect(await ui.find({ type: 'Markdown', text: '# Proj' })).toBeDefined()
  expect(await ui.find({ type: 'Button', key: 'markdown', text: '☑ Markdown' })).toBeDefined()
  await ui.press({ key: 'markdown' })
  expect(await ui.find({ type: 'Code', text: '# Proj' })).toBeDefined()
  expect(await ui.find({ type: 'Button', key: 'markdown', text: '☐ Markdown' })).toBeDefined()
})

test('drawn Markdown moves a whole block at a time and says which lines show', async ($, on) => {
  fakeDisk(on, { ...DISK, files: { ...DISK.files, [`${ROOT}/README.md`]: LONG_MD } })
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:README.md' })
  expect(await ui.find({ type: 'Text', text: /^líneas 1–\d+ de 119 · de a bloque$/ })).toBeDefined()
  await ui.press({ key: 'view-down' })
  expect(await ui.find({ type: 'Text', text: /^líneas 3–\d+ de 119 · de a bloque$/ })).toBeDefined()
  expect((await ui.find({ type: 'Markdown' }))?.text.startsWith('Text of part 1.')).toBe(true)
})

test('a Markdown block larger than the engine draws at once shows the file as source and says why', async ($, on) => {
  // One table past the engine's 100,000 characters, within the 5,000 lines the viewer keeps.
  const huge = `| a |\n${`| ${'x'.repeat(30)} |\n`.repeat(3_000)}`
  fakeDisk(on, { ...DISK, files: { ...DISK.files, [`${ROOT}/README.md`]: huge } })
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:README.md' })
  expect(await ui.find({ type: 'Text', text: /Se ve como fuente/ })).toBeDefined()
  expect(await ui.find({ type: 'Markdown' })).toBeUndefined()
})

test('the file expands over the whole pane, and ← Árbol brings the tree back as it was', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:src' })
  await ui.press({ key: 'n:README.md' })
  await ui.press({ key: 'expand' })
  expect(await nameRow(ui, 'src/')).toBeUndefined()
  expect(await ui.find({ type: 'Button', key: 'expand', text: '← Árbol' })).toBeDefined()
  await ui.press({ key: 'expand' })
  expect(await nameRow(ui, 'main.ts')).toBeDefined()
  expect(await ui.find({ type: 'Markdown', text: '# Proj' })).toBeDefined()
})

// Search, keys, copy, open.

test('the search shows the matches under their folders, closed ones too, and Enter chooses the first', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  await ui.input({ key: 'search', text: 'MAIN', kind: 'change' })
  expect(await nameRow(ui, 'src/')).toBeDefined()
  expect(await nameRow(ui, 'main.ts')).toBeDefined()
  expect(await nameRow(ui, 'README.md')).toBeUndefined()
  await ui.input({ key: 'search', text: 'MAIN', kind: 'submit' })
  expect(await ui.find({ type: 'Code', text: /export const a = 1/ })).toBeDefined()
  expect(await nameRow(ui, 'README.md')).toBeDefined()
  expect(await nameRow(ui, 'main.ts')).toBeDefined()
})

test('a search with no match says so and stays open; emptying it brings the tree back', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  await ui.input({ key: 'search', text: 'zzz', kind: 'change' })
  expect(await ui.find({ type: 'Text', text: /Nada con «zzz»/ })).toBeDefined()
  expect(await ui.find({ type: 'Input', key: 'search' })).toBeDefined()
  await ui.press({ key: 'clear' })
  expect(await nameRow(ui, 'README.md')).toBeDefined()
})

test('the search does not walk into heavy folders', async ($, on) => {
  const disk = {
    ...DISK,
    folders: {
      ...DISK.folders,
      [ROOT]: [...DISK.folders[ROOT]!, { name: 'node_modules', kind: 'dir' as const }],
      [`${ROOT}/node_modules`]: [{ name: 'main-lib.js', kind: 'file' as const }],
    },
  }
  fakeDisk(on, disk)
  await openPane($)
  const ui = await mount($)
  await ui.input({ key: 'search', text: 'main', kind: 'change' })
  expect(await nameRow(ui, 'main.ts')).toBeDefined()
  expect(await nameRow(ui, 'main-lib.js')).toBeUndefined()
})

test('Unfold opens every folder but the heavy ones, reading them; Fold closes them all', async ($, on) => {
  const disk = {
    ...DISK,
    folders: {
      ...DISK.folders,
      [ROOT]: [...DISK.folders[ROOT]!, { name: 'node_modules', kind: 'dir' as const }],
      [`${ROOT}/src`]: [{ name: 'main.ts', kind: 'file' as const }, { name: 'lib', kind: 'dir' as const }],
      [`${ROOT}/src/lib`]: [{ name: 'deep.ts', kind: 'file' as const }],
      [`${ROOT}/node_modules`]: [{ name: 'pkg', kind: 'dir' as const }],
    },
  }
  fakeDisk(on, disk)
  await openPane($)
  const ui = await mount($)
  expect(await ui.find({ type: 'Button', key: 'up' })).toBeUndefined()
  await ui.press({ key: 'open-all' })
  expect(await nameRow(ui, 'main.ts')).toBeDefined()
  expect(await nameRow(ui, 'deep.ts')).toBeDefined()
  expect(await nameRow(ui, 'node_modules/')).toBeDefined()
  expect(await nameRow(ui, 'pkg/')).toBeUndefined()
  await ui.press({ key: 'close-all' })
  expect(await nameRow(ui, 'main.ts')).toBeUndefined()
  expect(await nameRow(ui, 'src/')).toBeDefined()
})

test('copy path puts the row path from the project folder on the clipboard and says so', async ($, on) => {
  const { seen } = fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:src' })
  await ui.press({ key: 'n:src/main.ts' })
  await ui.press({ key: 'copy' })
  expect(seen.copied).toEqual(['src/main.ts'])
  expect(await ui.find({ type: 'Text', text: 'Ruta copiada: src/main.ts' })).toBeDefined()
})

test('open with the app hands the file to Windows, and a double click does the same', async ($, on) => {
  const { seen, clock } = fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:README.md' })
  await ui.press({ key: 'open' })
  const opened = seen.argv.filter(argv => argv[0] === 'powershell.exe')
  expect(opened).toHaveLength(1)
  expect(opened[0]!.at(-1)).toBe("Start-Process -FilePath 'C:\\proj\\README.md'")
  await clock.advance(1000)
  await ui.press({ key: 'n:README.md' })
  await ui.press({ key: 'n:README.md' })
  expect(seen.argv.filter(argv => argv[0] === 'powershell.exe')).toHaveLength(2)
})

test('the open with setting runs its command with the file put in', { options: { openWith: 'code -g {path}' } }, async ($, on) => {
  const { seen } = fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:README.md' })
  await ui.press({ key: 'open' })
  const opened = seen.argv.find(argv => argv[0] === 'powershell.exe')
  expect(opened!.at(-1)).toBe("Start-Process -FilePath 'code' -ArgumentList @('-g','C:\\proj\\README.md')")
})

test('a file that cannot be opened says why and the pane stays as it was', async ($, on) => {
  fakeDisk(on, { ...DISK, openError: 'No application is associated with the specified file' })
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:README.md' })
  await ui.press({ key: 'open' })
  expect(await ui.find({ type: 'Text', text: /No se pudo abrir: No application/ })).toBeDefined()
  expect(await ui.find({ type: 'Markdown', text: '# Proj' })).toBeDefined()
})

test('a message naming @path opens its folders and highlights it', async ($, on) => {
  fakeDisk(on, DISK)
  on('prompt.submit', async (_, e) => ({ text: e.text }))
  await openPane($)
  const ui = await mount($)
  await $.prompt.submit({ text: 'look at @src/main.ts' } as never)
  expect(await nameRow(ui, 'main.ts')).toBeDefined()
})

// The column, the icons and opening at the start.

test('the column shows each file date, and Σ changes it to sizes', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  expect(await ui.find({ type: 'Text', text: '19 oct' })).toBeDefined()
  await ui.press({ key: 'sum' })
  expect(await ui.find({ type: 'Text', text: '7 B' })).toBeDefined()
})

test('the age column says how long ago', { options: { column: 'age' } }, async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  expect(await ui.find({ type: 'Text', text: '1h' })).toBeDefined()
})

test('in sizes a folder shows what everything inside it takes', { options: { column: 'size' } }, async ($, on) => {
  const { clock } = fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  await clock.settle()
  const size = DISK.files[`${ROOT}/src/main.ts`]!.length
  expect(await ui.find({ type: 'Text', text: `${size} B` })).toBeDefined()
})

test('with Nerd Font icons a folder row carries its folder icon', { options: { icons: 'nerd' } }, async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  expect(await ui.find({ type: 'Text', text: '▸ \u{f07b} ' })).toBeDefined()
})

test('the pane opens by itself when the session starts', async ($, on) => {
  const { seen } = fakeDisk(on, DISK)
  on('session.start', async (_, e) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true })
  expect(seen.opened).toEqual(['nzt-files'])
})

test('opened at the start and seated above the prompt, the pane closes again', async ($, on) => {
  const { seen } = fakeDisk(on, DISK)
  on('session.start', async (_, e) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true })
  await $.ui.mount({
    plugin: 'nzt-files',
    surface: 'terminal',
    component: 'Pane',
    requestId: 'nzt-files',
    viewport: { columns: 64, rows: 28 },
    props: { title: 'Archivos', isFocused: false, bodyColumns: 60, placement: 'inline', scroll: { offset: 0, bodyRows: 24 }, view: {} },
  })
  expect(seen.opened).toEqual(['nzt-files'])
  expect(seen.closed).toEqual(['nzt-files'])
})

test('with open at start off the pane waits for the command', { options: { openAtStart: false } }, async ($, on) => {
  const { seen } = fakeDisk(on, DISK)
  on('session.start', async (_, e) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true })
  expect(seen.opened).toEqual([])
})
