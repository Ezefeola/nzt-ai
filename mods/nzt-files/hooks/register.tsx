import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Explorer, Listing, Mark, Marks, Opened } from '../types'
import { langOf, TEXTS } from './i18n'
import type { Texts } from './i18n'
import { isPictureFile, kindOf } from './kinds'
import {
  contentOf,
  fit,
  isBinaryText,
  marksOf,
  nameOf,
  printable,
  rowsOf,
  textWindow,
  treeWindow,
} from './tree'

const PANE = 'nzt-files'
const POLL_MS = 3000
// The card's rows besides the tree and the file: its border, heading, rule, path, detail,
// position line and button.
const CARD_ROWS = 8
const MIN_VIEW_ROWS = 3
const TREE_ROWS = { inline: 7, dock: 15 } as const
const DOCK_COLUMNS = 58
const INLINE_ROWS = 24
const DOCK_FLOOR = 110
// What one $.fs.read copies at most; a larger file rejects.
const READ_LIMIT = 4 * 1024 * 1024
// The accent of NZT's mods, the one nzt-state uses: a theme key, so it follows the theme.
const ACCENT = 'claude'
const CURRENT = 'cyan'
const CHOSEN_BG = '#263a42'

const MARK_COLOR = { M: 'yellow', U: 'green', A: 'green', D: 'red' } as const satisfies Record<Mark, string>

const listings = atom({ plugin: 'nzt-files', key: 'listings' } as const, {} as Record<string, Listing>)
const marks = atom({ plugin: 'nzt-files', key: 'marks' } as const, { kind: 'idle' } as Marks)
const explorer = atom({ plugin: 'nzt-files', key: 'explorer' } as const, {
  open: [],
  selected: null,
  treeTop: null,
  viewTop: 0,
  opened: null,
} as Explorer)

// Module state a reload starts over: the project's folder, the chosen file's lines, and
// whether the pane is showing.
let root: string | undefined
let content: { path: string; mtimeMs: number; lines: string[] } | undefined
let isShowing = false
let running: Promise<void> | undefined
let isAgain = false
let t: Texts = TEXTS.es
// Where the last drawing put the tree and the file, in body rows, and how far each scrolls:
// a wheel tick is told apart by the row under the pointer.
let layout = { tree: [0, 0], treeFrom: 0, treeLastTop: 0, viewLastTop: 0 }

/** The explorer as this version reads it, whatever an older one left in the session. */
const explorerOf = (value: Partial<Explorer> | undefined): Explorer => ({
  open: Array.isArray(value?.open) ? value.open.filter(path => typeof path === 'string') : [],
  selected: typeof value?.selected === 'string' ? value.selected : null,
  treeTop: Number.isFinite(value?.treeTop) ? value!.treeTop! : null,
  viewTop: Number.isFinite(value?.viewTop) ? value!.viewTop! : 0,
  opened: value?.opened ?? null,
})

const reasonOf = (error: unknown) => (error instanceof Error ? error.message : String(error))

/** A file's kind as the detail line names it, or undefined with no extension. */
const kindLabel = (path: string) => {
  const kind = kindOf(path)
  if (kind === undefined) return undefined
  return kind.kind === 'named' ? kind.name : kind.kind === 'image' ? t.image(kind.format) : t.text
}

// The engine follows $ only into functions declared in this file, so everything that reads
// the disk or runs git lives here; what they return is shaped in ./tree.

function pathOf(relative: string) {
  return relative === '' ? root! : `${root}/${relative}`
}

async function rootOf($: EngineInterface) {
  if (root === undefined) root = (await $.session.root()).replace(/\\/g, '/').replace(/\/$/, '')
  return root
}

async function listFolder($: EngineInterface, folder: string, files: Record<string, Mark>): Promise<Listing> {
  try {
    const entries = await $.fs.list(pathOf(folder))
    return { kind: 'ok', entries: entries.map(entry => ({ name: entry.name, isDir: entry.kind === 'dir' })) }
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
  try {
    const top = await $.process.run(['git', 'rev-parse', '--show-prefix'], { cwd: root })
    if (top.exitCode !== 0) return { kind: 'norepo' }
    const status = await $.process.run(['git', 'status', '--porcelain=v1', '-z', '--untracked-files=all'], {
      cwd: root,
    })
    if (status.exitCode !== 0) return { kind: 'norepo' }
    return { kind: 'ok', files: marksOf(status.stdout, top.stdout.trim()) }
  } catch {
    return { kind: 'norepo' }
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

/** Opens a closed folder or closes an open one; the tree stays where it is. */
async function toggle($: EngineInterface, folder: string) {
  const now = explorerOf(await read($, explorer))
  const isOpen = now.open.includes(folder)
  await update($, explorer, value => {
    const own = explorerOf(value)
    const open = isOpen ? own.open.filter(path => path !== folder) : [...own.open, folder]
    return { ...own, open, treeTop: layout.treeFrom }
  })
  if (isOpen) return
  const files = await read($, marks)
  const listing = await listFolder($, folder, files.kind === 'ok' ? files.files : {})
  await update($, listings, value => ({ ...value, [folder]: listing }))
}

/** Shows a file in the viewer from its first line; the tree stays where it is. */
async function choose($: EngineInterface, path: string) {
  const loading: Opened = { kind: 'loading' }
  await update($, explorer, value => ({
    ...explorerOf(value),
    selected: path,
    viewTop: 0,
    treeTop: layout.treeFrom,
    opened: loading,
  }))
  await loadFile($, path, true)
}

/** Moves the file's window by `by` lines, within what the last drawing allowed. */
async function scrollView($: EngineInterface, by: number) {
  await update($, explorer, value => {
    const now = explorerOf(value)
    return { ...now, viewTop: Math.max(0, Math.min(now.viewTop + by, layout.viewLastTop)) }
  })
}

async function closePane($: EngineInterface) {
  isShowing = false
  await $.ui.close({ id: PANE }).catch(() => undefined)
}

export const register: Register = (on, options) => {
  t = TEXTS[langOf(options.language)]

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'nzt-files', description: t.commandDescription })
    $.clock.every(POLL_MS, () => {
      if (isShowing) void refresh($)
    })

    return next(e)
  })

  on('command.run', { command: 'nzt-files' }, async ($, e) => {
    if (isShowing) {
      await closePane($)
      return { text: t.paneClosed }
    }
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
  // moves the tree when it is over the tree, and the file anywhere else, keys included.
  on('ui.scroll', { requestId: PANE }, async ($, e) => {
    const row = e.pointer?.row
    const isTree = row !== undefined && row >= layout.tree[0]! && row < layout.tree[1]!
    if (!isTree) await scrollView($, e.by)
    else {
      await update($, explorer, value => {
        const now = explorerOf(value)
        const top = (now.treeTop ?? layout.treeFrom) + e.by
        return { ...now, treeTop: Math.max(0, Math.min(top, layout.treeLastTop)) }
      })
    }
    return {}
  })

  on('ui.close', async ($, e, next) => {
    if (e.id === PANE) isShowing = false
    return next(e)
  })

  // A file Claude writes, or a command that may have, shows at once instead of on the next poll.
  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    const isWrite = e.tool === 'Write' || e.tool === 'Edit' || e.tool === 'NotebookEdit' || e.tool === 'Bash'
    if (isShowing && isWrite) await refresh($)

    return ran
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    isShowing = true
    const { Box, Text, Button, Code } = $.ui.resolve(e)
    const now = explorerOf(await read($, explorer))
    const known = await read($, listings)
    const git = await read($, marks)
    const files = git.kind === 'ok' ? git.files : {}
    // Inside the card's border and padding.
    const width = Math.max(30, e.props.bodyColumns - 4)
    const height = e.props.scroll.bodyRows
    const treeRows = Math.min(TREE_ROWS[e.props.placement], Math.max(3, height - CARD_ROWS - MIN_VIEW_ROWS))
    const viewRows = Math.max(MIN_VIEW_ROWS, height - CARD_ROWS - treeRows)

    const message = (text: string, color?: string) => (
      <Text key={text} color={color} dimColor={color === undefined} wrap="wrap">{`  ${text}`}</Text>
    )

    const changed = Object.keys(files).length
    const heading = (
      <Box flexDirection="row" justifyContent="space-between">
        <Text>
          <Text backgroundColor={ACCENT} color="inverseText" bold> NZT </Text>{' '}
          <Text bold color={ACCENT}>{t.title}</Text>
        </Text>
        <Box flexShrink={1} overflow="hidden">
          <Text dimColor wrap="truncate-end">
            {root === undefined ? '' : nameOf(root)}
            {git.kind === 'norepo' ? ` · ${t.noGit}` : ''}
            {changed > 0 ? <Text color="yellow">{' · ●'}</Text> : ''}
            {changed > 0 ? ` ${t.changed(changed)}` : ''}
          </Text>
        </Box>
      </Box>
    )
    const buttons = (
      <Box flexDirection="row" gap={2}>
        <Button key="close" label={t.close} hotkey="c" onPress={() => closePane($)} />
      </Box>
    )

    if (known[''] === undefined) {
      void refresh($)
      return (
        <Box flexDirection="column" height={height} borderStyle="round" borderColor={ACCENT} paddingX={1}>
          {heading}
          <Box flexDirection="column" flexGrow={1}>
            {message(t.reading)}
          </Box>
          {buttons}
        </Box>
      )
    }

    // The tree: a window of its rows; a folder's name opens or closes it, a file's shows it.
    const rows = rowsOf(known, now.open, files)
    const chosen = rows.findIndex(row => row.kind === 'entry' && row.path === now.selected)
    const shown = treeWindow(rows.length, treeRows, now.treeTop, chosen)
    layout = { tree: [2, 2 + treeRows], treeFrom: shown.from, treeLastTop: shown.lastTop, viewLastTop: 0 }
    const tree: JSX.Element[] = []
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
      const isChosen = row.path === now.selected
      const label = printable(row.name) + (row.isDir ? '/' : '')
      const room = width - indent.length - 2 - 2
      // Only the name is the button: the engine inverts a button under the pointer, and a
      // whole inverted row read as noise.
      tree.push(
        <Box
          key={`r:${row.path}`}
          flexDirection="row"
          justifyContent="space-between"
          backgroundColor={isChosen ? CHOSEN_BG : undefined}
        >
          <Box flexDirection="row">
            <Text dimColor>{`${indent}${row.isDir ? (row.isOpen ? '▾ ' : '▸ ') : '  '}`}</Text>
            <Button
              key={`n:${row.path}`}
              plain
              onPress={() => (row.isDir ? toggle($, row.path) : choose($, row.path))}
            >
              <Text
                bold={row.isDir || isChosen}
                color={isChosen ? CURRENT : row.isDeleted ? 'red' : undefined}
                strikethrough={row.isDeleted}
              >
                {fit(label, room)}
              </Text>
            </Button>
          </Box>
          {row.mark !== undefined && <Text color={MARK_COLOR[row.mark]}>{row.isDir ? '●' : row.mark}</Text>}
        </Box>,
      )
    }

    // The chosen file: its path, its detail line and its lines, or the line that stands in for them.
    const path = now.selected
    const opened = now.opened
    let detail: JSX.Element | null = null
    let body: JSX.Element
    let position: string | null = null
    let isScrollable = false
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
        if (lines.length === 0) body = message(t.empty)
        else {
          const view = textWindow(lines, now.viewTop, viewRows, width)
          layout.viewLastTop = view.lastTop
          const fits = view.count === view.total
          isScrollable = !fits
          position = fits
            ? t.allLines(view.total)
            : t.lines(view.first + 1, view.first + view.count, view.total, opened.shown < opened.lines)
          body = (
            <Box height={viewRows} overflow="hidden">
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

    return (
      <Box flexDirection="column" height={height} borderStyle="round" borderColor={ACCENT} paddingX={1}>
        {heading}
        <Box flexDirection="column" height={treeRows} overflow="hidden">
          {tree}
        </Box>
        <Text dimColor>{'─'.repeat(width)}</Text>
        <Text bold color={CURRENT} wrap="truncate-start">{path === null ? ' ' : printable(path)}</Text>
        {detail ?? <Text> </Text>}
        <Box flexDirection="column" flexGrow={1} flexShrink={1} overflow="hidden">
          {body}
        </Box>
        <Box flexDirection="row" justifyContent="space-between">
          <Text dimColor wrap="truncate-end">{position ?? ' '}</Text>
          {isScrollable && (
            <Box flexDirection="row" gap={1} flexShrink={0}>
              <Button key="up" plain hotkey="k" onPress={() => scrollView($, -1)}>
                k ▲
              </Button>
              <Button key="down" plain hotkey="j" onPress={() => scrollView($, 1)}>
                j ▼
              </Button>
            </Box>
          )}
        </Box>
        {buttons}
      </Box>
    )
  })
}
