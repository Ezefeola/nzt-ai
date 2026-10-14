import type { Line, TurnStep } from '../types'

/** Past this many lines on either side, a diff is everything removed then everything added. */
export const MAX_LCS_LINES = 400
/** The most diff lines a step keeps; the rest is only counted. */
export const MAX_STEP_LINES = 500

/** A text's lines, the newline that ends the last one not opening another. */
export const splitLines = (text: string | undefined) => {
  if (text === undefined || text === '') return []
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop()
  return lines
}

/** A line diff of two texts, every line kept: longest common subsequence while both are small enough. */
export const diffLines = (before: string | undefined, after: string | undefined): Line[] => {
  const a = splitLines(before)
  const b = splitLines(after)
  if (a.length > MAX_LCS_LINES || b.length > MAX_LCS_LINES) {
    return [...a.map(t => ({ op: '-' as const, t })), ...b.map(t => ({ op: '+' as const, t }))]
  }
  const n = a.length
  const m = b.length
  const dp = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  const at = (i: number, j: number) => dp[i]?.[j] ?? 0
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] = a[i] === b[j] ? at(i + 1, j + 1) + 1 : Math.max(at(i + 1, j), at(i, j + 1))
    }
  }
  const out: Line[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ op: ' ', t: a[i]! })
      i++
      j++
    } else if (at(i + 1, j) >= at(i, j + 1)) out.push({ op: '-', t: a[i++]! })
    else out.push({ op: '+', t: b[j++]! })
  }
  while (i < n) out.push({ op: '-', t: a[i++]! })
  while (j < m) out.push({ op: '+', t: b[j++]! })
  return out
}

export const countOfLines = (lines: Line[]) => ({
  added: lines.filter(line => line.op === '+').length,
  removed: lines.filter(line => line.op === '-').length,
})

// Tab and newline are the only control characters `Code` draws.
const UNDRAWABLE = /[\u0000-\u0008\u000b-\u001f\u007f]/g

const isChange = (line: Line | undefined) => line !== undefined && (line.op === '+' || line.op === '-')

const HUNK = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/

const headerOf = (oldFrom: number, oldCount: number, newFrom: number, newCount: number) =>
  // An empty side names the line before it, as git does.
  `@@ -${oldCount === 0 ? oldFrom - 1 : oldFrom},${oldCount} +${newCount === 0 ? newFrom - 1 : newFrom},${newCount} @@`

/**
 * The unified-diff hunks of a line diff, `context` lines around each change, numbered from
 * `oldStart` and `newStart`. A `~` line is a gap of unknown size: no hunk spans it. A diff
 * with no change has no hunk.
 */
export const hunksOf = (lines: Line[], oldStart = 1, newStart = 1, context = 1): string => {
  let o = oldStart
  let n = newStart
  const numbered = lines.map(line => {
    const at = { line, o, n }
    if (line.op === ' ') {
      o++
      n++
    } else if (line.op === '-') o++
    else if (line.op === '+') n++
    return at
  })
  const isNear = (k: number) => {
    if (lines[k]?.op === '~') return false
    if (isChange(lines[k])) return true
    for (const step of [-1, 1]) {
      for (let d = 1; d <= context; d++) {
        const other = lines[k + step * d]
        if (other === undefined || other.op === '~') break
        if (isChange(other)) return true
      }
    }
    return false
  }
  const hunks: (typeof numbered)[] = []
  let current: typeof numbered = []
  numbered.forEach((entry, k) => {
    if (isNear(k)) current.push(entry)
    else if (current.length > 0) {
      hunks.push(current)
      current = []
    }
  })
  if (current.length > 0) hunks.push(current)
  return hunks
    .map(hunk => {
      const first = hunk[0]!
      const oldCount = hunk.filter(entry => entry.line.op !== '+').length
      const newCount = hunk.filter(entry => entry.line.op !== '-').length
      const body = hunk.map(({ line }) => `${line.op}${line.t.replace(UNDRAWABLE, '?')}`)
      return [headerOf(first.o, oldCount, first.n, newCount), ...body].join('\n')
    })
    .join('\n')
}

/** The hunks git printed, rebuilt with one line of context around each change. */
export const gitHunks = (source: string): string => {
  const hunks: { oldStart: number; newStart: number; lines: Line[] }[] = []
  for (const raw of source.split('\n')) {
    const header = HUNK.exec(raw)
    if (header !== null) {
      const [, a, b, c, d] = header
      hunks.push({
        oldStart: b === '0' ? Number(a) + 1 : Number(a),
        newStart: d === '0' ? Number(c) + 1 : Number(c),
        lines: [],
      })
      continue
    }
    const hunk = hunks[hunks.length - 1]
    if (hunk === undefined || raw.startsWith('\\')) continue
    const op = raw[0] === '+' || raw[0] === '-' ? raw[0] : ' '
    hunk.lines.push({ op, t: raw.slice(1) })
  }
  return hunks
    .map(hunk => hunksOf(hunk.lines, hunk.oldStart, hunk.newStart))
    .filter(text => text !== '')
    .join('\n')
}

/**
 * The first `limit` diff lines of some hunks and how many were left out. The last hunk kept
 * gets its header recounted, since a hunk whose header promises more lines does not parse.
 */
export const hunksWithin = (source: string, limit: number) => {
  if (source === '') return { source, hidden: 0 }
  const lines = source.split('\n')
  const total = lines.filter(line => !HUNK.test(line)).length
  if (total <= limit) return { source, hidden: 0 }
  const kept: string[] = []
  let shown = 0
  for (const line of lines) {
    const isHeader = HUNK.test(line)
    if (!isHeader && shown === limit) break
    kept.push(line)
    if (!isHeader) shown++
  }
  if (HUNK.test(kept[kept.length - 1] ?? '')) kept.pop()
  const header = kept.map(line => HUNK.test(line)).lastIndexOf(true)
  if (header >= 0) {
    const body = kept.slice(header + 1)
    const [, a, b, c, d] = HUNK.exec(kept[header]!)!
    const oldCount = body.filter(line => !line.startsWith('+')).length
    const newCount = body.filter(line => !line.startsWith('-')).length
    const oldFrom = b === '0' ? Number(a) + 1 : Number(a)
    const newFrom = d === '0' ? Number(c) + 1 : Number(c)
    kept[header] = headerOf(oldFrom, oldCount, newFrom, newCount)
  }
  return { source: kept.join('\n'), hidden: total - shown }
}

/**
 * The line of `text` where `fragment` starts, 1-based; 1 when the fragment is empty or not in
 * the text.
 */
export const startLineOf = (text: string | undefined, fragment: string) => {
  if (text === undefined || fragment === '') return 1
  const normal = text.replace(/\r\n?/g, '\n')
  const at = normal.indexOf(fragment.replace(/\r\n?/g, '\n'))
  return at < 0 ? 1 : normal.slice(0, at).split('\n').length
}

/** A step of the turn as hunks numbered from `start`, capped, its counts taken before the cap. */
export const turnStepOf = (
  tool: TurnStep['tool'],
  file: string,
  lines: Line[],
  note?: TurnStep['note'],
  start = 1,
): TurnStep => {
  const { added, removed } = countOfLines(lines)
  const capped = hunksWithin(hunksOf(lines, start, start), MAX_STEP_LINES)
  return {
    tool,
    file,
    ...(note === undefined ? {} : { note }),
    source: capped.source,
    more: capped.hidden,
    added,
    removed,
  }
}

/**
 * A step's hunks. The session keeps its state across reloads, and 0.2.0 kept trimmed lines
 * instead of hunks: those are numbered from 1.
 */
export const sourceOfStep = (step: TurnStep & { lines?: Line[] }) =>
  typeof step.source === 'string' ? step.source : hunksOf(step.lines ?? [])

/** Tab and the other control characters a `Text` refuses, made visible as spaces or `?`. */
export const printable = (text: string) =>
  text.replace(/\t/g, '  ').replace(/[\u0000-\u001f\u007f]/g, '?')

/** One line of some hunks, with the numbers it has in the old and the new file and its hunk. */
type Entry = { op: '+' | '-' | ' '; t: string; o: number; n: number; hunk: number }

/** The lines of some unified-diff hunks, numbered. */
export const entriesOf = (source: string): Entry[] => {
  const out: Entry[] = []
  let o = 0
  let n = 0
  let hunk = -1
  for (const raw of source.split('\n')) {
    const header = HUNK.exec(raw)
    if (header !== null) {
      const [, a, b, c, d] = header
      o = b === '0' ? Number(a) + 1 : Number(a)
      n = d === '0' ? Number(c) + 1 : Number(c)
      hunk++
      continue
    }
    if (hunk < 0 || raw === '') continue
    const op = raw[0] === '+' || raw[0] === '-' ? raw[0] : ' '
    out.push({ op, t: raw.slice(1), o, n, hunk })
    if (op !== '+') o++
    if (op !== '-') n++
  }
  return out
}

/** Entries back to hunks: a run from one original hunk is one hunk, its header recounted. */
const sourceOfEntries = (entries: Entry[]) => {
  const runs: Entry[][] = []
  for (const entry of entries) {
    const run = runs[runs.length - 1]
    if (run !== undefined && run[0]!.hunk === entry.hunk) run.push(entry)
    else runs.push([entry])
  }
  return runs
    .map(run => {
      const first = run[0]!
      const oldCount = run.filter(entry => entry.op !== '+').length
      const newCount = run.filter(entry => entry.op !== '-').length
      return [headerOf(first.o, oldCount, first.n, newCount), ...run.map(entry => `${entry.op}${entry.t}`)].join('\n')
    })
    .join('\n')
}

/**
 * The rows an entry takes in `Code` at `columns` cells: its text wraps under a gutter of the
 * widest line number, a space, the marker and a space. The first entry of a hunk after another
 * adds the row `Code` leaves between hunks.
 */
const rowsOfEntries = (entries: Entry[], columns: number) => {
  const widest = entries.reduce((max, entry) => Math.max(max, entry.o, entry.n), 1)
  const room = Math.max(8, columns - String(widest).length - 3)
  return entries.map((entry, k) => {
    const cells = entry.t.replace(/\t/g, '    ').length
    const gap = k > 0 && entries[k - 1]!.hunk !== entry.hunk ? 1 : 0
    return Math.max(1, Math.ceil(cells / room)) + gap
  })
}

/**
 * The part of some hunks a window of `rows` rows shows from line `top`, clamped so the window
 * never runs past the end: the hunks to draw, the first line shown, how many, of how many.
 */
export const diffWindow = (source: string, top: number, rows: number, columns: number) => {
  const entries = entriesOf(source)
  const sizes = rowsOfEntries(entries, columns)
  let last = entries.length
  for (let used = 0; last > 0 && used + sizes[last - 1]! <= rows; last--) used += sizes[last - 1]!
  const first = Math.max(0, Math.min(Number.isFinite(top) ? Math.floor(top) : 0, last))
  let count = 0
  for (let used = 0; first + count < entries.length && used + sizes[first + count]! <= rows; count++) {
    used += sizes[first + count]!
  }
  const shown = entries.slice(first, first + Math.max(1, count))
  return { source: sourceOfEntries(shown), first, count: shown.length, total: entries.length, lastTop: last }
}

/** What a cell of the change ruler stands for: added lines, removed ones, both, or neither. */
export type RulerMark = 'add' | 'rm' | 'both' | ''

/** The change ruler: `cells` cells, each the marks of an equal share of the diff's lines. */
export const rulerOf = (source: string, cells: number): RulerMark[] => {
  const entries = entriesOf(source)
  return Array.from({ length: Math.max(0, cells) }, (_, i) => {
    const from = Math.floor((i * entries.length) / cells)
    const to = Math.max(from + 1, Math.floor(((i + 1) * entries.length) / cells))
    const ops = new Set(entries.slice(from, to).map(entry => entry.op))
    return ops.has('+') && ops.has('-') ? 'both' : ops.has('+') ? 'add' : ops.has('-') ? 'rm' : ''
  })
}

/** The cells of a ruler of `cells` cells that stand for lines `first` to `first + count - 1` of `total`. */
export const rulerViewOf = (total: number, cells: number, first: number, count: number) => {
  const at = (line: number) => Math.floor((line * cells) / Math.max(1, total))
  return { from: at(first), to: Math.max(at(first), at(first + count - 1)) }
}

/** One line of the index: a folder's title, or a step. */
export type IndexLine = { kind: 'folder'; folder: string } | { kind: 'step'; step: number }

/** The index's lines: each step, under its folder's title when the folder changes. */
export const indexLinesOf = (folders: string[]): IndexLine[] =>
  folders.flatMap((folder, step): IndexLine[] =>
    folder !== '' && folders[step - 1] !== folder
      ? [{ kind: 'folder', folder }, { kind: 'step', step }]
      : [{ kind: 'step', step }],
  )

/** The first line of a window of `rows` lines moved as little as it takes for `line` to show. */
export const nearestTop = (top: number, line: number, rows: number) =>
  line < top ? line : line >= top + rows ? line - rows + 1 : top

/**
 * Which index lines show in `rows` rows: from `top` once set (the person's scroll, or where a
 * step change left it), else from the top with the current step in view. Counts the steps
 * left above and below.
 */
export const indexRange = (lines: IndexLine[], current: number, rows: number, top: number | null) => {
  const lastTop = Math.max(0, lines.length - rows)
  const at = lines.findIndex(line => line.kind === 'step' && line.step === current)
  const wanted = top ?? nearestTop(0, Math.max(0, at), rows)
  const from = Math.max(0, Math.min(wanted, lastTop))
  const to = Math.min(lines.length, from + rows)
  const steps = (part: IndexLine[]) => part.filter(line => line.kind === 'step').length
  const stepLines = lines.flatMap((line, k) => (line.kind === 'step' ? [k] : []))
  return { from, to, lastTop, above: steps(lines.slice(0, from)), below: steps(lines.slice(to)), stepLines }
}

/** A text cut to `cells` cells, the cut marked with `…`. */
export const fit = (text: string, cells: number) =>
  text.length <= cells ? text : `${text.slice(0, Math.max(0, cells - 1))}…`
