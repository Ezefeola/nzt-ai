import { expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'

type Engine = Parameters<TestBody>[0]
type On = Parameters<TestBody>[1]

const ROOT = 'C:/proj'

/** A project on disk: each folder's entries and each file's text; a folder not listed cannot be read. */
type Disk = {
  folders: Record<string, { name: string; kind: 'file' | 'dir' }[]>
  files: Record<string, string>
  status?: string
  isRepo?: boolean
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
  status: [' M src/main.ts', ' D old.png', ''].join('\0'),
}

const at = (path: unknown) => String(path).replace(/\\/g, '/')

const fakeDisk = (on: On, disk: Disk) => {
  on('session.root', async () => ({ value: ROOT }) as never)
  on('fs.list', async (_, e) => {
    const entries = disk.folders[at(e.path)]
    if (entries === undefined) return { deny: 'EACCES: permission denied' } as never
    return { value: entries.map(entry => ({ ...entry, size: 1, mtimeMs: 1, isLink: false })) }
  })
  on('fs.stat', async (_, e) => {
    const text = disk.files[at(e.path)]
    if (text === undefined) return { deny: 'ENOENT' } as never
    return { value: { kind: 'file', size: text.length, mtimeMs: 1, isLink: false } }
  })
  on('fs.read', async (_, e) => {
    const text = disk.files[at(e.path)]
    if (text === undefined) return { deny: 'ENOENT' } as never
    return { value: text }
  })
  on('process.run', async (_, e) => {
    if (disk.isRepo === false) return run('', 128, 'fatal: not a git repository')
    if (e.argv.includes('--show-prefix')) return run('\n')
    return run(disk.status ?? '')
  })
  on('ui.open', async () => ({ value: { isPlaced: true } }))
  on('ui.close', async () => ({ value: undefined }) as never)
}

const openPane = ($: Engine) =>
  $.command.run({
    command: 'nzt-files',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 160 },
  })

const mount = ($: Engine, bodyRows = 40) =>
  $.ui.mount({
    plugin: 'nzt-files',
    surface: 'terminal',
    component: 'Pane',
    requestId: 'nzt-files',
    viewport: { columns: 64, rows: bodyRows + 4 },
    props: {
      title: 'Archivos',
      isFocused: true,
      bodyColumns: 60,
      placement: 'dock',
      scroll: { offset: 0, bodyRows },
      view: {},
    },
  })

test('the pane opens on the project: folders first, .git hidden, marks and dots of git', async ($, on) => {
  fakeDisk(on, DISK)
  expect(await openPane($)).toEqual({ text: 'Explorador abierto.' })
  const ui = await mount($)
  expect(await ui.find({ type: 'Text', text: 'src/' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'README.md' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '.git/' })).toBeUndefined()
  expect(await ui.find({ type: 'Text', text: '●' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Elegí un archivo del árbol\.$/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: / 2 cambiados$/ })).toBeDefined()
})

test('the card keeps a blank row under the pane tabs and still fills the body', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  expect(await ui.drawn()).toMatchObject({ props: { marginTop: 1, height: 39 } })
})

test('a folder opens with a click and its file shows beneath, numbered, with its detail', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:src' })
  expect(await ui.find({ type: 'Text', text: 'main.ts' })).toBeDefined()
  await ui.press({ key: 'n:src/main.ts' })
  expect(await ui.find({ type: 'Text', text: 'src/main.ts' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'M modificado' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /TypeScript · \d+ B · 2 líneas/ })).toBeDefined()
  expect(await ui.find({ type: 'Code', text: "export const a = 1\nexport const b = 'two'" })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '2 líneas' })).toBeDefined()
  await ui.press({ key: 'n:src' })
  expect(await ui.find({ type: 'Text', text: /^main\.ts$/ })).toBeUndefined()
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
  expect(await ui.find({ type: 'Text', text: 'old.png', strikethrough: true } as never)).toBeDefined()
  await ui.press({ key: 'n:old.png' })
  expect(await ui.find({ type: 'Text', text: /Se borró desde el último commit/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /\/nzt-changes/ })).toBeDefined()
})

test('outside a repository the tree shows with no marks and no error', async ($, on) => {
  fakeDisk(on, { ...DISK, isRepo: false })
  await openPane($)
  const ui = await mount($)
  expect(await ui.find({ type: 'Text', text: 'README.md' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /sin git/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: '●' })).toBeUndefined()
})

test('a folder that cannot be read says so in its place and the rest keeps working', async ($, on) => {
  fakeDisk(on, { ...DISK, folders: { ...DISK.folders, [ROOT]: [...DISK.folders[ROOT]!, { name: 'secrets', kind: 'dir' }] } })
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:secrets' })
  expect(await ui.find({ type: 'Text', text: /⚠ no se pudo leer: .*EACCES/ })).toBeDefined()
  await ui.press({ key: 'n:README.md' })
  expect(await ui.find({ type: 'Code', text: '# Proj' })).toBeDefined()
})

test('a file taller than its window scrolls and says which lines show', async ($, on) => {
  const long = Array.from({ length: 60 }, (_, i) => `line ${i + 1}`).join('\n')
  fakeDisk(on, { ...DISK, files: { ...DISK.files, [`${ROOT}/README.md`]: long } })
  await openPane($)
  const ui = await mount($)
  await ui.press({ key: 'n:README.md' })
  expect(await ui.find({ type: 'Text', text: /^líneas 1–\d+ de 60$/ })).toBeDefined()
  await ui.press({ key: 'down' })
  expect(await ui.find({ type: 'Text', text: /^líneas 2–\d+ de 60$/ })).toBeDefined()
})

test('the command closes the pane when it is open', async ($, on) => {
  fakeDisk(on, DISK)
  await openPane($)
  await mount($)
  expect(await openPane($)).toEqual({ text: 'Explorador cerrado.' })
})
