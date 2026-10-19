import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, RenderSurface, Timer } from 'claude-code'

import type { Doing, Explorer, GitOp, Listing, Mark, Marks, Opened, Size } from '../types'
import { FADE_MS, foundOf, isShown, shellReadOf, touchOf } from './activity'
import { branchOf, COUNT_ORDER, countsOf, gitOpsOf, linesOf, wordsOf } from './git'
import { langOf, TEXTS } from './i18n'
import type { Texts } from './i18n'
import { iconOf } from './icons'
import { isPictureFile, kindOf } from './kinds'
import { blocksOf, blockWindow, hasHugeBlock, isMarkdownFile } from './markdown'
import type { Block } from './markdown'
import { HEAVY, matchesOf, searchTreeOf } from './search'
import type { Indexed } from './search'
import { settingsOf } from './settings'
import type { Settings } from './settings'
import {
  ancestorsOf,
  contentOf,
  fit,
  folderOf,
  isBinaryText,
  marksOf,
  nameOf,
  printable,
  relativeTo,
  rowsOf,
  textWindow,
  treeWindow,
} from './tree'
import type { Row } from './tree'

const PANE = 'nzt-files'
const POLL_MS = 3000
// The card's rows besides the tree and the file: its border, heading, search, rule, path,
// detail, the file's tools, position line, git line and button.
const CARD_ROWS = 11
const MIN_VIEW_ROWS = 3
const TREE_ROWS = { inline: 7, dock: 15 } as const
const DOCK_COLUMNS = 58
const INLINE_ROWS = 24
const DOCK_FLOOR = 110
// Below it the person's columns cannot hold the column, the lines and the folders' counts.
const WIDE_COLUMNS = 46
// What one $.fs.read copies at most; a larger file rejects.
const READ_LIMIT = 4 * 1024 * 1024
const GIT_OP_MS = 45_000
const NOTICE_MS = 3000
const DOUBLE_PRESS_MS = 450
const SIZE_LIMIT_MS = 15_000
// A project past this many entries is searched in what was walked so far.
const INDEX_LIMIT = 50_000
// The accent of NZT's mods, the one nzt-state uses: a theme key, so it follows the theme.
const ACCENT = 'claude'
const CURRENT = 'cyan'
const CHOSEN_BG = '#263a42'
const CURSOR_BG = '#1f2c31'

const MARK_COLOR = { M: 'yellow', U: 'green', A: 'green', D: 'red' } as const satisfies Record<Mark, string>
const DOING_COLOR = { read: '#c084fc', write: '#fb923c', commit: '#4ade80' } as const satisfies Record<Doing['kind'], string>
// When a closed folder holds files of several kinds of work, the strongest paints it.
const DOING_RANK = { read: 1, commit: 2, write: 3 } as const satisfies Record<Doing['kind'], number>

const listings = atom({ plugin: 'nzt-files', key: 'listings' } as const, {} as Record<string, Listing>)
const marks = atom({ plugin: 'nzt-files', key: 'marks' } as const, { kind: 'idle' } as Marks)
const explorer = atom({ plugin: 'nzt-files', key: 'explorer' } as const, {
  open: [],
  selected: null,
  cursor: null,
  treeTop: null,
  viewTop: 0,
  opened: null,
  expanded: false,
  markdown: true,
  search: '',
  sized: null,
} as Explorer)
const activity = atom({ plugin: 'nzt-files', key: 'activity' } as const, {} as Record<string, Doing>)
const gitOp = atom({ plugin: 'nzt-files', key: 'gitOp' } as const, null as GitOp | null)
const sizes = atom({ plugin: 'nzt-files', key: 'sizes' } as const, {} as Record<string, Size>)
const notice = atom({ plugin: 'nzt-files', key: 'notice' } as const, null as string | null)

// Module state a reload starts over: the project's folder, the chosen file's lines, whether
// the pane is showing, the search's walk of the project and the timers that put colors out.
let root: string | undefined
let content: { path: string; mtimeMs: number; lines: string[]; blocks?: Block[] } | undefined
let isShowing = false
let isOpenedAtStart = false
let running: Promise<void> | undefined
let isAgain = false
let t: Texts = TEXTS.es
let settings: Settings = settingsOf({})
let index: Indexed[] | undefined
let indexing: Promise<Indexed[]> | undefined
let lastPress: { path: string; at: number } | undefined
// The row Claude's work brought into view, which the tree keeps in view until the person moves.
let followed: string | null = null
const fades = new Map<string, Timer>()
let gitOpTimer: Timer | undefined
let noticeTimer: Timer | undefined
const sizing = new Set<string>()
// Where the last drawing put the tree and the file, in body rows, how far each scrolls, and
// the rows the keys walk: a wheel tick is told apart by the row under the pointer.
let layout = { tree: [0, 0], treeFrom: 0, treeLastTop: 0, viewLastTop: 0, viewPage: 1, rows: [] as string[] }

/** The explorer as this version reads it, whatever an older one left in the session. */
const explorerOf = (value: Partial<Explorer> | undefined): Explorer => ({
  open: Array.isArray(value?.open) ? value.open.filter(path => typeof path === 'string') : [],
  selected: typeof value?.selected === 'string' ? value.selected : null,
  cursor: typeof value?.cursor === 'string' ? value.cursor : null,
  treeTop: Number.isFinite(value?.treeTop) ? value!.treeTop! : null,
  viewTop: Number.isFinite(value?.viewTop) ? value!.viewTop! : 0,
  opened: value?.opened ?? null,
  expanded: value?.expanded === true,
  markdown: value?.markdown !== false,
  search: typeof value?.search === 'string' ? value.search : '',
  sized: typeof value?.sized === 'boolean' ? value.sized : null,
})

const reasonOf = (error: unknown) => (error instanceof Error ? error.message : String(error))

/** A file's kind as the detail line names it, or undefined with no extension. */
const kindLabel = (path: string) => {
  const kind = kindOf(path)
  if (kind === undefined) return undefined
  return kind.kind === 'named' ? kind.name : kind.kind === 'image' ? t.image(kind.format) : t.text
}

const isWindows = () => root !== undefined && /^[A-Za-z]:/.test(root)

const opName = (op: string) => t.gitOps[op] ?? op

// The engine follows $ only into functions declared in this file, so everything that reads
// the disk, runs git or draws lives here; what they return is shaped in the other files.

function pathOf(relative: string) {
  return relative === '' ? root! : `${root}/${relative}`
}

async function rootOf($: EngineInterface) {
  if (root === undefined) root = (await $.session.root()).replace(/\\/g, '/').replace(/\/$/, '')
  return root
}

async function git($: EngineInterface, argv: string[]) {
  try {
    const ran = await $.process.run(['git', ...argv], { cwd: root })
    return ran.exitCode === 0 ? ran.stdout : undefined
  } catch {
    return undefined
  }
}

async function listFolder($: EngineInterface, folder: string, files: Record<string, Mark>): Promise<Listing> {
  try {
    const entries = await $.fs.list(pathOf(folder))
    return {
      kind: 'ok',
      entries: entries.map(entry => ({
        name: entry.name,
        isDir: entry.kind === 'dir',
        size: entry.size,
        mtimeMs: entry.mtimeMs,
      })),
    }
  } catch (error) {
    // A folder deleted since the last commit is gone from the disk and still shown.
    const prefix = `${folder}/`
    if (Object.entries(files).some(([path, mark]) => mark === 'D' && path.startsWith(prefix))) {
      return { kind: 'ok', entries: [] }
    }
    return { kind: 'error', message: reasonOf(error) }
  }
}

async function readMarks($: EngineInterface): Promise<Marks> {
  const prefix = await git($, ['rev-parse', '--show-prefix'])
  if (prefix === undefined) return { kind: 'norepo' }
  const status = await git($, ['status', '--porcelain=v1', '-z', '--branch', '--untracked-files=all'])
  if (status === undefined) return { kind: 'norepo' }
  const own = prefix.trim()
  // With no commit yet there is no HEAD to count lines against: the diff fails and counts none.
  const numstat = (await git($, ['diff', 'HEAD', '--numstat', '-z'])) ?? ''
  const found = branchOf(status)
  const commit = found === 'detached' ? (await git($, ['rev-parse', '--short', 'HEAD']))?.trim() : undefined
  const branch = found === 'detached' ? (commit === undefined ? undefined : { kind: 'detached' as const, commit }) : found
  return {
    kind: 'ok',
    files: marksOf(status, own),
    lines: linesOf(numstat, own),
    ...(branch === undefined ? {} : { branch }),
  }
}

/** Reads the chosen file into the viewer, unless it is the one already read and unchanged. */
async function loadFile($: EngineInterface, path: string, force = false) {
  const files = await read($, marks)
  const stat = await $.fs.stat(pathOf(path)).catch(() => undefined)
  let opened: Opened
  if (stat === undefined) {
    const isDeleted = files.kind === 'ok' && files.files[path] === 'D'
    opened = { kind: isDeleted ? 'deleted' : 'gone' }
  } else if (!force && content?.path === path && content.mtimeMs === stat.mtimeMs) {
    return
  } else if (stat.size > READ_LIMIT) {
    opened = { kind: 'tooBig', size: stat.size }
  } else if (isPictureFile(path)) {
    opened = { kind: 'binary', size: stat.size }
  } else {
    const text = await $.fs.read(pathOf(path)).catch((error: unknown) => error)
    if (typeof text !== 'string') opened = { kind: 'error', message: reasonOf(text) }
    else if (isBinaryText(text)) opened = { kind: 'binary', size: stat.size }
    else {
      const kept = contentOf(text)
      content = { path, mtimeMs: stat.mtimeMs, lines: kept.lines }
      if (isMarkdownFile(path)) content.blocks = blocksOf(kept.lines)
      opened = { kind: 'text', lines: kept.total, shown: kept.lines.length, size: stat.size }
    }
  }
  if (opened.kind !== 'text') content = undefined
  await update($, explorer, value => {
    const now = explorerOf(value)
    return now.selected === path ? { ...now, opened } : now
  })
}

async function readOnce($: EngineInterface) {
  await rootOf($)
  const nextMarks = await readMarks($)
  if (JSON.stringify(nextMarks) !== JSON.stringify(await read($, marks))) await update($, marks, () => nextMarks)
  const files = nextMarks.kind === 'ok' ? nextMarks.files : {}
  const now = explorerOf(await read($, explorer))
  const known = await read($, listings)
  const next: Record<string, Listing> = {}
  for (const folder of ['', ...now.open]) next[folder] = await listFolder($, folder, files)
  if (JSON.stringify(next) !== JSON.stringify(known)) await update($, listings, () => next)
  if (now.selected !== null) await loadFile($, now.selected)
}

// One read at a time; a request that arrives during one runs once more after it, so a
// change that lands mid-read is not missed.
function refresh($: EngineInterface): Promise<void> {
  if (running !== undefined) {
    isAgain = true
    return running
  }
  running = (async () => {
    do {
      isAgain = false
      await readOnce($).catch(() => undefined)
    } while (isAgain)
  })().finally(() => {
    running = undefined
  })
  return running
}

/** Every file and folder of the project the search looks at, walked once per search. */
async function walkProject($: EngineInterface): Promise<Indexed[]> {
  const found: Indexed[] = []
  const queue = ['']
  while (queue.length > 0 && found.length < INDEX_LIMIT) {
    const folder = queue.shift()!
    const entries = await $.fs.list(pathOf(folder)).catch(() => [])
    for (const entry of entries) {
      const path = folder === '' ? entry.name : `${folder}/${entry.name}`
      const isDir = entry.kind === 'dir'
      if (isDir && HEAVY.has(entry.name)) continue
      found.push({ path, isDir, size: entry.size, mtimeMs: entry.mtimeMs })
      if (isDir) queue.push(path)
    }
  }
  return found
}

function indexOf($: EngineInterface): Promise<Indexed[]> {
  if (index !== undefined) return Promise.resolve(index)
  indexing ??= walkProject($).then(found => {
    index = found
    indexing = undefined
    return found
  })
  return indexing
}

/** What everything inside a folder takes, or `failed` past the limit or on a folder it cannot read. */
async function folderSize($: EngineInterface, folder: string, until: number): Promise<number | 'failed'> {
  let total = 0
  const queue = [folder]
  while (queue.length > 0) {
    if ((await $.clock.now()) > until) return 'failed'
    const current = queue.shift()!
    let entries
    try {
      entries = await $.fs.list(pathOf(current))
    } catch {
      return 'failed'
    }
    for (const entry of entries) {
      if (entry.kind === 'dir') queue.push(current === '' ? entry.name : `${current}/${entry.name}`)
      else total += entry.size
    }
  }
  return total
}

/** Counts the folders shown whose size is not known yet, one after another, behind the drawing. */
async function countSizes($: EngineInterface, folders: string[]) {
  const known = await read($, sizes)
  const wanted = folders.filter(folder => known[folder] === undefined && !sizing.has(folder))
  if (wanted.length === 0) return
  for (const folder of wanted) sizing.add(folder)
  await update($, sizes, value => ({ ...value, ...Object.fromEntries(wanted.map(folder => [folder, 'pending' as const])) }))
  for (const folder of wanted) {
    const size = await folderSize($, folder, (await $.clock.now()) + SIZE_LIMIT_MS)
    sizing.delete(folder)
    await update($, sizes, value => ({ ...value, [folder]: size }))
  }
}

/** Forgets the sizes of the folders that hold `path`, so the next drawing counts them again. */
async function forgetSizes($: EngineInterface, path: string) {
  const held = ['', ...ancestorsOf(path)]
  await update($, sizes, value => {
    const kept = { ...value }
    for (const folder of held) if (!sizing.has(folder)) delete kept[folder]
    return kept
  })
}

/** Opens the folders that hold `path`, reading each, and keeps the tree on it. */
async function reveal($: EngineInterface, path: string, asCursor: boolean) {
  const folders = ancestorsOf(path)
  await update($, explorer, value => {
    const now = explorerOf(value)
    const open = [...now.open, ...folders.filter(folder => !now.open.includes(folder))]
    return { ...now, open, treeTop: null, ...(asCursor ? { cursor: path } : {}) }
  })
  followed = path
  const known = await read($, listings)
  const git = await read($, marks)
  const files = git.kind === 'ok' ? git.files : {}
  const fresh = await Promise.all(
    folders.filter(folder => known[folder] === undefined).map(async folder => [folder, await listFolder($, folder, files)] as const),
  )
  if (fresh.length > 0) await update($, listings, value => ({ ...value, ...Object.fromEntries(fresh) }))
}

async function say($: EngineInterface, text: string) {
  noticeTimer?.cancel()
  await update($, notice, () => text)
  noticeTimer = $.clock.after(NOTICE_MS, () => {
    void update($, notice, () => null)
  })
}

/** Paints a file with what Claude is doing to it, and brings it into view while following. */
async function paint($: EngineInterface, paths: string[], kind: Doing['kind']) {
  if (!isShown(settings.activity, kind) || paths.length === 0) return
  for (const path of paths) fades.get(path)?.cancel()
  await update($, activity, value => ({
    ...value,
    ...Object.fromEntries(paths.map(path => [path, { kind, isFading: false }])),
  }))
  if (kind === 'write') for (const path of paths) await forgetSizes($, path)
  // Behind the tool, not before it: opening folders reads the disk, and the tool waits on nothing of the pane's.
  if (settings.follow && isShowing) void reveal($, paths[paths.length - 1]!, false).catch(() => undefined)
}

/** Puts the colors out: slowly once the tool ended well, at once when it failed or was refused. */
async function unpaint($: EngineInterface, paths: string[], isWell: boolean) {
  if (paths.length === 0) return
  if (!isWell) {
    await update($, activity, value => {
      const kept = { ...value }
      for (const path of paths) delete kept[path]
      return kept
    })
    return
  }
  await update($, activity, value => {
    const kept = { ...value }
    for (const path of paths) if (kept[path] !== undefined) kept[path] = { ...kept[path]!, isFading: true }
    return kept
  })
  for (const path of paths) {
    fades.get(path)?.cancel()
    fades.set(
      path,
      $.clock.after(FADE_MS, () => {
        fades.delete(path)
        void update($, activity, value => {
          if (value[path]?.isFading !== true) return value
          const kept = { ...value }
          delete kept[path]
          return kept
        })
      }),
    )
  }
}

/** The files of the project among `named`: the ones a reading command names that exist. */
async function projectFiles($: EngineInterface, named: string[]) {
  const files: string[] = []
  for (const word of named) {
    const path = relativeTo(root!, word)
    if (path === undefined || path === '') continue
    const stat = await $.fs.stat(pathOf(path)).catch(() => undefined)
    if (stat?.kind === 'file') files.push(path)
  }
  return files
}

/** The project's changed files as git sees them, with what each holds, to tell what a command wrote. */
async function changedFingerprint($: EngineInterface) {
  const status = (await git($, ['status', '--porcelain=v1', '-z', '--untracked-files=all'])) ?? ''
  const numstat = (await git($, ['diff', 'HEAD', '--numstat', '-z'])) ?? ''
  const prefix = ((await git($, ['rev-parse', '--show-prefix'])) ?? '').trim()
  const files = marksOf(status, prefix)
  const lines = linesOf(numstat, prefix)
  const print: Record<string, string> = {}
  for (const [path, mark] of Object.entries(files)) {
    const stat = mark === 'D' ? undefined : await $.fs.stat(pathOf(path)).catch(() => undefined)
    print[path] = `${mark}:${lines[path]?.join(',') ?? ''}:${stat?.mtimeMs ?? ''}`
  }
  return print
}

async function setGitOp($: EngineInterface, op: GitOp | null) {
  gitOpTimer?.cancel()
  await update($, gitOp, () => op)
  if (op !== null && op.state !== 'running') {
    gitOpTimer = $.clock.after(GIT_OP_MS, () => {
      void update($, gitOp, value => (value === op || JSON.stringify(value) === JSON.stringify(op) ? null : value))
    })
  }
}

/** The files the last commit holds, and its message. */
async function lastCommit($: EngineInterface) {
  const prefix = ((await git($, ['rev-parse', '--show-prefix'])) ?? '').trim()
  const names = (await git($, ['show', '--name-only', '--format=', '-z', 'HEAD'])) ?? ''
  const subject = ((await git($, ['log', '-1', '--format=%s'])) ?? '').trim()
  const files = names
    .split('\0')
    .filter(name => name !== '' && name.startsWith(prefix))
    .map(name => name.slice(prefix.length))
  return { files, subject }
}

/** Opens the folder or closes it; the tree stays where it is. */
async function toggle($: EngineInterface, folder: string) {
  const now = explorerOf(await read($, explorer))
  const isOpen = now.open.includes(folder)
  followed = null
  await update($, explorer, value => {
    const own = explorerOf(value)
    const open = isOpen ? own.open.filter(path => path !== folder) : [...own.open, folder]
    return { ...own, open, cursor: folder, treeTop: layout.treeFrom }
  })
  if (isOpen) return
  const files = await read($, marks)
  const listing = await listFolder($, folder, files.kind === 'ok' ? files.files : {})
  await update($, listings, value => ({ ...value, [folder]: listing }))
}

/** Shows a file in the viewer from its top; pressed twice in a row, opens it with its app. */
async function choose($: EngineInterface, path: string) {
  const at = await $.clock.now()
  const isDouble = lastPress?.path === path && at - lastPress.at < DOUBLE_PRESS_MS
  lastPress = { path, at }
  if (isDouble) {
    lastPress = undefined
    await openWithApp($, path)
    return
  }
  followed = null
  const now = explorerOf(await read($, explorer))
  if (now.selected === path && now.opened !== null && now.opened.kind !== 'loading') {
    await update($, explorer, value => ({ ...explorerOf(value), cursor: path }))
    return
  }
  const loading: Opened = { kind: 'loading' }
  await update($, explorer, value => ({
    ...explorerOf(value),
    selected: path,
    cursor: path,
    viewTop: 0,
    treeTop: layout.treeFrom,
    opened: loading,
  }))
  await loadFile($, path, true)
}

/** Moves the file's window by `by` lines (blocks, in drawn Markdown), within what the last drawing allowed. */
async function scrollView($: EngineInterface, by: number) {
  await update($, explorer, value => {
    const now = explorerOf(value)
    return { ...now, viewTop: Math.max(0, Math.min(now.viewTop + by, layout.viewLastTop)) }
  })
}

/** Moves the row the keys act on by `by` rows of the tree, and the focus ring with it. */
async function moveCursor($: EngineInterface, by: number) {
  const rows = layout.rows
  if (rows.length === 0) return
  const now = explorerOf(await read($, explorer))
  const at = rows.indexOf(now.cursor ?? now.selected ?? '')
  const next = rows[Math.max(0, Math.min(rows.length - 1, at < 0 ? 0 : at + by))]!
  followed = null
  await update($, explorer, value => ({ ...explorerOf(value), cursor: next, treeTop: null }))
  await $.ui.focus({ requestId: PANE, key: `n:${next}` }).catch(() => undefined)
}

/** `l`: opens the cursor's folder, or shows its file. */
async function cursorIn($: EngineInterface) {
  const now = explorerOf(await read($, explorer))
  const path = now.cursor ?? now.selected
  if (path === null) return moveCursor($, 0)
  const parent = (await read($, listings))[folderOf(path)]
  const entry = parent?.kind === 'ok' ? parent.entries.find(own => own.name === nameOf(path)) : undefined
  if (entry?.isDir) {
    if (!now.open.includes(path)) await toggle($, path)
    return
  }
  lastPress = undefined
  await choose($, path)
}

/** `h`: closes the cursor's folder, or goes up to the folder that holds the cursor's row. */
async function cursorOut($: EngineInterface) {
  const now = explorerOf(await read($, explorer))
  const path = now.cursor ?? now.selected
  if (path === null) return
  if (now.open.includes(path)) {
    await toggle($, path)
    return
  }
  const up = folderOf(path)
  if (up === '') return
  await update($, explorer, value => ({ ...explorerOf(value), cursor: up, treeTop: null }))
  await $.ui.focus({ requestId: PANE, key: `n:${up}` }).catch(() => undefined)
}

/** The row the file's tools act on: the cursor's, else the chosen file. */
async function targetOf($: EngineInterface) {
  const now = explorerOf(await read($, explorer))
  return now.cursor ?? now.selected
}

async function copyPath($: EngineInterface, surface: RenderSurface) {
  const path = await targetOf($)
  if (path === null) return
  const copied = await $.ui.copy({ text: path, surface }).catch(() => undefined)
  await say($, copied?.isCopied === true ? t.copied(path) : t.copyFailed)
}

/** The command line the `Abrir con` setting asks for, with the file's path and folder put in. */
const commandLineOf = (template: string, file: string, folder: string, quote: (text: string) => string) => {
  const words = wordsOf(template)
  const hasPath = words.some(word => word.includes('{path}'))
  const put = (word: string) => word.replaceAll('{path}', file).replaceAll('{dir}', folder)
  return [...words.map(put), ...(hasPath ? [] : [file])].map(quote)
}

/** Opens a file with the app the system has for it, or with the command the settings name. */
async function openWithApp($: EngineInterface, path: string) {
  const file = pathOf(path)
  const folder = pathOf(folderOf(path))
  const native = (text: string) => (isWindows() ? text.replace(/\//g, '\\') : text)
  // PowerShell's single quotes take everything literally but a single quote, written twice.
  const psQuote = (text: string) => `'${text.replace(/'/g, "''")}'`
  let argv: string[]
  if (settings.openWith !== '') {
    const words = commandLineOf(settings.openWith, native(file), native(folder), text => text)
    if (isWindows()) {
      // Start-Process does not wait for the program, which may stay open for as long as the person likes.
      const args = words.slice(1).map(word => psQuote(word.includes(' ') ? `"${word}"` : word))
      const list = args.length === 0 ? '' : ` -ArgumentList @(${args.join(',')})`
      argv = ['powershell.exe', '-NoProfile', '-NonInteractive', '-Command', `Start-Process -FilePath ${psQuote(words[0]!)}${list}`]
    } else {
      argv = ['sh', '-c', `${words.map(word => `'${word.replace(/'/g, `'\\''`)}'`).join(' ')} >/dev/null 2>&1 &`]
    }
  } else if (isWindows()) {
    argv = ['powershell.exe', '-NoProfile', '-NonInteractive', '-Command', `Start-Process -FilePath ${psQuote(native(file))}`]
  } else {
    argv = [/^\/Users\//.test(file) ? 'open' : 'xdg-open', file]
  }
  try {
    const ran = await $.process.run(argv, { cwd: root, timeoutMs: 15_000 })
    if (ran.exitCode !== 0) await say($, t.openFailed(printable(ran.stderr.trim().split('\n')[0] || t.noApp)))
  } catch (error) {
    await say($, t.openFailed(printable(reasonOf(error))))
  }
}

/** What the search shows: the matches under the folders that hold them. */
async function searchFor($: EngineInterface, query: string) {
  await update($, explorer, value => ({ ...explorerOf(value), search: query, treeTop: null }))
  // Each search walks the project afresh, so it finds what was created since the last one.
  if (query.trim() === '') index = undefined
  else await indexOf($)
}

/** Enter in the search: shows the first match, empties the search and leaves its folders open. */
async function chooseFirst($: EngineInterface, query: string) {
  const found = matchesOf(index ?? (await indexOf($)), query)[0]
  await update($, explorer, value => ({ ...explorerOf(value), search: '' }))
  index = undefined
  if (found === undefined) return
  await reveal($, found.path, true)
  if (found.isDir) {
    const now = explorerOf(await read($, explorer))
    if (!now.open.includes(found.path)) await toggle($, found.path)
    return
  }
  lastPress = undefined
  await choose($, found.path)
}

async function closePane($: EngineInterface) {
  isShowing = false
  await $.ui.close({ id: PANE }).catch(() => undefined)
}

/** Opens the pane; true when it sits beside the conversation. */
async function openPane($: EngineInterface) {
  const opened = await $.ui.open({
    id: PANE,
    title: t.title,
    focus: true,
    closeOnEscape: true,
    rows: INLINE_ROWS,
    columns: DOCK_COLUMNS,
  })
  isShowing = true
  await refresh($)
  return opened
}

export const register: Register = (on, options) => {
  t = TEXTS[langOf(options.language)]
  settings = settingsOf(options)

  // Nothing the pane does reaches what Claude reads: no context at the start, none with a
  // prompt, none with a tool's result, and the command prints only when it has to.
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'nzt-files', description: t.commandDescription })
    $.clock.every(POLL_MS, () => {
      if (isShowing) void refresh($)
    })
    const started = await next(e)
    if (settings.openAtStart && e.isInteractive && e.surface === 'terminal' && !isShowing) {
      // At the start a pane goes only beside the conversation: one that waits for room, or
      // that the first drawing seats above the prompt, is closed again.
      isOpenedAtStart = true
      const opened = await openPane($).catch(() => undefined)
      if (opened?.isPlaced !== true) {
        isOpenedAtStart = false
        await closePane($)
      }
    }

    return started
  })

  on('command.run', { command: 'nzt-files' }, async ($, e) => {
    if (isShowing) {
      await closePane($)
      return {}
    }
    const opened = await openPane($)
    if (!opened.isPlaced) return { text: t.paneWaiting(opened.reason) }
    // Claude Code docks a pane beside the transcript only in fullscreen and from 110 columns.
    const { isFullscreen, columns } = e.presentation
    if (!isFullscreen) return { text: t.paneInlineNoFullscreen }
    if (columns < DOCK_FLOOR) return { text: t.paneInlineNarrow(columns, DOCK_FLOOR) }
    return {}
  })

  // The tree is exactly as tall as the body, so the engine has nothing to scroll: the wheel
  // moves the tree when it is over the tree, and the file anywhere else; an arrow walks the
  // tree's rows, a page key turns the file's page, Home and End go to its ends.
  on('ui.scroll', { requestId: PANE }, async ($, e) => {
    const row = e.pointer?.row
    if (row === undefined) {
      if (Math.abs(e.by) === 1) await moveCursor($, e.by)
      else if (Math.abs(e.by) === e.bodyRows) await scrollView($, Math.sign(e.by) * layout.viewPage)
      else await scrollView($, e.by < 0 ? -Infinity : Infinity)
    } else if (row >= layout.tree[0]! && row < layout.tree[1]!) {
      followed = null
      await update($, explorer, value => {
        const now = explorerOf(value)
        const top = (now.treeTop ?? layout.treeFrom) + e.by
        return { ...now, treeTop: Math.max(0, Math.min(top, layout.treeLastTop)) }
      })
    } else await scrollView($, e.by)
    return {}
  })

  // Tab onto a row makes it the one the keys act on.
  on('ui.focus', { requestId: PANE }, async ($, e, next) => {
    if (e.origin.kind === 'person' && e.element?.startsWith('n:')) {
      const path = e.element.slice(2)
      await update($, explorer, value => ({ ...explorerOf(value), cursor: path }))
    }
    return next(e)
  })

  // Escape empties the search first, then leaves the expanded file, and only then closes.
  on('ui.close', async ($, e, next) => {
    if (e.id !== PANE) return next(e)
    if (e.origin.kind === 'person') {
      const now = explorerOf(await read($, explorer))
      // Answering without next keeps the pane open.
      if (now.search !== '') {
        await update($, explorer, value => ({ ...explorerOf(value), search: '' }))
        return { value: undefined }
      }
      if (now.expanded) {
        await update($, explorer, value => ({ ...explorerOf(value), expanded: false }))
        return { value: undefined }
      }
    }
    isShowing = false
    return next(e)
  })

  // A message naming @path of a project file brings it into view; the message goes on as it came.
  on('prompt.submit', async ($, e, next) => {
    const entered = await next(e)
    if (isShowing && e.command === undefined) {
      const named = [...e.text.matchAll(/(?:^|\s)@("[^"]+"|\S+)/g)].map(found => found[1]!.replace(/^"|"$/g, ''))
      try {
        await rootOf($)
        for (const path of (await projectFiles($, named)).slice(-1)) await reveal($, path, true)
      } catch {
        // The message already went on; a path the pane cannot reach is only not shown.
      }
    }
    return entered
  })

  // Only watches: the call goes on as it came, and its result goes back untouched, the same
  // object, so the engine keeps its own record of it. Whatever fails here, the tool never hears.
  on('tool.call', async ($, e, next) => {
    const touch = touchOf(e.tool, e as unknown as Record<string, unknown>)
    if (touch === undefined || (!isShowing && settings.activity === 'none')) return next(e)
    let painted: string[] = []
    let before: Record<string, string> | undefined
    let ops: string[] = []
    try {
      await rootOf($)
      if (touch.kind === 'read' || touch.kind === 'write') {
        painted = touch.paths.map(path => relativeTo(root!, path)).filter((path): path is string => path !== undefined && path !== '')
        await paint($, painted, touch.kind)
      } else if (touch.kind === 'shell') {
        ops = gitOpsOf(touch.command)
        if (ops.length > 0) await setGitOp($, { op: ops.map(opName).join(' + '), state: 'running' })
        const named = shellReadOf(touch.command)
        if (named !== undefined) {
          painted = await projectFiles($, named)
          await paint($, painted, 'read')
        } else if (isShowing && isShown(settings.activity, 'write')) before = await changedFingerprint($)
      }
    } catch {
      painted = []
    }

    const ran = await next(e)

    try {
      const isWell = ran.deny === undefined && ran.isError !== true
      if (touch.kind === 'search' && isWell) {
        const found = foundOf(ran.result)
          .map(path => relativeTo(root!, path))
          .filter((path): path is string => path !== undefined && path !== '')
        await paint($, found, 'read')
        await unpaint($, found, true)
      }
      if (before !== undefined) {
        const after = await changedFingerprint($)
        const written = Object.keys(after).filter(path => after[path] !== before![path])
        await paint($, written, 'write')
        await unpaint($, written, true)
      }
      if (ops.length > 0) {
        const op = ops.map(opName).join(' + ')
        if (isWell && ops.includes('commit')) {
          const last = await lastCommit($)
          await paint($, last.files, 'commit')
          await unpaint($, last.files, true)
          await setGitOp($, { op, state: 'done', ...(last.subject === '' ? {} : { detail: last.subject }) })
        } else await setGitOp($, { op, state: isWell ? 'done' : 'failed' })
      }
      await unpaint($, painted, isWell)
      if (isShowing && (touch.kind === 'write' || touch.kind === 'shell')) {
        index = undefined
        void refresh($)
      }
    } catch {
      // Following the call is the pane's business; what went wrong here stays here.
    }

    return ran
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    if (isOpenedAtStart) {
      isOpenedAtStart = false
      if (e.props.placement === 'inline') void closePane($)
    }
    isShowing = true
    const elements = $.ui.resolve(e)
    const { Box, Text, Button, Code, Markdown } = elements
    // The mobile app draws no field yet: there the search is left out.
    const Input = 'Input' in elements ? elements.Input : undefined
    const now = explorerOf(await read($, explorer))
    const known = await read($, listings)
    const git = await read($, marks)
    const doing = await read($, activity)
    const op = await read($, gitOp)
    const counted = await read($, sizes)
    const brief = await read($, notice)
    const clock = await $.clock.now()
    const files = git.kind === 'ok' ? git.files : {}
    const lineCounts = git.kind === 'ok' ? git.lines : {}
    // Inside the card's border and padding.
    const width = Math.max(30, e.props.bodyColumns - 4)
    const isWide = width >= WIDE_COLUMNS
    // One row less than the body: the blank row above the card keeps it off the pane's tabs.
    const height = e.props.scroll.bodyRows - 1
    const showsHint = git.kind === 'norepo' && settings.notices
    const treeSpace = now.expanded ? 0 : Math.min(TREE_ROWS[e.props.placement], Math.max(3, height - CARD_ROWS - MIN_VIEW_ROWS))
    const treeRows = Math.max(1, treeSpace - (showsHint ? 1 : 0))
    // Expanded, the search and the rule go with the tree.
    const viewRows = Math.max(MIN_VIEW_ROWS, height - CARD_ROWS - treeSpace + (now.expanded ? 2 : 0))
    const isSized = now.sized ?? settings.column === 'size'
    const column: 'date' | 'age' | 'size' = isSized ? 'size' : settings.column === 'size' ? 'date' : settings.column

    const message = (text: string, color?: string) => (
      <Text key={text} color={color} dimColor={color === undefined} wrap="wrap">{`  ${text}`}</Text>
    )

    const changed = Object.keys(files).length
    const branch = git.kind === 'ok' ? git.branch : undefined
    const heading = (
      <Box flexDirection="row" justifyContent="space-between">
        <Text>
          <Text backgroundColor={ACCENT} color="inverseText" bold> NZT </Text>{' '}
          <Text bold color={ACCENT}>{t.title}</Text>
        </Text>
        <Box flexDirection="row" flexShrink={1} overflow="hidden">
          <Text dimColor wrap="truncate-end">
            {root === undefined ? '' : nameOf(root)}
            {git.kind === 'norepo' ? ` · ${t.noGit}` : ''}
            {branch?.kind === 'branch' ? ` · ⑂ ${branch.name}${branch.upstream === undefined ? '' : ` → ${branch.upstream}`}` : ''}
            {branch?.kind === 'branch' && branch.ahead > 0 ? <Text color="cyan">{` ↑${branch.ahead}`}</Text> : ''}
            {branch?.kind === 'branch' && branch.behind > 0 ? <Text color="yellow">{` ↓${branch.behind}`}</Text> : ''}
            {branch?.kind === 'detached' ? ` · ⑂ ${branch.commit}` : ''}
            {changed > 0 ? <Text color="yellow">{' · ●'}</Text> : ''}
            {changed > 0 ? ` ${changed}` : ''}
            {' · '}
          </Text>
          <Button key="sum" plain dimColor onPress={() => update($, explorer, value => ({ ...explorerOf(value), sized: !isSized }))}>
            Σ
          </Button>
        </Box>
      </Box>
    )
    const buttons = (
      <Box flexDirection="row" gap={2}>
        <Button key="close" label={t.close} onPress={() => closePane($)} />
      </Box>
    )
    const card = (...children: (JSX.Element | null)[]) => (
      <Box flexDirection="column" marginTop={1} height={height} borderStyle="round" borderColor={ACCENT} paddingX={1}>
        {children}
      </Box>
    )

    if (known[''] === undefined) {
      void refresh($)
      return card(
        heading,
        <Box key="reading" flexDirection="column" flexGrow={1}>
          {message(t.reading)}
        </Box>,
        buttons,
      )
    }

    // The search, and the keys that walk the tree, which a pane only takes as Buttons.
    const search = now.expanded || Input === undefined ? null : (
      <Box flexDirection="row" justifyContent="space-between">
        <Box flexDirection="row" flexShrink={1} overflow="hidden">
          <Button key="find" plain hotkey="s" dimColor onPress={() => $.ui.focus({ requestId: PANE, key: 'search' }).then(() => undefined)}>
            ⌕
          </Button>
          <Input
            key="search"
            placeholder={t.search}
            value={now.search}
            submitLabel=" "
            onInput={(value: string) => searchFor($, value)}
            onSubmit={(value: string) => chooseFirst($, value)}
          />
          {now.search !== '' && (
            <Button key="clear" plain dimColor onPress={() => searchFor($, '')}>
              ×
            </Button>
          )}
        </Box>
        <Box flexDirection="row" gap={1} flexShrink={0}>
          <Button key="up" plain hotkey="k" dimColor onPress={() => moveCursor($, -1)}>↑</Button>
          <Button key="down" plain hotkey="j" dimColor onPress={() => moveCursor($, 1)}>↓</Button>
          <Button key="out" plain hotkey="h" dimColor onPress={() => cursorOut($)}>←</Button>
          <Button key="in" plain hotkey="l" dimColor onPress={() => cursorIn($)}>→</Button>
        </Box>
      </Box>
    )

    // The tree: the folders as the person left them, or the search's matches under their folders.
    const isSearching = now.search.trim() !== ''
    const matches = isSearching && index !== undefined ? matchesOf(index, now.search) : []
    const shownTree = isSearching ? searchTreeOf(matches, files) : { listings: known, open: now.open, marks: files }
    const rows: Row[] = isSearching && index === undefined ? [] : rowsOf(shownTree.listings, shownTree.open, shownTree.marks)
    const counts = countsOf(shownTree.marks)
    const anchor = followed ?? now.cursor ?? now.selected
    const chosen = rows.findIndex(row => row.kind === 'entry' && row.path === anchor)
    const shown = treeWindow(rows.length, treeRows, isSearching ? 0 : now.treeTop, chosen)
    const treeStart = 3 + (showsHint ? 1 : 0)
    layout = {
      tree: [treeStart, treeStart + treeRows],
      treeFrom: shown.from,
      treeLastTop: shown.lastTop,
      viewLastTop: 0,
      viewPage: Math.max(1, viewRows - 1),
      rows: rows.flatMap(row => (row.kind === 'entry' ? [row.path] : [])),
    }
    const doingOf = (path: string, isDir: boolean, isOpen: boolean): Doing | undefined => {
      const own = doing[path]
      if (own !== undefined || !isDir || isOpen) return own
      let strongest: Doing | undefined
      for (const [held, work] of Object.entries(doing)) {
        if (held.startsWith(`${path}/`) && (strongest === undefined || DOING_RANK[work.kind] > DOING_RANK[strongest.kind])) strongest = work
      }
      return strongest
    }
    const columnOf = (row: Extract<Row, { kind: 'entry' }>) => {
      if (row.isDeleted) return ''
      if (column === 'size') {
        if (!row.isDir) return t.size(row.size)
        const size = counted[row.path]
        return size === undefined || size === 'pending' ? '…' : size === 'failed' ? '?' : t.size(size)
      }
      if (row.isDir || row.mtimeMs === 0) return ''
      return column === 'age' ? t.age(row.mtimeMs, clock) : t.day(row.mtimeMs, clock)
    }
    const tree: JSX.Element[] = []
    const shownFolders: string[] = []
    if (isSearching && index === undefined) tree.push(message(t.reading))
    else if (isSearching && matches.length === 0) tree.push(message(t.noMatch(printable(now.search.trim()))))
    for (let i = shown.from; i < shown.to; i++) {
      if (i === shown.from && shown.above > 0) {
        tree.push(<Text key="above" dimColor>{`  ${t.above(shown.above)}`}</Text>)
        continue
      }
      if (i === shown.to - 1 && shown.below > 0) {
        tree.push(<Text key="below" dimColor>{`  ${t.below(shown.below)}`}</Text>)
        continue
      }
      const row = rows[i]!
      const indent = '  '.repeat(row.depth)
      if (row.kind === 'error') {
        tree.push(
          <Text key={`e:${row.path}`} color="red" wrap="truncate-end">
            {`${indent}⚠ ${t.folderUnreadable(printable(row.message))}`}
          </Text>,
        )
        continue
      }
      if (row.isDir) shownFolders.push(row.path)
      const isChosen = row.path === now.selected
      const isCursor = row.path === now.cursor && !isChosen
      const work = doingOf(row.path, row.isDir, row.isOpen)
      const label = printable(row.name) + (row.isDir ? '/' : '')
      const lead = `${indent}${iconOf(settings.icons, row.path, row.isDir, row.isOpen)}`
      const held = row.isDir ? counts[row.path] : undefined
      const added = row.isDir ? undefined : lineCounts[row.path]
      // What goes at the right of the row, each part in its color; a part with none is dim.
      const right: { key: string; text: string; color?: string }[] = []
      if (isWide && added !== undefined && row.mark === 'M') {
        right.push({ key: 'add', text: `+${added[0]}`, color: 'green' }, { key: 'del', text: `-${added[1]}`, color: isChosen ? '#ff9aa2' : 'red' })
      }
      const col = isWide ? columnOf(row) : ''
      if (col !== '') right.push({ key: 'col', text: col, ...(isChosen ? { color: '#b9c4c8' } : {}) })
      if (row.isDir && held !== undefined && isWide) {
        for (const mark of COUNT_ORDER) {
          if (held[mark] !== undefined) right.push({ key: `c${mark}`, text: `${mark}:${held[mark]}`, color: MARK_COLOR[mark] })
        }
      } else if (row.mark !== undefined) {
        right.push({ key: 'mark', text: row.isDir ? '●' : row.mark, color: MARK_COLOR[row.mark] })
      }
      const used = right.reduce((sum, part) => sum + part.text.length + 1, 0)
      const room = Math.max(4, width - lead.length - used - 1)
      const nameColor = work !== undefined ? DOING_COLOR[work.kind] : isChosen ? CURRENT : row.isDeleted ? 'red' : undefined
      // Only the name is the button: the engine inverts a button under the pointer, and a
      // whole inverted row read as noise.
      tree.push(
        <Box
          key={`r:${row.path}`}
          flexDirection="row"
          justifyContent="space-between"
          backgroundColor={isChosen ? CHOSEN_BG : isCursor ? CURSOR_BG : undefined}
        >
          <Box flexDirection="row">
            <Text dimColor>{lead}</Text>
            <Button
              key={`n:${row.path}`}
              plain
              onPress={() => (row.isDir ? toggle($, row.path) : choose($, row.path))}
            >
              <Text
                bold={row.isDir || isChosen || (work !== undefined && !work.isFading)}
                dimColor={work?.isFading === true}
                color={nameColor}
                strikethrough={row.isDeleted}
                underline={isSearching && row.path.toLowerCase().includes(now.search.trim().toLowerCase()) && nameOf(row.path).toLowerCase().includes(now.search.trim().toLowerCase())}
              >
                {fit(label, room)}
              </Text>
            </Button>
          </Box>
          <Box flexDirection="row" gap={1} flexShrink={0}>
            {right.map(part => (
              <Text key={part.key} color={part.color} dimColor={part.color === undefined}>
                {part.text}
              </Text>
            ))}
          </Box>
        </Box>,
      )
    }
    if (column === 'size' && isWide) void countSizes($, shownFolders)

    // The chosen file: its path, its detail line, its tools and its lines, or the line that stands in for them.
    const path = now.selected
    const opened = now.opened
    let detail: JSX.Element | null = null
    let tools: JSX.Element | null = null
    let body: JSX.Element
    let position: string | null = null
    let isScrollable = false
    const isMarkdown = path !== null && isMarkdownFile(path)
    if (path === null) {
      body = message(t.pick)
    } else {
      const mark = files[path]
      const kind = kindLabel(path)
      const parts = [kind, opened !== null && 'size' in opened ? t.size(opened.size) : undefined]
      if (opened?.kind === 'text') parts.push(t.lineCount(opened.lines) + (opened.shown < opened.lines ? t.shownOf(opened.shown) : ''))
      const facts = parts.filter(part => part !== undefined).join(' · ')
      detail = (
        <Text dimColor wrap="truncate-end">
          {mark !== undefined && <Text color={MARK_COLOR[mark]}>{t.marks[mark]}</Text>}
          {mark !== undefined && facts !== '' ? ' · ' : ''}
          {facts}
        </Text>
      )
      if (opened === null || opened.kind === 'loading' || (opened.kind === 'text' && content?.path !== path)) {
        if (opened?.kind !== 'loading') void loadFile($, path, true)
        body = message(t.loading)
      } else if (opened.kind === 'text') {
        const lines = content!.lines
        const blocks = content!.blocks
        const isHuge = blocks !== undefined && hasHugeBlock(blocks)
        if (lines.length === 0) body = message(t.empty)
        else if (isMarkdown && now.markdown && blocks !== undefined && !isHuge) {
          const view = blockWindow(blocks, now.viewTop, viewRows, width)
          layout.viewLastTop = view.lastTop
          layout.viewPage = Math.max(1, view.count)
          const fits = view.first === 0 && view.count === blocks.length
          isScrollable = !fits
          const from = blocks[view.first]!.from
          const to = blocks[view.first + view.count - 1]!.to
          position = fits ? t.allLines(opened.lines) : t.blockLines(from + 1, to, opened.lines)
          body = (
            <Box height={viewRows} overflow="hidden">
              <Markdown key="drawn" text={printable(blocks.slice(view.first, view.first + view.count).map(block => block.text).join('\n\n'))} />
            </Box>
          )
        } else {
          const hint = isMarkdown && now.markdown && isHuge
          const view = textWindow(lines, now.viewTop, viewRows - (hint ? 1 : 0), width)
          layout.viewLastTop = view.lastTop
          const fits = view.count === view.total
          isScrollable = !fits
          position = fits
            ? t.allLines(view.total)
            : t.lines(view.first + 1, view.first + view.count, view.total, opened.shown < opened.lines)
          body = (
            <Box flexDirection="column" height={viewRows} overflow="hidden">
              {hint ? <Text color="yellow" wrap="truncate-end">{t.markdownHuge}</Text> : null}
              <Code
                key="file"
                source={lines.slice(view.first, view.first + view.count).join('\n')}
                path={path}
                startLine={view.first + 1}
              />
            </Box>
          )
        }
      } else if (opened.kind === 'deleted') {
        body = (
          <Box flexDirection="column">
            {message(t.deleted)}
            {message(t.deletedHint)}
          </Box>
        )
      } else if (opened.kind === 'gone') {
        body = message(t.gone, 'red')
      } else if (opened.kind === 'error') {
        body = (
          <Box flexDirection="column">
            {message(t.unreadable, 'red')}
            {message(printable(opened.message))}
          </Box>
        )
      } else {
        body = message(t[opened.kind])
      }
    }
    const target = now.cursor ?? path
    if (path !== null || target !== null) {
      tools = (
        <Box flexDirection="row" gap={2}>
          {isMarkdown && (
            <Button
              key="markdown"
              plain
              hotkey="m"
              onPress={() => update($, explorer, value => ({ ...explorerOf(value), markdown: !now.markdown, viewTop: 0 }))}
            >
              {`${now.markdown ? '☑' : '☐'} ${t.markdown}`}
            </Button>
          )}
          {path !== null && (
            <Button key="expand" plain hotkey="a" onPress={() => update($, explorer, value => ({ ...explorerOf(value), expanded: !now.expanded }))}>
              {now.expanded ? t.back : t.expand}
            </Button>
          )}
          <Button key="copy" plain hotkey="c" onPress={press => copyPath($, press.surface)}>
            {t.copy}
          </Button>
          <Button key="open" plain hotkey="o" onPress={() => (target === null ? undefined : openWithApp($, target))}>
            {t.open}
          </Button>
        </Box>
      )
    }

    const gitLine =
      brief !== null ? (
        <Text color={CURRENT} wrap="truncate-end">{printable(brief)}</Text>
      ) : op === null ? (
        <Text> </Text>
      ) : (
        <Text wrap="truncate-end">
          {op.state === 'running' && <Text color="cyan">{`↻ ${t.gitRunning(op.op)}`}</Text>}
          {op.state === 'done' && <Text color={DOING_COLOR.commit}>{`● ${t.gitDone(op.op)}`}</Text>}
          {op.state === 'failed' && <Text color="red">{`✗ ${t.gitFailed(op.op)}`}</Text>}
          {op.detail !== undefined && <Text dimColor>{` · ${printable(op.detail)}`}</Text>}
        </Text>
      )

    return card(
      heading,
      showsHint && !now.expanded ? <Text key="hint" dimColor wrap="truncate-end">{t.noGitHint}</Text> : null,
      search,
      now.expanded ? null : (
        <Box key="tree" flexDirection="column" height={treeRows} overflow="hidden">
          {tree}
        </Box>
      ),
      now.expanded ? null : <Text key="rule" dimColor>{'─'.repeat(width)}</Text>,
      <Text key="path" bold color={CURRENT} wrap="truncate-start">{path === null ? ' ' : printable(path)}</Text>,
      detail ?? <Text key="detail"> </Text>,
      tools ?? <Text key="tools"> </Text>,
      <Box key="body" flexDirection="column" flexGrow={1} flexShrink={1} overflow="hidden">
        {body}
      </Box>,
      <Box key="position" flexDirection="row" justifyContent="space-between">
        <Text dimColor wrap="truncate-end">{position ?? ' '}</Text>
        {isScrollable && (
          <Box flexDirection="row" gap={1} flexShrink={0}>
            <Button key="view-up" plain onPress={() => scrollView($, -1)}>
              ▲
            </Button>
            <Button key="view-down" plain onPress={() => scrollView($, 1)}>
              ▼
            </Button>
          </Box>
        )}
      </Box>,
      gitLine,
      buttons,
    )
  })
}
