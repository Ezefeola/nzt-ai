import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Change, Diff, Mark, Snapshot, TurnStep, View } from '../types'
import {
  addedDiffOf,
  countedOf,
  countOf,
  diffOf,
  EMPTY_TREE,
  folderOf,
  keyOf,
  nameOf,
  parseNumstat,
  parseStatus,
  relativeTo,
  treeOrderOf,
} from './git'
import type { Count, Repo } from './git'
import { langOf, TEXTS } from './i18n'
import type { Texts } from './i18n'
import { kindOf } from './kinds'
import { CSHARP_COLORS, isCSharpFile, tokensOf } from './csharp'
import type { LineState, Token } from './csharp'
import type { RowPress, RowProps } from './row-live'
import {
  diffLines,
  diffWindow,
  entriesOf,
  fit,
  flatLinesOf,
  gitHunks,
  indexRange,
  lineOf,
  nearestTop,
  pathKeysOf,
  printable,
  rulerOf,
  rulerViewOf,
  sourceOfStep,
  splitLines,
  startLineOf,
  treeLinesOf,
  turnStepOf,
} from './turn'
import type { IndexLine, RulerMark } from './turn'

const PANE = 'nzt-changes'
const POLL_MS = 3000
// The card's rows besides the index and the diff: its border, heading, views, rule, position
// line, file, detail and buttons, and the four blank rows between heading and views, views and
// index, file and detail, detail and diff.
const CARD_ROWS = 13
// Body rows above the index: the blank row over the card, its border, heading, blank, views, blank.
const INDEX_START = 6
const MIN_DIFF_ROWS = 3
const INDEX_ROWS = { inline: 4, dock: 8 } as const
const DOCK_COLUMNS = 58
const INLINE_ROWS = 24
const DOCK_FLOOR = 110
// The accent of NZT's mods, the one nzt-state uses: a theme key, so it follows the theme.
const ACCENT = 'claude'
const CURRENT = 'cyan'
// The app draws one tree of up to 100,000 characters of text: a diff past that is cut short of it.
const DRAWN_CHARS = 95_000
// The app's theme is unknown to the mod: tints with transparency read on light and dark alike.
const DIFF_BG = { '+': '#2ea04333', '-': '#f8514933' } as const
const APP_CHOSEN_BG = '#8b949e38'
const APP_HOVER_BG = '#8b949e1f'

const snapshot = atom({ plugin: 'nzt-changes', key: 'snapshot' } as const, { kind: 'idle' } as Snapshot)
const view = atom({ plugin: 'nzt-changes', key: 'view' } as const, {
  open: [],
  mode: 'turn',
  turnIndex: 0,
  headIndex: 0,
  diffTop: 0,
  indexTop: null,
  diffPath: null,
  diff: null,
} as View)
const turn = atom({ plugin: 'nzt-changes', key: 'turn' } as const, [] as TurnStep[])
const touched = atom({ plugin: 'nzt-changes', key: 'touched' } as const, [] as string[])

const MARK_COLOR = {
  A: 'green',
  M: 'yellow',
  D: 'red',
  R: 'blue',
  '!': 'red',
} as const satisfies Record<Mark, string>

const RULER_COLOR = { add: 'green', rm: 'red', both: 'yellow' } as const satisfies Record<
  Exclude<RulerMark, ''>,
  string
>

// Module state a reload starts over: the edits of the turn in progress, what a reread
// compares against, and whether the pane is showing.
let pending: TurnStep[] = []
let repo: Repo | undefined
let lastKey = ''
let openMtime = -1
let isShowing = false
let running: Promise<void> | undefined
let isAgain = false
let loadingPath: string | null = null
let t: Texts = TEXTS.es
// Where the last drawing put the index and the diff, in body rows, and how far each scrolls:
// a wheel tick is told apart by the row under the pointer.
let layout = {
  index: [0, 0],
  diff: [0, 0],
  indexFrom: 0,
  indexRows: 1,
  indexLastTop: 0,
  diffLastTop: 0,
}

// The app lays text out as a page does and runs spaces together: a hard space keeps the indent.
const hardSpaced = (text: string) => text.replace(/ /g, ' ')

/** How many of `texts`, in order, fit in `limit` characters with `gap` between each; at least one. */
const fittingCount = (texts: string[], limit: number, gap = 1) => {
  let size = 0
  let count = 0
  for (const text of texts) {
    size += text.length + (count === 0 ? 0 : gap)
    if (size > limit && count > 0) break
    count++
  }
  return count
}

const clamp = (index: number, total: number) =>
  Number.isFinite(index) ? Math.max(0, Math.min(index, total - 1)) : 0

/**
 * The view as this version reads it. The session keeps its state across reloads, so a value
 * an older version wrote (0.1.0 had `selected` and no `mode`) arrives here too.
 */
const viewOf = (value: Partial<View> | undefined): View => ({
  open: Array.isArray(value?.open) ? value.open.filter(key => typeof key === 'string') : [],
  mode: value?.mode === 'head' ? 'head' : 'turn',
  turnIndex: Number.isFinite(value?.turnIndex) ? value!.turnIndex! : 0,
  headIndex: Number.isFinite(value?.headIndex) ? value!.headIndex! : 0,
  diffTop: Number.isFinite(value?.diffTop) ? value!.diffTop! : 0,
  indexTop: Number.isFinite(value?.indexTop) ? value!.indexTop! : null,
  diffPath: typeof value?.diffPath === 'string' ? value.diffPath : null,
  diff: value?.diff ?? null,
})

/** The HEAD view's steps: the files by mark, then in folder order. */
const headSteps = (state: Snapshot) => (state.kind === 'ok' ? treeOrderOf(state.files) : [])

/** Where a HEAD step sits in the index's tree. */
const placeOf = (file: Change) => ({ mark: file.mark, folder: folderOf(file.path) })

/** The index's lines for a view: flat in Turn, a tree in HEAD with `open`'s titles open. */
const indexLinesFor = (mode: View['mode'], total: number, head: Change[], open: readonly string[], k: number): IndexLine[] =>
  mode === 'turn' ? flatLinesOf(total) : treeLinesOf(head.map(placeOf), open, k)

/** `open` with the titles over HEAD step `k` opened too. */
const openedTo = (open: readonly string[], head: Change[], k: number) => {
  const file = head[k]
  if (file === undefined) return [...open]
  return [...new Set([...open, ...pathKeysOf(placeOf(file))])]
}

/** What the HEAD view's diff shows: hunks and the lines git's output lost, or one line that stands in for them. */
const shownOfDiff = (diff: Diff): { source: string; more: number } | string =>
  diff.kind === 'text'
    ? { source: gitHunks(diff.source), more: diff.cutLines }
    : diff.kind === 'error'
      ? `${t.diffError} ${diff.message}`
      : t[diff.kind]

/** A file's kind as the detail line names it, or undefined with no extension. */
const kindLabel = (path: string) => {
  const kind = kindOf(path)
  if (kind === undefined) return undefined
  return kind.kind === 'named' ? kind.name : kind.kind === 'image' ? t.image(kind.format) : t.text
}

/** One step's row of the index: its name and counts; in HEAD its title says its mark and folder. */
type Row = {
  name: string
  added: number | null
  removed: number | null
  isBinary: boolean
}

// The engine follows $ only into functions declared in this file, so everything that runs
// git or reads a file lives here; parsing what they return is in ./git and ./turn.

function git($: EngineInterface, argv: string[], cwd?: string) {
  return $.process.run(['git', ...argv], cwd === undefined ? undefined : { cwd })
}

// Untracked files are counted by reading them; the count is kept until the file changes.
const untrackedCounts = new Map<string, { mtimeMs: number; count: Count | null }>()

async function countUntracked($: EngineInterface, root: string, path: string) {
  const absolute = `${root}/${path}`
  const stat = await $.fs.stat(absolute).catch(() => undefined)
  if (stat === undefined || stat.kind !== 'file') return null
  const cached = untrackedCounts.get(absolute)
  if (cached !== undefined && cached.mtimeMs === stat.mtimeMs) return cached.count
  const text = await $.fs.read(absolute).catch(() => undefined)
  const count = text === undefined ? null : countOf(text)
  untrackedCounts.set(absolute, { mtimeMs: stat.mtimeMs, count })
  return count
}

async function repoOf($: EngineInterface): Promise<Repo | { reason: string }> {
  const top = await git($, ['rev-parse', '--show-toplevel']).catch((error: Error) => error)
  if (top instanceof Error) return { reason: top.message }
  if (top.exitCode !== 0) return { reason: top.stderr.trim() }
  const root = top.stdout.trim()
  const head = await git($, ['rev-parse', '--verify', '-q', 'HEAD'], root)
  return { root, base: head.exitCode === 0 ? 'HEAD' : EMPTY_TREE }
}

/** The changes against the base, with a key a reread compares with the last one. */
async function readChanges($: EngineInterface): Promise<{ snapshot: Snapshot; repo?: Repo; key: string }> {
  const found = await repoOf($).catch((error: Error) => ({ reason: error.message }))
  if ('reason' in found) {
    return { snapshot: { kind: 'norepo', reason: found.reason }, key: `norepo:${found.reason}` }
  }
  try {
    const status = await git($, ['status', '--porcelain=v1', '-z', '--untracked-files=all'], found.root)
    if (status.exitCode !== 0) throw new Error(status.stderr.trim())
    const numstat = await git(
      $,
      ['diff', found.base, '-M', '--numstat', '-z', '--no-color', '--no-ext-diff'],
      found.root,
    )
    if (numstat.exitCode !== 0) throw new Error(numstat.stderr.trim())
    const counts = parseNumstat(numstat.stdout)
    const files = parseStatus(status.stdout)
    const untracked = new Map<string, Count | null>()
    for (const file of files.filter(f => f.isUntracked)) {
      untracked.set(file.path, await countUntracked($, found.root, file.path))
    }
    const next: Snapshot = {
      kind: 'ok',
      files: countedOf(files, file =>
        file.isUntracked ? untracked.get(file.path) ?? null : counts.get(file.path) ?? null,
      ),
    }
    return { snapshot: next, repo: found, key: keyOf(next) }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { snapshot: { kind: 'error', message }, repo: found, key: `error:${message}` }
  }
}

/** One file's diff against the base. */
async function readDiff($: EngineInterface, found: Repo, file: Change): Promise<Diff> {
  try {
    if (file.isUntracked) return addedDiffOf(await $.fs.read(`${found.root}/${file.path}`))
    const paths = file.from === undefined ? [file.path] : [file.from, file.path]
    const out = await git(
      $,
      ['diff', found.base, '-M', '--no-color', '--no-ext-diff', '--', ...paths],
      found.root,
    )
    if (out.exitCode !== 0) return { kind: 'error', message: out.stderr.trim() }
    return diffOf(out.stdout)
  } catch (error) {
    return { kind: 'error', message: error instanceof Error ? error.message : String(error) }
  }
}

/** Loads the diff of the HEAD step being shown, unless it is loaded or loading. */
async function loadDiff($: EngineInterface, file: Change, force = false) {
  if (repo === undefined) return
  const now = viewOf(await read($, view))
  if (!force && (now.diffPath === file.path || loadingPath === file.path)) return
  loadingPath = file.path
  const stat = await $.fs.stat(`${repo.root}/${file.path}`).catch(() => undefined)
  openMtime = stat?.mtimeMs ?? -2
  const diff = await readDiff($, repo, file)
  loadingPath = null
  await update($, view, value => ({ ...viewOf(value),diffPath: file.path, diff }))
}

/** Rereads the HEAD step's diff when the list changed or its file did. */
async function refreshDiff($: EngineInterface, state: Snapshot, hasChanged: boolean) {
  const now = viewOf(await read($, view))
  const steps = headSteps(state)
  if (now.mode !== 'head' || steps.length === 0 || repo === undefined) return
  const file = steps[clamp(now.headIndex, steps.length)]
  if (file === undefined) return
  const stat = await $.fs.stat(`${repo.root}/${file.path}`).catch(() => undefined)
  const mtime = stat?.mtimeMs ?? -2
  if (!hasChanged && mtime === openMtime && now.diffPath === file.path) return
  await loadDiff($, file, true)
}

async function readOnce($: EngineInterface) {
  const next = await readChanges($)
  repo = next.repo
  const hasChanged = next.key !== lastKey || (await read($, snapshot)).kind === 'idle'
  if (hasChanged) {
    lastKey = next.key
    await update($, snapshot, () => next.snapshot)
  }
  await refreshDiff($, next.snapshot, hasChanged)
}

// One read at a time; a request that arrives during one runs once more after it, so a
// write that lands mid-read is not missed.
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

/** The path a turn step shows: from the repository's root when inside it. */
function shownPath(path: string) {
  const slashed = path.replace(/\\/g, '/')
  return (repo === undefined ? undefined : relativeTo(repo.root, slashed)) ?? slashed
}

/** The edit a tool call is about to make, as a step; undefined for any other tool. */
async function stepOf($: EngineInterface, e: { tool: string } & Record<string, unknown>) {
  if (e.tool === 'Edit' && typeof e.file_path === 'string') {
    const oldString = String(e.old_string ?? '')
    const lines = diffLines(oldString, String(e.new_string ?? ''))
    const before = await $.fs.read(e.file_path).catch(() => undefined)
    const note = e.replace_all === true ? 'replaceAll' : undefined
    return turnStepOf('Edit', shownPath(e.file_path), lines, note, startLineOf(before, oldString))
  }
  if (e.tool === 'Write' && typeof e.file_path === 'string') {
    const before = await $.fs.read(e.file_path).catch(() => undefined)
    const lines = diffLines(before ?? '', String(e.content ?? ''))
    return turnStepOf('Write', shownPath(e.file_path), lines, before === undefined ? 'newFile' : 'rewrite')
  }
  if (e.tool === 'NotebookEdit' && typeof e.notebook_path === 'string') {
    const lines = splitLines(String(e.new_source ?? '')).map(line => ({ op: '+' as const, t: line }))
    return turnStepOf('NotebookEdit', shownPath(e.notebook_path), lines)
  }
  return undefined
}

async function go($: EngineInterface, by: number) {
  const now = viewOf(await read($, view))
  const head = headSteps(await read($, snapshot))
  const total = now.mode === 'turn' ? (await read($, turn)).length : head.length
  if (total === 0) return
  const key = now.mode === 'turn' ? 'turnIndex' : 'headIndex'
  await update($, view, value => {
    const was = viewOf(value)
    const step = clamp(was[key] + by, total)
    // A step inside a closed group opens it; the index moves only as far as the step needs to show.
    const open = was.mode === 'head' ? openedTo(was.open, head, step) : was.open
    const line = Math.max(0, lineOf(indexLinesFor(was.mode, total, head, open, step), step))
    return { ...was, [key]: step, open, diffTop: 0, indexTop: nearestTop(layout.indexFrom, line, layout.indexRows) }
  })
}

/** Opens or closes a title of the HEAD index, which stays where it is. */
async function toggle($: EngineInterface, key: string) {
  await update($, view, value => {
    const now = viewOf(value)
    const open = now.open.includes(key) ? now.open.filter(k => k !== key) : [...now.open, key]
    return { ...now, open, indexTop: layout.indexFrom }
  })
}

/** Moves the diff's window by `by` lines, within what the last drawing allowed. */
async function scrollDiff($: EngineInterface, by: number) {
  await update($, view, value => {
    const now = viewOf(value)
    return { ...now, diffTop: Math.max(0, Math.min(now.diffTop + by, layout.diffLastTop)) }
  })
}

/** Jumps to a step picked in the index, which stays where it is: the row picked is in view. */
async function select($: EngineInterface, step: number) {
  await update($, view, value => {
    const now = viewOf(value)
    return { ...now, [now.mode === 'turn' ? 'turnIndex' : 'headIndex']: step, diffTop: 0, indexTop: layout.indexFrom }
  })
}

async function show($: EngineInterface, mode: View['mode']) {
  await update($, view, value => ({ ...viewOf(value), mode, diffTop: 0, indexTop: null }))
  if (mode !== 'head') return
  await refresh($)
  // Landing on HEAD opens the groups of the step it lands on.
  const head = headSteps(await read($, snapshot))
  await update($, view, value => {
    const now = viewOf(value)
    return { ...now, open: openedTo(now.open, head, clamp(now.headIndex, head.length)) }
  })
}

async function closePane($: EngineInterface) {
  isShowing = false
  await $.ui.close({ id: PANE }).catch(() => undefined)
}

export const register: Register = (on, options) => {
  t = TEXTS[langOf(options.language)]

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'nzt-changes', description: t.commandDescription })
    $.clock.every(POLL_MS, () => {
      if (isShowing) void refresh($)
    })

    return next(e)
  })

  on('command.run', { command: 'nzt-changes' }, async ($, e) => {
    const steps = await read($, turn)
    const mode: View['mode'] = steps.length > 0 ? 'turn' : 'head'
    // Every opening starts with the HEAD index's groups closed.
    await update($, view, value => ({ ...viewOf(value), mode, open: [], indexTop: null }))
    // Replay Theater's width when docked; inline, a fixed height the card fills.
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

    if (!opened.isPlaced) return { text: t.paneWaiting(opened.reason) }
    // The app seats the pane at its side: what follows speaks of a terminal, which it has not.
    if ((await $.session.surfaces().catch(() => [])).some(surface => surface !== 'terminal')) return {}
    // Claude Code docks a pane beside the transcript only in fullscreen and from 110 columns.
    const { isFullscreen, columns } = e.presentation
    if (!isFullscreen) return { text: t.paneInlineNoFullscreen }
    if (columns < DOCK_FLOOR) return { text: t.paneInlineNarrow(columns, DOCK_FLOOR) }
    return { text: t.paneOpened }
  })

  // On the terminal the tree is exactly as tall as the body, so the engine has nothing to scroll:
  // the wheel moves the index when it is over the index, and the diff anywhere else, keys included.
  // In the app the pane is drawn whole and taller than the body: there the app scrolls it.
  on('ui.scroll', { requestId: PANE }, async ($, e, next) => {
    if (e.contentRows > e.bodyRows) return next(e)
    const row = e.pointer?.row
    const isIndex = row !== undefined && row >= layout.index[0]! && row < layout.index[1]!
    const within = (value: number, last: number) => Math.max(0, Math.min(value, last))
    if (!isIndex) await scrollDiff($, e.by)
    else {
      await update($, view, value => {
        const now = viewOf(value)
        return { ...now, indexTop: within((now.indexTop ?? layout.indexFrom) + e.by, layout.indexLastTop) }
      })
    }
    return {}
  })

  // A click or Enter on a row of the app's index: as its Button does on the terminal.
  on('ui.message', { requestId: PANE }, async ($, e) => {
    const pressed = e.data as Partial<RowPress> | null
    const press = typeof pressed?.press === 'string' ? pressed.press : ''
    if (press.startsWith('step:')) await select($, Number(press.slice(5)))
    else if (press.startsWith('group:')) await toggle($, press.slice(6))
    return {}
  })

  on('ui.close', async ($, e, next) => {
    if (e.id === PANE) isShowing = false
    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    if ((e as { agentId?: string }).agentId === undefined) pending = []
    return next(e)
  })

  // A main-loop turn that made edits becomes the turn the pane replays.
  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    if (e.agentId !== undefined || pending.length === 0) return done
    const steps = pending
    pending = []
    await update($, turn, () => steps).catch(() => undefined)
    await update($, view, value => ({ ...viewOf(value), turnIndex: 0, diffTop: 0, indexTop: null })).catch(
      () => undefined,
    )

    return done
  })

  // Records each edit before it runs and never holds it up; then remembers what Claude
  // touched and shows a change at once instead of on the next poll.
  on('tool.call', async ($, e, next) => {
    const step = await stepOf($, e as unknown as { tool: string } & Record<string, unknown>).catch(
      () => undefined,
    )
    if (step !== undefined) pending.push(step)
    const ran = await next(e)
    const path =
      e.tool === 'Write' || e.tool === 'Edit'
        ? e.file_path
        : e.tool === 'NotebookEdit'
          ? e.notebook_path
          : undefined
    if (path !== undefined) {
      const slashed = path.replace(/\\/g, '/')
      await update($, touched, list => (list.includes(slashed) ? list : [...list, slashed])).catch(
        () => undefined,
      )
    }
    if (isShowing && (path !== undefined || e.tool === 'Bash')) await refresh($)

    return ran
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    isShowing = true
    const { Box, Text, Button, Code } = $.ui.resolve(e)
    const now = viewOf(await read($, view))
    const state = await read($, snapshot)
    const turnSteps = await read($, turn)
    const mine = new Set(
      (await read($, touched)).map(path => (repo === undefined ? undefined : relativeTo(repo.root, path))),
    )
    // Inside the card's border and padding.
    const width = Math.max(30, e.props.bodyColumns - 4)

    const isTurn = now.mode === 'turn'
    const head = headSteps(state)
    const total = isTurn ? turnSteps.length : head.length
    const k = total === 0 ? 0 : clamp(isTurn ? now.turnIndex : now.headIndex, total)

    const rows: Row[] = isTurn
      ? turnSteps.map(step => ({
          name: step.file,
          added: step.added,
          removed: step.removed,
          isBinary: false,
        }))
      : head.map(file => ({
          name: nameOf(file.path),
          added: file.added,
          removed: file.removed,
          isBinary: file.isBinary,
        }))

    const counts = (added: number, removed: number) => (
      <Text>
        <Text color="green">+{added}</Text> <Text color="red">-{removed}</Text>
      </Text>
    )

    if (e.surface !== 'terminal') {
      // The app gives the pane its own tab, title and close, scrolls it, and lays it out in a
      // proportional font: there the pane goes unframed, drawn whole, its Buttons with no hotkey,
      // which the app would draw as a chip on each.
      const elements = $.ui.resolve(e)
      const Client = 'Client' in elements ? elements.Client : undefined
      const lines = indexLinesFor(now.mode, total, head, now.open, k)

      const appRow = (key: string, props: RowProps, depth: number, isChosen: boolean, onPress: () => unknown) => {
        const box = {
          key: `r:${key}`,
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: depth * 2,
          paddingY: 'xs',
          paddingRight: 'sm',
          backgroundColor: isChosen ? APP_CHOSEN_BG : undefined,
          hover: { backgroundColor: APP_HOVER_BG },
        } as const
        // Where the surface draws no Client, the name is a Button and the rest goes beside it.
        return Client !== undefined ? (
          <Box {...box}>
            <Client key={key} module="./row-live.tsx" props={props} flexGrow={1} />
          </Box>
        ) : (
          <Box {...box} justifyContent="space-between">
            <Button key={key} plain onPress={onPress}>
              {`${props.isOpen === null ? '' : props.isOpen ? '⌄ ' : '› '}${props.name}`}
            </Button>
            <Box flexDirection="row" gap={1} flexShrink={0}>
              {props.aside.map(part => (
                <Text key={part.key} color={part.color} dimColor={part.isDim === true}>{part.text}</Text>
              ))}
            </Box>
          </Box>
        )
      }

      const index = lines.map(line => {
        if (line.kind !== 'step') {
          const press = `group:${line.key}`
          return appRow(
            press,
            {
              press,
              isOpen: line.isOpen,
              lead: line.kind === 'mark' ? { text: line.mark, color: MARK_COLOR[line.mark] } : null,
              name: printable(line.kind === 'folder' ? `${line.folder}/` : t.groups[line.mark]),
              isBold: line.kind === 'mark',
              aside: [{ key: 'count', text: String(line.count), isDim: true }],
            },
            line.kind === 'folder' ? 1 : 0,
            false,
            () => toggle($, line.key),
          )
        }
        const i = line.step
        const row = rows[i]!
        const press = `step:${i}`
        const aside: RowProps['aside'] =
          row.isBinary || row.added === null || row.removed === null
            ? [{ key: 'tally', text: row.isBinary ? 'bin' : '·', isDim: true }]
            : [
                { key: 'add', text: `+${row.added}`, color: 'green' },
                { key: 'del', text: `-${row.removed}`, color: 'red' },
              ]
        return appRow(
          press,
          { press, isOpen: null, lead: { text: String(i + 1), isDim: true }, name: printable(row.name), isBold: i === k, aside },
          line.depth,
          i === k,
          () => select($, i),
        )
      })

      const message = (text: string, color?: string) => (
        <Text key={text} color={color} dimColor={color === undefined} wrap="wrap">{text}</Text>
      )

      // Painted line by line as Visual Studio paints a diff: each line with its number, the added
      // on green and the removed on red, with no hunk header and no marker; C# in its colors.
      const appDiff = (source: string, path: string, more: number) => {
        const entries = entriesOf(source)
        if (entries.length === 0) return message(t.noLines)
        const count = fittingCount(entries.map(entry => entry.t), DRAWN_CHARS)
        const kept = entries.slice(0, count)
        const digits = String(kept.reduce((max, entry) => Math.max(max, entry.o, entry.n), 1)).length
        const isCSharp = isCSharpFile(path)
        // A hunk is a fragment: its comment or verbatim string may open before it, which is then missed.
        let oldState: LineState = 'code'
        let newState: LineState = 'code'
        const painted: JSX.Element[] = []
        kept.forEach((entry, at) => {
          if (at > 0 && kept[at - 1]!.hunk !== entry.hunk) {
            painted.push(<Text key={`gap:${at}`} dimColor mono>{'⋯'}</Text>)
          }
          const text = entry.t.replace(/\r$/, '').replace(/\t/g, '    ')
          let tokens: Token[] = [{ text, kind: 'plain' }]
          if (isCSharp) {
            const was = entry.op === '-' ? oldState : newState
            const read = tokensOf(text, was)
            tokens = read.tokens
            if (entry.op !== '+') oldState = read.next
            if (entry.op !== '-') newState = read.next
          }
          painted.push(
            <Box key={`d:${at}`} flexDirection="row" backgroundColor={entry.op === ' ' ? undefined : DIFF_BG[entry.op]}>
              <Text dimColor mono>{hardSpaced(`${String(entry.op === '-' ? entry.o : entry.n).padStart(digits)} `)}</Text>
              <Box flexShrink={1} overflow="hidden">
                <Text mono wrap="truncate-end">
                  {text === ''
                    ? ' '
                    : tokens.map((token, which) => (
                        <Text key={String(which)} color={token.kind === 'plain' ? undefined : CSHARP_COLORS[token.kind]}>
                          {hardSpaced(printable(token.text))}
                        </Text>
                      ))}
                </Text>
              </Box>
            </Box>,
          )
        })
        const left = entries.length - count
        return (
          <Box key="diff" flexDirection="column">
            {painted}
            {left > 0 && message(t.undrawn(left))}
            {more > 0 && message(t.more(more).replace(/^ · /, ''))}
          </Box>
        )
      }

      // The step's file: its name, and its folder under it, so a long path never hides the name.
      const heading = (path: string) => (
        <Box key="heading" flexDirection="column">
          <Text bold color={CURRENT} wrap="wrap">{printable(nameOf(path))}</Text>
          {folderOf(path) !== '' && <Text dimColor wrap="wrap">{printable(folderOf(path))}</Text>}
        </Box>
      )

      const detailOf = (lead: JSX.Element, path: string, added: number, removed: number, isBinary = false) => {
        const kind = kindLabel(path)
        return (
          <Text key="detail" wrap="wrap">
            {lead}
            {kind !== undefined && <Text>{` · ${kind}`}</Text>}
            {isBinary ? <Text dimColor>{` · ${t.binaryTag}`}</Text> : <Text>{'  '}{counts(added, removed)}</Text>}
          </Text>
        )
      }

      let body: JSX.Element
      if (isTurn) {
        const step = turnSteps[k]
        body =
          step === undefined ? (
            <Box flexDirection="column" gap="xs">
              {message(t.turnEmpty)}
              {message(t.appTurnEmptyHint)}
            </Box>
          ) : (
            <Box flexDirection="column" gap="sm">
              {heading(step.file)}
              {detailOf(
                <Text dimColor>{step.tool}{step.note === undefined ? '' : ` · ${t[step.note]}`}</Text>,
                step.file,
                step.added,
                step.removed,
              )}
              {appDiff(sourceOfStep(step), step.file, step.more)}
            </Box>
          )
      } else if (state.kind === 'idle') {
        void refresh($)
        body = message(t.loading)
      } else if (state.kind === 'norepo') {
        body = (
          <Box flexDirection="column" gap="xs">
            {message(t.noRepo)}
            {message(state.reason)}
          </Box>
        )
      } else if (state.kind === 'error') {
        body = (
          <Box flexDirection="column" gap="xs">
            {message(t.unreadable, 'red')}
            {message(state.message)}
          </Box>
        )
      } else if (head.length === 0) {
        body = message(t.clean, 'green')
      } else {
        const file = head[k]!
        if (now.diffPath !== file.path) void loadDiff($, file)
        const diff = now.diffPath === file.path ? now.diff : null
        const shown = diff === null ? t.loading : shownOfDiff(diff)
        body = (
          <Box flexDirection="column" gap="sm">
            {file.from === undefined ? heading(file.path) : heading(`${file.from} → ${file.path}`)}
            {detailOf(
              <Text>
                <Text color={MARK_COLOR[file.mark]}>{t.marks[file.mark]}</Text>
                {mine.has(file.path) && <Text color="claude">{` · ${t.byClaude}`}</Text>}
              </Text>,
              file.path,
              file.added ?? 0,
              file.removed ?? 0,
              file.isBinary,
            )}
            {typeof shown === 'string' ? message(shown) : appDiff(shown.source, file.path, shown.more)}
          </Box>
        )
      }

      const summary =
        total === 0 ? null : isTurn ? (
          <Text dimColor>{t.turnSummary(total, new Set(turnSteps.map(step => step.file)).size)}</Text>
        ) : (
          <Text>
            <Text dimColor>{t.headSummary(total)}</Text>
            {counts(
              head.reduce((sum, file) => sum + (file.added ?? 0), 0),
              head.reduce((sum, file) => sum + (file.removed ?? 0), 0),
            )}
          </Text>
        )

      // The view on shows as the app's primary button, since the app does not color text inside one.
      const view = (mode: View['mode'], label: string) => (
        <Button key={`view-${mode}`} label={label} variant={now.mode === mode ? 'primary' : 'secondary'} onPress={() => show($, mode)} />
      )

      return (
        <Box flexDirection="column" gap="sm" paddingY="xs">
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" gap="sm">
            <Box flexDirection="row" gap="xs" flexShrink={0}>
              {view('turn', t.appTurn)}
              {view('head', t.appHead)}
            </Box>
            <Box flexShrink={1} overflow="hidden">
              {summary}
            </Box>
          </Box>
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" gap="sm">
            <Text bold>{total === 0 ? t.noSteps : t.step(k + 1, total)}</Text>
            {total > 0 && (
              <Box flexDirection="row" gap="xs" flexShrink={0}>
                <Button key="prev" label={t.prev} onPress={() => go($, -1)} />
                <Button key="next" label={t.next} onPress={() => go($, 1)} />
              </Box>
            )}
          </Box>
          {index.length > 0 && <Box flexDirection="column">{index}</Box>}
          <Box flexDirection="column" marginTop="sm">
            {body}
          </Box>
        </Box>
      )
    }

    // The index: a window of its lines. In HEAD a tree of titles, by mark and then folder, that
    // open and close; each step a button that jumps to it, dim until the pointer or the focus is on it.
    const index: JSX.Element[] = []
    const lines = indexLinesFor(now.mode, total, head, now.open, k)
    const range = indexRange(lines, k, INDEX_ROWS[e.props.placement], now.indexTop)
    if (total > 0) {
      if (range.above > 0) index.push(<Text key="above" dimColor>{`  ${t.above(range.above)}`}</Text>)
      for (const line of lines.slice(range.from, range.to)) {
        if (line.kind !== 'step') {
          const indent = line.kind === 'folder' ? '  ' : ''
          const label = line.kind === 'folder' ? `${line.folder}/` : t.groups[line.mark]
          const room = width - indent.length - 4 - String(line.count).length - 1
          // Only the name is the button, as in a step's row.
          index.push(
            <Box key={`g-${line.key}`} flexDirection="row">
              <Text color={line.isHere ? ACCENT : undefined} dimColor={!line.isHere}>
                {`${indent}${line.isOpen ? '▾' : '▸'} `}
              </Text>
              {line.kind === 'mark' && <Text color={MARK_COLOR[line.mark]}>{`${line.mark} `}</Text>}
              <Button key={`group-${line.key}`} plain dimColor={!line.isHere && line.kind === 'folder'} onPress={() => toggle($, line.key)}>
                <Text bold={line.kind === 'mark'} color={line.isHere ? ACCENT : undefined}>
                  {fit(printable(label), room)}
                </Text>
              </Button>
              <Text dimColor>{` ${line.count}`}</Text>
            </Box>,
          )
          continue
        }
        const i = line.step
        const row = rows[i]!
        const isCurrent = i === k
        const indent = '  '.repeat(line.depth)
        const tally = row.isBinary ? 'bin' : row.added === null || row.removed === null ? '·' : `+${row.added} -${row.removed}`
        const room = width - 6 - indent.length - tally.length - 1
        // Only the name is the button: the engine inverts a button under the pointer, and a
        // whole inverted row read as noise.
        index.push(
          <Box key={`i${i}`} flexDirection="row" justifyContent="space-between">
            <Box flexDirection="row">
              <Text color={CURRENT}>{`${indent}${isCurrent ? '▸ ' : '  '}`}</Text>
              <Text dimColor>{String(i + 1).padStart(2)}</Text>
              <Text> </Text>
              <Button key={`step-${i}`} plain dimColor={!isCurrent} onPress={() => select($, i)}>
                <Text bold={isCurrent} color={isCurrent ? CURRENT : undefined}>
                  {fit(printable(row.name), room)}
                </Text>
              </Button>
            </Box>
            {row.isBinary || row.added === null || row.removed === null ? (
              <Text dimColor>{tally}</Text>
            ) : (
              counts(row.added, row.removed)
            )}
          </Box>,
        )
      }
      if (range.below > 0) index.push(<Text key="below" dimColor>{`  ${t.below(range.below)}`}</Text>)
    }

    // The card is exactly as tall as the body: the diff takes what the rest leaves.
    // One row less than the body: the blank row above the card keeps it off the pane's tabs.
    const height = e.props.scroll.bodyRows - 1
    const diffRows = Math.max(MIN_DIFF_ROWS, height - CARD_ROWS - index.length)
    // Below the index: its rule and the position line, then file, blank, detail, blank.
    const diffStart = INDEX_START + index.length + (index.length > 0 ? 2 : 0) + 4
    layout = {
      index: [INDEX_START, INDEX_START + index.length],
      diff: [diffStart, diffStart + diffRows],
      indexFrom: range.from,
      indexRows: INDEX_ROWS[e.props.placement],
      indexLastTop: range.lastTop,
      diffLastTop: 0,
    }

    const summary =
      total === 0 ? null : isTurn ? (
        <Text dimColor>{t.turnSummary(total, new Set(turnSteps.map(step => step.file)).size)}</Text>
      ) : (
        <Text>
          <Text dimColor>{t.headSummary(total)}</Text>
          {counts(
            head.reduce((sum, file) => sum + (file.added ?? 0), 0),
            head.reduce((sum, file) => sum + (file.removed ?? 0), 0),
          )}
        </Text>
      )

    const tab = (mode: View['mode'], label: string, hotkey: string) => (
      <Button key={`view-${mode}`} plain hotkey={hotkey} onPress={() => show($, mode)}>
        <Text bold={now.mode === mode} color={now.mode === mode ? ACCENT : undefined} dimColor={now.mode !== mode}>
          {` ${label} `}
        </Text>
      </Button>
    )

    // Which lines of the diff are in view, drawn under the index's rule; empty for a step with no diff.
    let position: JSX.Element | null = null

    // The diff as Claude Code draws its own, numbered and coloured by the file's language, in a
    // window of its own; beside it, when it does not fit, the ruler of where its changes are.
    const diffView = (source: string, path: string, more: number) => {
      const whole = diffWindow(source, now.diffTop, diffRows, width)
      const fits = whole.count === whole.total
      const shown = fits ? whole : diffWindow(source, now.diffTop, diffRows, width - 2)
      layout.diffLastTop = shown.lastTop
      if (shown.total === 0) return message(t.noLines)
      const marks = fits ? [] : rulerOf(source, diffRows)
      const seen = rulerViewOf(shown.total, diffRows, shown.first, shown.count)
      position = (
        <Box flexDirection="row" gap={2}>
          <Text dimColor wrap="truncate-end">
            {(fits
              ? t.allLines(shown.total)
              : t.lines(shown.first + 1, shown.first + shown.count, shown.total)) +
              (more > 0 ? t.more(more) : '')}
          </Text>
          {!fits && (
            <Box flexDirection="row" gap={1} flexShrink={0}>
              <Text dimColor>{t.scrollHint}</Text>
              <Button key="up" plain hotkey="k" onPress={() => scrollDiff($, -Math.max(1, Math.floor(diffRows / 2)))}>
                ▲
              </Button>
              <Button key="down" plain hotkey="j" onPress={() => scrollDiff($, Math.max(1, Math.floor(diffRows / 2)))}>
                ▼
              </Button>
            </Box>
          )}
        </Box>
      )
      return (
        <Box flexDirection="column" flexGrow={1}>
          <Box flexDirection="row" height={diffRows} gap={1}>
            <Box flexDirection="column" flexGrow={1} flexShrink={1} overflow="hidden">
              <Code key="diff" source={shown.source} path={path} format="diff" />
            </Box>
            {!fits && (
              <Box flexDirection="column" width={1}>
                {marks.map((mark, i) => {
                  // What is in view is a grey bar under the marks, never replaced by them.
                  const isSeen = i >= seen.from && i <= seen.to
                  return mark === '' ? (
                    <Text key={`r${i}`} dimColor={!isSeen} color={isSeen ? 'gray' : undefined}>
                      {isSeen ? '█' : '│'}
                    </Text>
                  ) : (
                    <Text key={`r${i}`} color={RULER_COLOR[mark]} backgroundColor={isSeen ? 'gray' : undefined}>
                      ▐
                    </Text>
                  )
                })}
              </Box>
            )}
          </Box>
        </Box>
      )
    }

    const detail = (lead: JSX.Element, path: string, added: number, removed: number, isBinary = false) => {
      const kind = kindLabel(path)
      return (
        <Text>
          {lead}
          {kind !== undefined && <Text>{` · ${kind}`}</Text>}
          {isBinary ? <Text dimColor>{` · ${t.binaryTag}`}</Text> : <Text>{'  '}{counts(added, removed)}</Text>}
        </Text>
      )
    }

    const message = (text: string, color?: string) => (
      <Text color={color} dimColor={color === undefined} wrap="wrap">{`  ${text}`}</Text>
    )

    // The step's file, its detail line and its diff, or the line that stands in for them.
    let body
    if (isTurn) {
      const step = turnSteps[k]
      body =
        step === undefined ? (
          <Box flexDirection="column">
            {message(t.turnEmpty)}
            <Text dimColor wrap="wrap">{`  ${t.turnEmptyHint}`}</Text>
          </Box>
        ) : (
          <Box flexDirection="column">
            <Text bold color={CURRENT} wrap="truncate-start">{printable(step.file)}</Text>
            <Box marginTop={1}>
              {detail(
                <Text dimColor>{step.tool}{step.note === undefined ? '' : ` · ${t[step.note]}`}</Text>,
                step.file,
                step.added,
                step.removed,
              )}
            </Box>
            <Box flexDirection="column" marginTop={1}>
              {diffView(sourceOfStep(step), step.file, step.more)}
            </Box>
          </Box>
        )
    } else if (state.kind === 'idle') {
      void refresh($)
      body = message(t.loading)
    } else if (state.kind === 'norepo') {
      body = (
        <Box flexDirection="column">
          {message(t.noRepo)}
          <Text dimColor wrap="wrap">{`  ${state.reason}`}</Text>
        </Box>
      )
    } else if (state.kind === 'error') {
      body = (
        <Box flexDirection="column">
          {message(t.unreadable, 'red')}
          <Text dimColor wrap="wrap">{`  ${state.message}`}</Text>
        </Box>
      )
    } else if (head.length === 0) {
      body = message(t.clean, 'green')
    } else {
      const file = head[k]!
      if (now.diffPath !== file.path) void loadDiff($, file)
      const diff = now.diffPath === file.path ? now.diff : null
      const shown = diff === null ? t.loading : shownOfDiff(diff)
      body = (
        <Box flexDirection="column">
          <Text bold color={CURRENT} wrap="truncate-start">
            {printable(file.from === undefined ? file.path : `${file.from} → ${file.path}`)}
          </Text>
          <Box marginTop={1}>
            {detail(
              <Text>
                <Text color={MARK_COLOR[file.mark]}>{t.marks[file.mark]}</Text>
                {mine.has(file.path) && <Text color="claude">{` · ${t.byClaude}`}</Text>}
              </Text>,
              file.path,
              file.added ?? 0,
              file.removed ?? 0,
              file.isBinary,
            )}
          </Box>
          <Box flexDirection="column" marginTop={1}>
            {typeof shown === 'string' ? message(shown) : diffView(shown.source, file.path, shown.more)}
          </Box>
        </Box>
      )
    }

    return (
      <Box flexDirection="column" marginTop={1} height={height} borderStyle="round" borderColor={ACCENT} paddingX={1}>
        <Box flexDirection="row" justifyContent="space-between">
          <Text>
            <Text backgroundColor={ACCENT} color="inverseText" bold> NZT </Text>{' '}
            <Text bold color={ACCENT}>{t.title}</Text>
          </Text>
          <Text bold>{total === 0 ? t.noSteps : t.step(k + 1, total)}</Text>
        </Box>
        <Box flexDirection="row" justifyContent="space-between" marginTop={1}>
          <Box flexDirection="row" flexShrink={0}>
            {tab('turn', t.turn, 't')}
            {tab('head', t.head, 'h')}
          </Box>
          <Box flexShrink={1} overflow="hidden">
            {summary}
          </Box>
        </Box>
        {index.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            {index}
          </Box>
        )}
        {index.length > 0 && <Text dimColor>{'─'.repeat(width)}</Text>}
        {index.length > 0 && (
          <Box flexDirection="row" justifyContent="flex-end" height={1}>
            {position}
          </Box>
        )}
        <Box flexDirection="column" flexGrow={1} flexShrink={1} overflow="hidden" marginTop={index.length > 0 ? 0 : 1}>
          {body}
        </Box>
        <Box flexDirection="row" justifyContent="flex-end" gap={2}>
          {total > 0 && <Button key="prev" label={t.prev} hotkey="p" onPress={() => go($, -1)} />}
          {total > 0 && <Button key="next" label={t.next} hotkey="n" autoFocus onPress={() => go($, 1)} />}
          <Button key="close" label={t.close} hotkey="c" onPress={() => closePane($)} />
        </Box>
      </Box>
    )
  })
}
