import { atom, read, update } from 'claude-code'
import type { ElementTable, EngineInterface, Register, RenderSurface, Timer } from 'claude-code'

import type { BarMark, Doing, Explorer, GitOp, Listing, Mark, Marks, Opened, Size } from '../types'
import { FADE_MS, foundOf, isShown, shellReadOf, touchOf } from './activity'
import { APP_ICONS, appIconOf } from './app-icons'
import {
  allAddedOf,
  branchOf,
  changedTreeOf,
  changeOf,
  COUNT_ORDER,
  countsOf,
  diffLinesOf,
  diffWindow,
  gitOpsOf,
  hasChange,
  linesOf,
  sourceOfDiff,
  wordsOf,
} from './git'
import type { DiffLine } from './git'
import { langOf, TEXTS } from './i18n'
import type { Texts } from './i18n'
import { iconOf } from './icons'
import type { RowPress, RowProps } from './row-live'
import { isPictureFile, kindOf } from './kinds'
import { blocksOf, blockWindow, hasHugeBlock, isMarkdownFile } from './markdown'
import type { Block } from './markdown'
import { CSHARP_COLORS, isCSharpFile, statesOf, tokensOf } from './csharp'
import type { LineState } from './csharp'
import { HEAVY, matchesOf, searchTreeOf } from './search'
import type { Indexed } from './search'
import { settingsOf } from './settings'
import type { Settings } from './settings'
import {
  ancestorsOf,
  contentOf,
  fit,
  fittingCount,
  folderOf,
  isBinaryText,
  marksOf,
  nameOf,
  printable,
  printableLines,
  thumbOf,
  topAtRow,
  relativeTo,
  rowsOf,
  textWindow,
  treeWindow,
} from './tree'
import type { Row } from './tree'

const PANE = 'nzt-files'
// In the app the chosen file goes in a pane of its own, beside the tree's tab.
const FILE_PANE = 'nzt-files-file'
// The engine draws 100000 characters in one drawing; the rest is the file pane's own lines.
const DRAWN_CHARS = 95_000
const POLL_MS = 3000
// The card's rows besides the tree and the file: its border, heading, search, rule, path,
// detail, the file's tools, the blank row under them, position line, git line and button.
const CARD_ROWS = 12
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
// Unfolding stops opening folders past this many, each one a read of the disk.
const OPEN_ALL_LIMIT = 500
// The accent of NZT's mods, the one nzt-state uses: a theme key, so it follows the theme.
const ACCENT = 'claude'
const CURRENT = 'cyan'
const CHOSEN_BG = '#263a42'
const CURSOR_BG = '#1f2c31'
// In the app, whose theme the mod does not know: a gray seen through, on a light and a dark one.
const APP_CHOSEN_BG = '#8b949e38'
const APP_HOVER_BG = '#8b949e1f'
const ICON_PX = 14
// A changed line in the app, as Visual Studio paints it: added green, removed red, both faint.
const DIFF_BG = { '+': '#2ea04333', '-': '#f8514933' } as const
const MARK_COLOR = { M: 'yellow', U: 'green', A: 'green', D: 'red' } as const satisfies Record<Mark, string>
// The change map beside the scroll bar: anything removed in a stretch paints it red, as the diff does.
const CHANGE_COLOR = { add: 'green', change: 'red', delete: 'red' } as const satisfies Record<BarMark, string>
// Lines shown above a change the scroll bar jumps to.
const CHANGE_CONTEXT = 2
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
  changesOnly: false,
} as Explorer)
const activity = atom({ plugin: 'nzt-files', key: 'activity' } as const, {} as Record<string, Doing>)
const gitOp = atom({ plugin: 'nzt-files', key: 'gitOp' } as const, null as GitOp | null)
const sizes = atom({ plugin: 'nzt-files', key: 'sizes' } as const, {} as Record<string, Size>)
const notice = atom({ plugin: 'nzt-files', key: 'notice' } as const, null as string | null)

// Module state a reload starts over: the project's folder, the chosen file's lines, whether
// the pane is showing, the search's walk of the project and the timers that put colors out.
let root: string | undefined
// `changesKey` is what git said of the file when its diff was read; `diff` that diff, when it has a change.
let content:
  | { path: string; mtimeMs: number; lines: string[]; isWhole: boolean; blocks?: Block[]; changesKey: string; diff?: DiffLine[] }
  | undefined
let isShowing = false
let isFileShowing = false
let isOpenedAtStart = false
let running: Promise<void> | undefined
let isAgain = false
let t: Texts = TEXTS.es
let settings: Settings = settingsOf({})
let index: Indexed[] | undefined
let indexing: Promise<Indexed[]> | undefined
// Where each line of the shown C# file starts, worked out once per file and not on every drawing.
let csharpStates: { lines: string[]; states: LineState[] } | undefined
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
  changesOnly: value?.changesOnly === true,
})

const reasonOf = (error: unknown) => (error instanceof Error ? error.message : String(error))

/** A file's kind as the detail line names it, or undefined with no extension. */
const kindLabel = (path: string) => {
  const kind = kindOf(path)
  if (kind === undefined) return undefined
  return kind.kind === 'named' ? kind.name : kind.kind === 'image' ? t.image(kind.format) : t.text
}

/** What the detail line says of the chosen file: its kind, its size, its lines and how many of them show. */
const factsOf = (path: string, opened: Opened | null, drawn = Infinity) => {
  const parts = [kindLabel(path), opened !== null && 'size' in opened ? t.size(opened.size) : undefined]
  if (opened?.kind === 'text') {
    const shown = Math.min(opened.shown, drawn)
    parts.push(t.lineCount(opened.lines) + (shown < opened.lines ? t.shownOf(shown) : ''))
  }
  return parts.filter(part => part !== undefined).join(' · ')
}

/** The lines that stand in for a file with no text to show, each in its color. */
const standInOf = (opened: Exclude<Opened, { kind: 'text' | 'loading' }>): { text: string; color?: string }[] => {
  if (opened.kind === 'deleted') return [{ text: t.deleted }, { text: t.deletedHint }]
  if (opened.kind === 'gone') return [{ text: t.gone, color: 'red' }]
  if (opened.kind === 'error') return [{ text: t.unreadable, color: 'red' }, { text: printable(opened.message) }]
  return [{ text: t[opened.kind] }]
}

/**
 * A tool of the app: its native button, which draws the label and not what a Button holds.
 * Being on shows as the app's primary button, since the app does not color text inside one.
 */
const appTool = (
  { Button }: Pick<ElementTable, 'Button'>,
  tool: { key: string; name: string; isOn?: boolean; onPress: (press: { surface: RenderSurface }) => unknown },
) => (
  <Button key={tool.key} label={tool.name} variant={tool.isOn === true ? 'primary' : 'secondary'} onPress={press => void tool.onPress(press)} />
)

const isWindows = () => root !== undefined && /^[A-Za-z]:/.test(root)

const opName = (op: string) => t.gitOps[op] ?? op

/**
 * Where the file's window stands, for the scroll bar, and, with a diff, the change each row of
 * its change map stands for and jumps to.
 */
type Bar = {
  first: number
  count: number
  total: number
  lastTop: number
  changeAt?: (row: number) => { kind: BarMark; top: number } | undefined
}

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

/** The file whole as a diff against the last commit, or undefined with no change to show. */
async function diffOf($: EngineInterface, path: string, mark: Mark | undefined, lines: string[], isWhole: boolean) {
  if (mark === 'U') return allAddedOf(lines)
  if (mark !== 'M' && mark !== 'A') return undefined
  const diff = await git($, ['diff', 'HEAD', '-U0', '--no-color', '--no-ext-diff', '--', path])
  // With no commit yet there is no HEAD: a file added to the index is new whole.
  if (diff === undefined) return mark === 'A' ? allAddedOf(lines) : undefined
  const whole = diffLinesOf(diff, lines, isWhole)
  return hasChange(whole) ? whole : undefined
}

/** Reads the chosen file into the viewer, unless it is the one already read and unchanged. */
async function loadFile($: EngineInterface, path: string, force = false) {
  const files = await read($, marks)
  const mark = files.kind === 'ok' ? files.files[path] : undefined
  const changesKey = files.kind === 'ok' ? `${mark ?? ''}:${files.lines[path]?.join(',') ?? ''}` : ''
  const stat = await $.fs.stat(pathOf(path)).catch(() => undefined)
  let opened: Opened
  if (stat === undefined) {
    opened = { kind: mark === 'D' ? 'deleted' : 'gone' }
  } else if (!force && content?.path === path && content.mtimeMs === stat.mtimeMs) {
    if (content.changesKey === changesKey) return
    // The same text against another commit, or staged: only its diff is read again.
    content.changesKey = changesKey
    content.diff = await diffOf($, path, mark, content.lines, content.isWhole)
    const changes = content.diff === undefined ? null : changesKey
    await update($, explorer, value => {
      const now = explorerOf(value)
      return now.selected === path && now.opened?.kind === 'text' ? { ...now, opened: { ...now.opened, changes } } : now
    })
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
      const isWhole = kept.lines.length === kept.total
      content = { path, mtimeMs: stat.mtimeMs, lines: kept.lines, isWhole, changesKey }
      if (isMarkdownFile(path)) content.blocks = blocksOf(kept.lines)
      content.diff = await diffOf($, path, mark, kept.lines, isWhole)
      const changes = content.diff === undefined ? null : changesKey
      opened = { kind: 'text', lines: kept.total, shown: kept.lines.length, size: stat.size, changes }
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
  // ± Changes takes each changed file's size and date from its folder's listing.
  const held = now.changesOnly ? Object.keys(files).map(folderOf) : []
  for (const folder of new Set(['', ...now.open, ...held])) next[folder] = await listFolder($, folder, files)
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

function csharpStatesOf(lines: string[]) {
  if (csharpStates?.lines !== lines) csharpStates = { lines, states: statesOf(lines) }
  return csharpStates.states
}

// The app lays text out as a page does and runs spaces together: a hard space keeps the indent.
const hardSpaced = (text: string) => text.replace(/ /g, ' ')

/**
 * The first `count` lines of a C# file in the app, colored as Visual Studio colors them: in the
 * code font, one row a line, cut at the width, its number before it.
 */
function csharpRows({ Box, Text }: Pick<ElementTable, 'Box' | 'Text'>, lines: string[], count: number) {
  const states = csharpStatesOf(lines)
  const digits = String(lines.length).length
  return lines.slice(0, count).map((line, number) => {
    const { tokens } = tokensOf(line.replace(/\r$/, '').replace(/\t/g, '    '), states[number] ?? 'code')
    return (
      <Box key={`l:${number}`} flexDirection="row">
        <Text dimColor mono>{hardSpaced(`${String(number + 1).padStart(digits)} `)}</Text>
        <Box flexShrink={1} overflow="hidden">
          <Text mono wrap="truncate-end">
            {tokens.length === 0
              ? ' '
              : tokens.map((token, which) => (
                  <Text key={String(which)} color={token.kind === 'plain' ? undefined : CSHARP_COLORS[token.kind]}>
                    {hardSpaced(printable(token.text))}
                  </Text>
                ))}
          </Text>
        </Box>
      </Box>
    )
  })
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

/** Opens the chosen file's own pane, titled with its name, or retitles the one open. */
async function openFilePane($: EngineInterface, path: string) {
  isFileShowing = true
  await $.ui.open({ id: FILE_PANE, title: nameOf(path), focus: true, closeOnEscape: true })
}

/**
 * Shows a file in the viewer from its top, in the app in a pane of its own; pressed twice in
 * a row, opens it with its app.
 */
async function choose($: EngineInterface, path: string, surface: RenderSurface) {
  const at = await $.clock.now()
  const isDouble = lastPress?.path === path && at - lastPress.at < DOUBLE_PRESS_MS
  lastPress = { path, at }
  if (isDouble) {
    lastPress = undefined
    await openWithApp($, path)
    return
  }
  followed = null
  if (surface !== 'terminal') await openFilePane($, path)
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

/** Puts the file's window at `top`, within what the last drawing allowed. */
async function scrollTo($: EngineInterface, top: number) {
  await update($, explorer, value => ({ ...explorerOf(value), viewTop: Math.max(0, Math.min(top, layout.viewLastTop)) }))
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

/**
 * Opens every folder of the project but the heavy ones, reading the ones not read yet, up to
 * OPEN_ALL_LIMIT folders so a huge project does not hold the pane.
 */
async function openAll($: EngineInterface) {
  const files = await read($, marks)
  const known = { ...(await read($, listings)) }
  const open: string[] = []
  const queue = ['']
  while (queue.length > 0 && open.length < OPEN_ALL_LIMIT) {
    const folder = queue.shift()!
    if (folder !== '') open.push(folder)
    known[folder] ??= await listFolder($, folder, files.kind === 'ok' ? files.files : {})
    const listing = known[folder]!
    if (listing.kind !== 'ok') continue
    for (const entry of listing.entries) {
      if (entry.isDir && !HEAVY.has(entry.name)) queue.push(folder === '' ? entry.name : `${folder}/${entry.name}`)
    }
  }
  followed = null
  await update($, listings, () => known)
  await update($, explorer, value => ({ ...explorerOf(value), open, treeTop: null }))
}

/** Shows only what changed since the last commit, or the whole tree again with its folders as they were. */
async function toggleChanges($: EngineInterface) {
  followed = null
  await update($, explorer, value => {
    const now = explorerOf(value)
    return { ...now, changesOnly: !now.changesOnly, treeTop: null }
  })
  await refresh($)
}

/** Closes every folder; the cursor goes back to the top-level row that held it. */
async function closeAll($: EngineInterface) {
  followed = null
  await update($, explorer, value => {
    const now = explorerOf(value)
    const cursor = now.cursor === null ? null : now.cursor.split('/')[0]!
    return { ...now, open: [], cursor, treeTop: 0 }
  })
}

async function copyPath($: EngineInterface, path: string | null, surface: RenderSurface) {
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
async function chooseFirst($: EngineInterface, query: string, surface: RenderSurface) {
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
  await choose($, found.path, surface)
}

/** Closes the explorer, and the file's own pane with it: alone it would stop following the disk. */
async function closePane($: EngineInterface) {
  isShowing = false
  if (isFileShowing) await $.ui.close({ id: FILE_PANE }).catch(() => undefined)
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
    // The app seats the pane at its side: what follows speaks of a terminal, which it has not.
    if ((await $.session.surfaces().catch(() => [])).some(surface => surface !== 'terminal')) return {}
    // Claude Code docks a pane beside the transcript only in fullscreen and from 110 columns.
    const { isFullscreen, columns } = e.presentation
    if (!isFullscreen) return { text: t.paneInlineNoFullscreen }
    if (columns < DOCK_FLOOR) return { text: t.paneInlineNarrow(columns, DOCK_FLOOR) }
    return {}
  })

  // On the terminal the tree is exactly as tall as the body, so the engine has nothing to
  // scroll: the wheel moves the tree when it is over the tree, and the file anywhere else; an
  // arrow walks the tree's rows, a page key turns the file's page, Home and End go to its ends.
  // In the app the tree is drawn whole and taller than the body: there the app scrolls it.
  on('ui.scroll', { requestId: PANE }, async ($, e, next) => {
    if (e.contentRows > e.bodyRows) return next(e)
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

  // A click or Enter on a row of the app's tree: as its Button does on the terminal.
  on('ui.message', { requestId: PANE }, async ($, e) => {
    const pressed = e.data as Partial<RowPress> | null
    if (typeof pressed?.press !== 'string') return {}
    const now = explorerOf(await read($, explorer))
    const files = await read($, marks)
    const isChangesOnly = now.changesOnly && files.kind === 'ok'
    if (pressed.isDir !== true) await choose($, pressed.press, e.surface)
    else if (!isChangesOnly || now.search.trim() !== '') await toggle($, pressed.press)
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
    // The file's pane closed: the tree no longer marks a file as the one shown.
    if (e.id === FILE_PANE) {
      isFileShowing = false
      content = undefined
      await update($, explorer, value => ({ ...explorerOf(value), selected: null, opened: null, viewTop: 0 }))
      return next(e)
    }
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
    const closed = await next(e)
    if (isFileShowing && e.origin.kind !== 'unload') await $.ui.close({ id: FILE_PANE }).catch(() => undefined)
    return closed
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
    // The terminal draws no Svg: its icons are characters.
    const Svg = 'Svg' in elements ? elements.Svg : undefined
    // A row of the app's tree is a region of its own, which takes a click along its whole width.
    const Client = e.surface !== 'terminal' && 'Client' in elements ? elements.Client : undefined
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
    // The terminal is a grid the card frames. The app gives the pane its own tab, title and close,
    // and lays it out in a proportional font: there the pane goes unframed, and its Buttons carry
    // no hotkey, which the app would draw as a chip on each.
    const isGrid = e.surface === 'terminal'
    // In the app the file is in its own pane, and the tree has nothing to give way to.
    const isExpanded = isGrid && now.expanded
    const keyed = (hotkey: string) => (isGrid ? hotkey : undefined)
    // Inside the card's border and padding.
    const width = Math.max(30, e.props.bodyColumns - (isGrid ? 4 : 0))
    const isWide = width >= WIDE_COLUMNS
    // One row less than the body: the blank row above the card keeps it off the pane's tabs.
    const height = e.props.scroll.bodyRows - (isGrid ? 1 : 0)
    // Unframed, the border's two rows and the close button's are the view's.
    const chromeRows = CARD_ROWS - (isGrid ? 0 : 3)
    const showsHint = git.kind === 'norepo' && settings.notices
    const treeSpace = isExpanded ? 0 : Math.min(TREE_ROWS[e.props.placement], Math.max(3, height - chromeRows - MIN_VIEW_ROWS))
    const treeRows = Math.max(1, treeSpace - (showsHint ? 1 : 0))
    // Expanded, the search and the rule go with the tree.
    const viewRows = Math.max(MIN_VIEW_ROWS, height - chromeRows - treeSpace + (isExpanded ? 2 : 0))
    const isSized = now.sized ?? settings.column === 'size'
    const column: 'date' | 'age' | 'size' = isSized ? 'size' : settings.column === 'size' ? 'date' : settings.column

    const message = (text: string, color?: string) => (
      <Text key={text} color={color} dimColor={color === undefined} wrap="wrap">{`  ${text}`}</Text>
    )

    // The engine draws no scroll bar for a pane: a track with a thumb, each row a jump to that point.
    // With a diff, a change map goes before it, so the colors never hide how far the person is.
    const scrollBar = (at: Bar) => {
      const thumb = thumbOf(viewRows, at.first, at.count, at.total, at.lastTop)
      const changeAt = at.changeAt
      return (
        <Box key="bar" flexDirection="row" flexShrink={0} marginLeft={1}>
          {changeAt === undefined ? null : (
            <Box key="map" flexDirection="column" width={1}>
              {Array.from({ length: viewRows }, (_, row) => {
                const change = changeAt(row)
                if (change === undefined) return <Text key={`map:${row}`}> </Text>
                return (
                  <Button key={`map:${row}`} plain label={t.scrollToChange} onPress={() => scrollTo($, change.top)}>
                    <Text color={CHANGE_COLOR[change.kind]}>▌</Text>
                  </Button>
                )
              })}
            </Box>
          )}
          <Box key="track" flexDirection="column" width={1}>
            {Array.from({ length: viewRows }, (_, row) => {
              const isThumb = row >= thumb.from && row < thumb.from + thumb.size
              return (
                <Button key={`bar:${row}`} plain label={t.scrollTo} onPress={() => scrollTo($, topAtRow(row, viewRows, at.lastTop))}>
                  <Text color={isThumb ? ACCENT : undefined} dimColor={!isThumb}>{isThumb ? '┃' : '│'}</Text>
                </Button>
              )
            })}
          </Box>
        </Box>
      )
    }

    // The stretch of items each row of the scroll bar stands for, out of `total`, from 0, end out.
    const stretchOf = (row: number, total: number) => {
      const from = Math.floor((row * total) / viewRows)
      return { from, to: Math.max(from + 1, Math.floor(((row + 1) * total) / viewRows)) }
    }

    // C# the mod colors itself: a line's number, then its tokens, what does not fit wrapped under the code.
    const csharpLines = (lines: string[], first: number, count: number) => {
      const states = csharpStatesOf(lines)
      const digits = String(lines.length).length
      return lines.slice(first, first + count).map((line, at) => {
        const number = first + at
        const { tokens } = tokensOf(line.replace(/\r$/, '').replace(/\t/g, '    '), states[number] ?? 'code')
        return (
          <Box key={`l:${number}`} flexDirection="row">
            <Text dimColor>{`${String(number + 1).padStart(digits)} `}</Text>
            <Box flexShrink={1}>
              <Text wrap="wrap">
                {tokens.length === 0
                  ? ' '
                  : tokens.map((token, which) => (
                      <Text key={String(which)} color={token.kind === 'plain' ? undefined : CSHARP_COLORS[token.kind]}>
                        {printable(token.text)}
                      </Text>
                    ))}
              </Text>
            </Box>
          </Box>
        )
      })
    }

    const changed = Object.keys(files).length
    const branch = git.kind === 'ok' ? git.branch : undefined
    const heading = (
      <Box flexDirection="row" justifyContent="space-between">
        {isGrid ? (
          <Text>
            <Text backgroundColor={ACCENT} color="inverseText" bold> NZT </Text>{' '}
            <Text bold color={ACCENT}>{t.title}</Text>
          </Text>
        ) : null}
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
            {isGrid ? ' · ' : ''}
          </Text>
          {/* In the app the rows carry no column, so there is nothing for Σ to turn. */}
          {isGrid && (
            <Button key="sum" plain dimColor onPress={() => update($, explorer, value => ({ ...explorerOf(value), sized: !isSized }))}>
              Σ
            </Button>
          )}
        </Box>
      </Box>
    )
    const buttons = isGrid ? (
      <Box flexDirection="row" gap={2}>
        <Button key="close" label={t.close} onPress={() => closePane($)} />
      </Box>
    ) : null
    const card = (...children: (JSX.Element | null)[]) =>
      isGrid ? (
        <Box flexDirection="column" marginTop={1} height={height} borderStyle="round" borderColor={ACCENT} paddingX={1}>
          {children}
        </Box>
      ) : (
        // As tall as what it holds: the app scrolls it.
        <Box flexDirection="column">{children}</Box>
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

    const isChangesOnly = now.changesOnly && git.kind === 'ok'

    // The search, and the keys that walk the tree, which a pane only takes as Buttons. Showing
    // only what changed, every folder is open, so Unfold and Fold go, and the whole tree's
    // folders wait as they were.
    // In the app, as its own explorer has it: the lens and the field across, and only what
    // changed beside them; its folders open one by one, as there.
    const appSearch =
      isGrid || Input === undefined || Svg === undefined ? null : (
        <Box flexDirection="row" alignItems="center" gap={1}>
          <Svg key="lens" source={APP_ICONS.search} alt={t.searchApp} width={ICON_PX} height={ICON_PX} />
          <Box flexGrow={1} flexShrink={1}>
            <Input
              key="search"
              placeholder={t.searchApp}
              value={now.search}
              submitLabel={t.searchOpen}
              onInput={(value: string) => searchFor($, value)}
              onSubmit={(value, input) => chooseFirst($, value, input.surface)}
            />
          </Box>
          {now.search !== '' && (
            <Button key="clear" plain dimColor onPress={() => searchFor($, '')}>
              ×
            </Button>
          )}
          {git.kind === 'ok' && appTool(elements, { key: 'changes', name: t.appChanges, isOn: isChangesOnly, onPress: () => toggleChanges($) })}
        </Box>
      )
    const search = !isGrid ? appSearch : isExpanded || Input === undefined ? null : (
      <Box flexDirection="row" justifyContent="space-between">
        <Box flexDirection="row" gap={1} flexShrink={1} flexGrow={isGrid ? 0 : 1} overflow="hidden">
          <Button key="find" plain hotkey={keyed('s')} dimColor onPress={() => $.ui.focus({ requestId: PANE, key: 'search' }).then(() => undefined)}>
            ⌕
          </Button>
          <Input
            key="search"
            placeholder={isGrid ? t.search : t.searchApp}
            value={now.search}
            submitLabel={isGrid ? ' ' : t.searchOpen}
            onInput={(value: string) => searchFor($, value)}
            onSubmit={(value, input) => chooseFirst($, value, input.surface)}
          />
          {now.search !== '' && (
            <Button key="clear" plain dimColor onPress={() => searchFor($, '')}>
              ×
            </Button>
          )}
        </Box>
        <Box flexDirection="row" gap={1} flexShrink={0}>
          {git.kind === 'ok' && (
            <Button key="changes" plain hotkey={keyed('g')} label={t.changesOnly} onPress={() => toggleChanges($)}>
              <Text color={isChangesOnly ? ACCENT : undefined} bold={isChangesOnly} dimColor={!isChangesOnly}>
                {t.changesOnly}
              </Text>
            </Button>
          )}
          {!isChangesOnly && (
            <Button key="open-all" plain hotkey={keyed('d')} dimColor onPress={() => openAll($)}>{t.openAll}</Button>
          )}
          {!isChangesOnly && (
            <Button key="close-all" plain hotkey={keyed('p')} dimColor onPress={() => closeAll($)}>{t.closeAll}</Button>
          )}
        </Box>
      </Box>
    )

    // The tree: the folders as the person left them, only what changed, or the search's matches
    // under their folders, among what changed when that is all the tree shows.
    const isSearching = now.search.trim() !== ''
    const holdsChange = (item: { path: string; isDir: boolean }) =>
      files[item.path] !== undefined || (item.isDir && Object.keys(files).some(held => held.startsWith(`${item.path}/`)))
    const matches = isSearching && index !== undefined ? matchesOf(isChangesOnly ? index.filter(holdsChange) : index, now.search) : []
    const shownTree = isSearching
      ? searchTreeOf(matches, files)
      : isChangesOnly
        ? { ...changedTreeOf(files, known), marks: files }
        : { listings: known, open: now.open, marks: files }
    const rows: Row[] = isSearching && index === undefined ? [] : rowsOf(shownTree.listings, shownTree.open, shownTree.marks)
    const counts = countsOf(shownTree.marks)
    const anchor = followed ?? now.cursor ?? now.selected
    const chosen = rows.findIndex(row => row.kind === 'entry' && row.path === anchor)
    // In the app the tree goes whole.
    const shown = isGrid ? treeWindow(rows.length, treeRows, isSearching ? 0 : now.treeTop, chosen) : treeWindow(rows.length, rows.length, 0, chosen)
    // Unframed, the blank row and the border above the heading are gone.
    const treeStart = (isGrid ? 3 : 1) + (showsHint ? 1 : 0)
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
    else if (isChangesOnly && changed === 0) tree.push(message(t.noChanges))
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
      const onPress = (press: { surface: RenderSurface }) =>
        !row.isDir ? choose($, row.path, press.surface) : isChangesOnly && !isSearching ? undefined : toggle($, row.path)
      if (!isGrid) {
        // As the app's own explorer: a chevron on a folder, an outline icon on a file where a
        // folder has its chevron, the name in the app's weight, and a click anywhere on the row
        // presses it. Where the surface draws no Client, the name is a Button with the chevron
        // inside, and what Claude does and the git mark go beside it, which the app does not
        // color inside.
        const aside: { key: string; text: string; color: string }[] = []
        if (added !== undefined && row.mark === 'M') {
          aside.push({ key: 'add', text: `+${added[0]}`, color: 'green' }, { key: 'del', text: `-${added[1]}`, color: 'red' })
        }
        if (row.mark !== undefined) aside.push({ key: 'mark', text: row.isDir ? '●' : row.mark, color: MARK_COLOR[row.mark] })
        const named = [
          ...(row.isDir ? [<Text key="chevron" dimColor>{row.isOpen ? '⌄ ' : '› '}</Text>] : []),
          <Text key="name" strikethrough={row.isDeleted}>{printable(row.name)}</Text>,
        ]
        const rowProps: RowProps = {
          path: row.path,
          name: printable(row.name),
          isDir: row.isDir,
          isOpen: row.isOpen,
          isDeleted: row.isDeleted === true,
          doing: work === undefined ? null : { color: DOING_COLOR[work.kind], isFading: work.isFading },
          aside,
        }
        const icon = row.isDir || Svg === undefined ? null : (
          <Svg source={APP_ICONS[appIconOf(row.path)]} alt={kindLabel(row.path) ?? t.text} width={ICON_PX} height={ICON_PX} />
        )
        const rowBox = {
          key: `r:${row.path}`,
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: row.depth * 2,
          paddingY: 'xs',
          paddingRight: 'sm',
          backgroundColor: isChosen ? APP_CHOSEN_BG : undefined,
          hover: { backgroundColor: APP_HOVER_BG },
        } as const
        tree.push(
          Client !== undefined ? (
            <Box {...rowBox} gap={1}>
              {icon}
              <Client key={`n:${row.path}`} module="./row-live.tsx" props={rowProps} flexGrow={1} />
            </Box>
          ) : (
            <Box {...rowBox} justifyContent="space-between">
              <Box flexDirection="row" alignItems="center" gap={1} flexShrink={1} overflow="hidden">
                {icon}
                {/* No label of its own: the app draws the label, which is then what it holds, chevron included. */}
                <Button key={`n:${row.path}`} plain onPress={onPress}>
                  {named}
                </Button>
                {work === undefined ? null : (
                  <Text key="doing" color={DOING_COLOR[work.kind]} dimColor={work.isFading}>●</Text>
                )}
              </Box>
              <Box flexDirection="row" gap={1} flexShrink={0}>
                {aside.map(part => (
                  <Text key={part.key} color={part.color}>{part.text}</Text>
                ))}
              </Box>
            </Box>
          ),
        )
        continue
      }
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
              onPress={onPress}
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
    if (column === 'size' && isWide && isGrid) void countSizes($, shownFolders)

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

    // In the app the chosen file is in a pane of its own: this one is the tree and its line of git.
    if (!isGrid) {
      return card(
        heading,
        showsHint ? <Text key="hint" dimColor wrap="truncate-end">{t.noGitHint}</Text> : null,
        search,
        <Box key="tree" flexDirection="column">
          {tree}
        </Box>,
        gitLine,
      )
    }

    // The chosen file: its path, its detail line, its tools and its lines, or the line that stands in for them.
    const path = now.selected
    const opened = now.opened
    let detail: JSX.Element | null = null
    let tools: JSX.Element | null = null
    let body: JSX.Element
    let position: string | null = null
    let isScrollable = false
    // Where the file's window stands, for the scroll bar; null when nothing scrolls.
    let bar: Bar | null = null
    // The scroll bar and the blank column before it.
    const viewWidth = width - 2
    const isMarkdown = path !== null && isMarkdownFile(path)
    if (path === null) {
      body = message(t.pick)
    } else {
      const mark = files[path]
      const facts = factsOf(path, opened)
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
          const view = blockWindow(blocks, now.viewTop, viewRows, viewWidth)
          layout.viewLastTop = view.lastTop
          layout.viewPage = Math.max(1, view.count)
          const fits = view.first === 0 && view.count === blocks.length
          isScrollable = !fits
          const diff = content!.diff
          // A block has no lines to draw as a diff: drawn, the changes show only on the change map.
          const changeAt =
            diff === undefined
              ? undefined
              : (row: number) => {
                  const stretch = stretchOf(row, blocks.length)
                  const from = blocks[stretch.from]!.from + 1
                  // The last stretch holds what was removed after the last line too.
                  const to = stretch.to === blocks.length ? Infinity : blocks[stretch.to - 1]!.to
                  const held = diff.filter(line => line.now >= from && line.now <= to)
                  const change = changeOf(held)
                  if (change === undefined) return undefined
                  const top = blocks.findIndex(block => held[change.at]!.now <= block.to)
                  return { kind: change.kind, top: top < 0 ? stretch.from : top }
                }
          bar = { first: view.first, count: view.count, total: blocks.length, lastTop: view.lastTop, changeAt }
          const from = blocks[view.first]!.from
          const to = blocks[view.first + view.count - 1]!.to
          position = fits ? t.allLines(opened.lines) : t.blockLines(from + 1, to, opened.lines)
          body = (
            <Box height={viewRows} overflow="hidden">
              <Markdown key="drawn" text={printableLines(blocks.slice(view.first, view.first + view.count).map(block => block.text).join('\n\n'))} />
            </Box>
          )
        } else {
          const hint = isMarkdown && now.markdown && isHuge
          const rows = viewRows - (hint ? 1 : 0)
          const diff = content!.diff
          let drawn
          if (diff === undefined) {
            const view = textWindow(lines, now.viewTop, rows, viewWidth)
            layout.viewLastTop = view.lastTop
            const fits = view.count === view.total
            isScrollable = !fits
            bar = { first: view.first, count: view.count, total: view.total, lastTop: view.lastTop }
            position = fits
              ? t.allLines(view.total)
              : t.lines(view.first + 1, view.first + view.count, view.total, opened.shown < opened.lines)
            drawn = isCSharpFile(path) ? (
              csharpLines(lines, view.first, view.count)
            ) : (
              <Code
                key="file"
                source={lines.slice(view.first, view.first + view.count).join('\n')}
                path={path}
                startLine={view.first + 1}
              />
            )
          } else {
            // The whole file as a diff: its window counts removed lines as rows too.
            const view = diffWindow(diff, now.viewTop, rows, viewWidth)
            layout.viewLastTop = view.lastTop
            const fits = view.count === view.total
            isScrollable = !fits
            const changeAt = (row: number) => {
              const stretch = stretchOf(row, view.total)
              const change = changeOf(diff.slice(stretch.from, stretch.to))
              return change === undefined ? undefined : { kind: change.kind, top: Math.max(0, stretch.from + change.at - CHANGE_CONTEXT) }
            }
            bar = { first: view.first, count: view.count, total: view.total, lastTop: view.lastTop, changeAt }
            const shown = diff.slice(view.first, view.first + view.count)
            // The position names lines of the file now, whatever removed lines sit between them.
            const kept = shown.filter(line => line.op !== '-')
            const from = kept[0]?.now ?? shown[0]!.now
            const to = kept[kept.length - 1]?.now ?? from
            position = fits ? t.allLines(lines.length) : t.lines(from, Math.max(from, to), lines.length, opened.shown < opened.lines)
            drawn = <Code key="diff" source={printableLines(sourceOfDiff(shown))} path={path} format="diff" />
          }
          body = (
            <Box flexDirection="column" height={viewRows} overflow="hidden">
              {hint ? <Text color="yellow" wrap="truncate-end">{t.markdownHuge}</Text> : null}
              {drawn}
            </Box>
          )
        }
      } else {
        body = <Box flexDirection="column">{standInOf(opened).map(line => message(line.text, line.color))}</Box>
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
              hotkey={keyed('m')}
              onPress={() => update($, explorer, value => ({ ...explorerOf(value), markdown: !now.markdown, viewTop: 0 }))}
            >
              {`${now.markdown ? '☑' : '☐'} ${t.markdown}`}
            </Button>
          )}
          {path !== null && (
            <Button key="expand" plain hotkey={keyed('a')} onPress={() => update($, explorer, value => ({ ...explorerOf(value), expanded: !now.expanded }))}>
              {now.expanded ? t.back : t.expand}
            </Button>
          )}
          <Button key="copy" plain hotkey={keyed('c')} onPress={press => copyPath($, target, press.surface)}>
            {t.copy}
          </Button>
          <Button key="open" plain hotkey={keyed('o')} onPress={() => (target === null ? undefined : openWithApp($, target))}>
            {t.open}
          </Button>
        </Box>
      )
    }

    return card(
      heading,
      showsHint && !isExpanded ? <Text key="hint" dimColor wrap="truncate-end">{t.noGitHint}</Text> : null,
      search,
      isExpanded ? null : (
        <Box key="tree" flexDirection="column" height={treeRows} overflow="hidden">
          {tree}
        </Box>
      ),
      isExpanded ? null : <Text key="rule" dimColor>{'─'.repeat(width)}</Text>,
      <Text key="path" bold color={CURRENT} wrap="truncate-start">{path === null ? ' ' : printable(path)}</Text>,
      detail ?? <Text key="detail"> </Text>,
      tools ?? <Text key="tools"> </Text>,
      <Box key="body" flexDirection="row" marginTop={1} flexGrow={1} flexShrink={1} overflow="hidden">
        <Box flexDirection="column" flexGrow={1} flexShrink={1} overflow="hidden">
          {body}
        </Box>
        {isScrollable && bar !== null && scrollBar(bar)}
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

  // The chosen file in its own pane, opened from the app: its path, detail and tools, then the
  // file whole, up to what one drawing holds, which the app scrolls.
  on('ui.render', { component: 'Pane', requestId: FILE_PANE }, async ($, e) => {
    isFileShowing = true
    const elements = $.ui.resolve(e)
    const { Box, Text, Code, Markdown } = elements
    const now = explorerOf(await read($, explorer))
    const git = await read($, marks)
    const brief = await read($, notice)
    const files = git.kind === 'ok' ? git.files : {}
    const message = (text: string, color?: string) => (
      <Text key={text} color={color} dimColor={color === undefined} wrap="wrap">{text}</Text>
    )
    const path = now.selected
    if (path === null) return <Box flexDirection="column">{message(t.pick)}</Box>

    const opened = now.opened
    const isMarkdown = isMarkdownFile(path)
    let hint: JSX.Element | null = null
    let drawn = Infinity
    let body: JSX.Element
    if (opened === null || opened.kind === 'loading' || (opened.kind === 'text' && content?.path !== path)) {
      if (opened?.kind !== 'loading') void loadFile($, path, true)
      body = message(t.loading)
    } else if (opened.kind === 'text') {
      const { lines, blocks, diff } = content!
      const isHuge = blocks !== undefined && hasHugeBlock(blocks)
      if (lines.length === 0) body = message(t.empty)
      else if (isMarkdown && now.markdown && blocks !== undefined && !isHuge) {
        const count = fittingCount(blocks.map(block => block.text), DRAWN_CHARS, 2)
        if (count < blocks.length) drawn = blocks[count - 1]!.to
        body = <Markdown key="drawn" text={printableLines(blocks.slice(0, count).map(block => block.text).join('\n\n'))} />
      } else {
        if (isMarkdown && now.markdown) hint = <Text key="huge" color="yellow" wrap="wrap">{t.markdownHuge}</Text>
        if (diff !== undefined && isCSharpFile(path)) {
          // The app's code element paints no single line, and only C# the mod colors itself: a
          // changed C# file is drawn as Visual Studio's diff, its colors on each line's background.
          // Any other changed file is drawn as code, as one with no changes.
          const count = fittingCount(diff.map(line => `${line.op}${line.text}`), DRAWN_CHARS)
          const kept = diff.slice(0, count)
          if (count < diff.length) drawn = kept.filter(line => line.op !== '-').pop()?.now ?? 0
          const digits = String(diff.reduce((max, line) => Math.max(max, line.old, line.now), 1)).length
          const states = csharpStatesOf(lines)
          body = (
            <Box key="diff" flexDirection="column">
              {kept.map((line, at) => {
                const { tokens } = tokensOf(line.text.replace(/\r$/, '').replace(/\t/g, '    '), line.op === '-' ? 'code' : (states[line.now - 1] ?? 'code'))
                return (
                  <Box key={`d:${at}`} flexDirection="row" backgroundColor={line.op === ' ' ? undefined : DIFF_BG[line.op]}>
                    <Text dimColor mono>{hardSpaced(`${String(line.op === '-' ? line.old : line.now).padStart(digits)} `)}</Text>
                    <Box flexShrink={1} overflow="hidden">
                      <Text mono wrap="truncate-end">
                        {tokens.length === 0
                          ? ' '
                          : tokens.map((token, which) => (
                              <Text key={String(which)} color={token.kind === 'plain' ? undefined : CSHARP_COLORS[token.kind]}>
                                {hardSpaced(printable(token.text))}
                              </Text>
                            ))}
                      </Text>
                    </Box>
                  </Box>
                )
              })}
            </Box>
          )
        } else if (isCSharpFile(path)) {
          // Each line carries its number: the room it takes counts as the gap between lines.
          const digits = String(lines.length).length
          const count = fittingCount(lines, DRAWN_CHARS, digits + 1)
          if (count < lines.length) drawn = count
          body = <Box key="file" flexDirection="column">{csharpRows(elements, lines, count)}</Box>
        } else {
          const count = fittingCount(lines, DRAWN_CHARS)
          if (count < lines.length) drawn = count
          body = <Code key="file" source={lines.slice(0, count).join('\n')} path={path} startLine={1} wrap="truncate-end" />
        }
      }
    } else {
      body = <Box flexDirection="column">{standInOf(opened).map(line => message(line.text, line.color))}</Box>
    }

    const mark = files[path]
    const counts = git.kind === 'ok' ? git.lines[path] : undefined
    const facts = factsOf(path, opened, drawn)
    const folders = path.split('/')
    const name = folders.pop()!
    // As the app's own viewer: the path as crumbs, the tools as icons at its right, the detail under it.
    return (
      <Box flexDirection="column">
        <Box key="head" flexDirection="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Box flexShrink={1} overflow="hidden">
            <Text key="crumbs" wrap="truncate-start">
              {folders.map((folder, at) => (
                <Text key={`c:${at}`} dimColor>{`${printable(folder)} › `}</Text>
              ))}
              <Text key="name" weight="medium">{printable(name)}</Text>
            </Text>
          </Box>
          <Box flexDirection="row" gap={1} flexShrink={0}>
            {isMarkdown &&
              appTool(elements, {
                key: 'markdown',
                name: now.markdown ? t.showSource : t.showDrawn,
                isOn: !now.markdown,
                onPress: () => update($, explorer, value => ({ ...explorerOf(value), markdown: !now.markdown, viewTop: 0 })),
              })}
            {appTool(elements, { key: 'copy', name: t.copy, onPress: press => copyPath($, path, press.surface) })}
            {appTool(elements, { key: 'open', name: t.openWithApp, onPress: () => openWithApp($, path) })}
          </Box>
        </Box>
        <Text key="detail" dimColor size="caption" wrap="truncate-end">
          {mark !== undefined && <Text color={MARK_COLOR[mark]}>{t.marks[mark]}</Text>}
          {mark === 'M' && counts !== undefined && (
            <Text>
              {' · '}
              <Text color="green">{`+${counts[0]}`}</Text> <Text color="red">{`-${counts[1]}`}</Text>
            </Text>
          )}
          {mark !== undefined && facts !== '' ? ' · ' : ''}
          {facts}
        </Text>
        {brief !== null && <Text key="notice" color={CURRENT} wrap="truncate-end">{printable(brief)}</Text>}
        <Box key="body" flexDirection="column" marginTop={1}>
          {hint}
          {body}
        </Box>
      </Box>
    )
  })
}
