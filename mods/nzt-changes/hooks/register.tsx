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
  groupsOf,
  keyOf,
  nameOf,
  parseNumstat,
  parseStatus,
  relativeTo,
} from './git'
import type { Count, Repo } from './git'
import { langOf, TEXTS } from './i18n'
import type { Texts } from './i18n'
import { kindOf } from './kinds'
import {
  diffLines,
  diffWindow,
  fit,
  gitHunks,
  indexLinesOf,
  indexRange,
  nearestTop,
  printable,
  rulerOf,
  rulerViewOf,
  sourceOfStep,
  splitLines,
  startLineOf,
  turnStepOf,
} from './turn'
import type { RulerMark } from './turn'

const PANE = 'nzt-changes'
const POLL_MS = 3000
// The card's rows besides the index and the diff: its border, heading, views, rule, file,
// detail, position line and buttons.
const CARD_ROWS = 9
const MIN_DIFF_ROWS = 3
const INDEX_ROWS = { inline: 4, dock: 8 } as const
const DOCK_COLUMNS = 58
const INLINE_ROWS = 24
const DOCK_FLOOR = 110
// The accent of NZT's mods, the one nzt-state uses: a theme key, so it follows the theme.
const ACCENT = 'claude'
const CURRENT = 'cyan'

const snapshot = atom({ plugin: 'nzt-changes', key: 'snapshot' } as const, { kind: 'idle' } as Snapshot)
const view = atom({ plugin: 'nzt-changes', key: 'view' } as const, {
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
  stepLines: [] as number[],
  diffLastTop: 0,
}

const clamp = (index: number, total: number) =>
  Number.isFinite(index) ? Math.max(0, Math.min(index, total - 1)) : 0

/**
 * The view as this version reads it. The session keeps its state across reloads, so a value
 * an older version wrote (0.1.0 had `selected` and no `mode`) arrives here too.
 */
const viewOf = (value: Partial<View> | undefined): View => ({
  mode: value?.mode === 'head' ? 'head' : 'turn',
  turnIndex: Number.isFinite(value?.turnIndex) ? value!.turnIndex! : 0,
  headIndex: Number.isFinite(value?.headIndex) ? value!.headIndex! : 0,
  diffTop: Number.isFinite(value?.diffTop) ? value!.diffTop! : 0,
  indexTop: Number.isFinite(value?.indexTop) ? value!.indexTop! : null,
  diffPath: typeof value?.diffPath === 'string' ? value.diffPath : null,
  diff: value?.diff ?? null,
})

/** The HEAD view's steps: the files in folder order. */
const headSteps = (state: Snapshot) =>
  state.kind === 'ok' ? groupsOf(state.files).flatMap(group => group.files) : []

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

/** One row of the index: a step's name, its folder in the HEAD view, its mark and counts. */
type Row = {
  name: string
  folder: string
  mark?: Mark
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
  const total = now.mode === 'turn' ? (await read($, turn)).length : headSteps(await read($, snapshot)).length
  if (total === 0) return
  const key = now.mode === 'turn' ? 'turnIndex' : 'headIndex'
  await update($, view, value => {
    const step = clamp(viewOf(value)[key] + by, total)
    const line = layout.stepLines[step] ?? 0
    // The index moves only as far as the new step needs to show.
    return { ...viewOf(value), [key]: step, diffTop: 0, indexTop: nearestTop(layout.indexFrom, line, layout.indexRows) }
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
  if (mode === 'head') await refresh($)
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
    await update($, view, value => ({ ...viewOf(value),mode }))
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
    // Claude Code docks a pane beside the transcript only in fullscreen and from 110 columns.
    const { isFullscreen, columns } = e.presentation
    if (!isFullscreen) return { text: t.paneInlineNoFullscreen }
    if (columns < DOCK_FLOOR) return { text: t.paneInlineNarrow(columns, DOCK_FLOOR) }
    return { text: t.paneOpened }
  })

  // The tree is exactly as tall as the body, so the engine has nothing to scroll: the wheel
  // moves the index when it is over the index, and the diff anywhere else, keys included.
  on('ui.scroll', { requestId: PANE }, async ($, e) => {
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
          folder: '',
          added: step.added,
          removed: step.removed,
          isBinary: false,
        }))
      : head.map(file => ({
          name: nameOf(file.path),
          folder: folderOf(file.path),
          mark: file.mark,
          added: file.added,
          removed: file.removed,
          isBinary: file.isBinary,
        }))

    const counts = (added: number, removed: number) => (
      <Text>
        <Text color="green">+{added}</Text> <Text color="red">-{removed}</Text>
      </Text>
    )

    // The index: a window of its lines, the HEAD view's steps under their folder; each step a
    // button that jumps to it, dim until the pointer or the focus is on it.
    const index: JSX.Element[] = []
    const lines = indexLinesOf(rows.map(row => row.folder))
    const range = indexRange(lines, k, INDEX_ROWS[e.props.placement], now.indexTop)
    if (total > 0) {
      if (range.above > 0) index.push(<Text key="above" dimColor>{`  ${t.above(range.above)}`}</Text>)
      for (const line of lines.slice(range.from, range.to)) {
        if (line.kind === 'folder') {
          index.push(
            <Text key={`f-${line.folder}`} dimColor wrap="truncate-start">{`  ${printable(line.folder)}/`}</Text>,
          )
          continue
        }
        const i = line.step
        const row = rows[i]!
        const isCurrent = i === k
        const tally = row.isBinary ? 'bin' : row.added === null || row.removed === null ? '·' : `+${row.added} -${row.removed}`
        const room = width - 6 - (row.mark === undefined ? 0 : 2) - tally.length - 1
        // Only the name is the button: the engine inverts a button under the pointer, and a
        // whole inverted row read as noise.
        index.push(
          <Box key={`i${i}`} flexDirection="row" justifyContent="space-between">
            <Box flexDirection="row">
              <Text color={CURRENT}>{isCurrent ? '▸ ' : '  '}</Text>
              <Text dimColor>{String(i + 1).padStart(2)}</Text>
              {row.mark !== undefined && <Text color={MARK_COLOR[row.mark]}>{` ${row.mark}`}</Text>}
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
    const height = e.props.scroll.bodyRows
    const diffRows = Math.max(MIN_DIFF_ROWS, height - CARD_ROWS - index.length)
    const indexStart = 3
    const diffStart = indexStart + index.length + (index.length > 0 ? 1 : 0) + 2
    layout = {
      index: [indexStart, indexStart + index.length],
      diff: [diffStart, diffStart + diffRows],
      indexFrom: range.from,
      indexRows: INDEX_ROWS[e.props.placement],
      indexLastTop: range.lastTop,
      stepLines: range.stepLines,
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
          <Box flexDirection="row" justifyContent="space-between">
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
      <Box marginTop={1}>
        <Text color={color} dimColor={color === undefined} wrap="wrap">{`  ${text}`}</Text>
      </Box>
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
            {detail(
              <Text dimColor>{step.tool}{step.note === undefined ? '' : ` · ${t[step.note]}`}</Text>,
              step.file,
              step.added,
              step.removed,
            )}
            {diffView(sourceOfStep(step), step.file, step.more)}
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
          {typeof shown === 'string' ? message(shown) : diffView(shown.source, file.path, shown.more)}
        </Box>
      )
    }

    return (
      <Box flexDirection="column" height={height} borderStyle="round" borderColor={ACCENT} paddingX={1}>
        <Box flexDirection="row" justifyContent="space-between">
          <Text>
            <Text backgroundColor={ACCENT} color="inverseText" bold> NZT </Text>{' '}
            <Text bold color={ACCENT}>{t.title}</Text>
          </Text>
          <Text bold>{total === 0 ? t.noSteps : t.step(k + 1, total)}</Text>
        </Box>
        <Box flexDirection="row" justifyContent="space-between">
          <Box flexDirection="row" flexShrink={0}>
            {tab('turn', t.turn, 't')}
            {tab('head', t.head, 'h')}
          </Box>
          <Box flexShrink={1} overflow="hidden">
            {summary}
          </Box>
        </Box>
        {index.length > 0 && <Box flexDirection="column">{index}</Box>}
        {index.length > 0 && <Text dimColor>{'─'.repeat(width)}</Text>}
        <Box flexDirection="column" flexGrow={1} flexShrink={1} overflow="hidden">
          {body}
        </Box>
        <Box flexDirection="row" gap={2}>
          {total > 0 && <Button key="prev" label={t.prev} hotkey="p" onPress={() => go($, -1)} />}
          {total > 0 && <Button key="next" label={t.next} hotkey="n" autoFocus onPress={() => go($, 1)} />}
          <Button key="close" label={t.close} hotkey="c" onPress={() => closePane($)} />
        </Box>
      </Box>
    )
  })
}
