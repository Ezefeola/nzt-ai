import type { Level, Reading } from '../types'

/** The marks the bar carries, in percent; each one opens the level named beside it. */
export const MARKS = [
  { at: 20, level: 'warn' },
  { at: 30, level: 'high' },
  { at: 40, level: 'critical' },
] as const satisfies readonly { at: number; level: Level }[]

const RANK: Record<Level, number> = { low: 0, warn: 1, high: 2, critical: 3 }

export const levelOf = (percent: number): Level =>
  MARKS.reduce<Level>((level, mark) => (percent >= mark.at ? mark.level : level), 'low')

export const isAbove = (level: Level, than: Level | null): boolean =>
  than === null || RANK[level] > RANK[than]

/** The engine's figures as a reading; a fill it has not reported is no reading, never 0%. */
export const readingOf = (context: { tokens?: number; window: number; percent?: number }): Reading =>
  context.percent === undefined || context.tokens === undefined || !(context.window > 0)
    ? { kind: 'none' }
    : { kind: 'ok', percent: context.percent, tokens: context.tokens, window: context.window }

/** Tokens in thousands below a million, in millions from there: 34k, 412k, 1M, 1.5M. */
export const abbreviate = (tokens: number): string => {
  if (tokens >= 1_000_000) {
    const millions = Math.round(tokens / 100_000) / 10
    return `${millions}M`
  }
  return `${Math.round(tokens / 1000)}k`
}

/**
 * One cell of the bar: filled, the rail not yet filled (tinted by the stretch it lies in,
 * `low` outside the 20–40 zone), or one of the marks, lit once the fill reaches it.
 */
export type Cell =
  | { kind: 'fill' }
  | { kind: 'rail'; zone: Level }
  | { kind: 'mark'; level: Level; at: number; isLit: boolean }

/** The column of the bar each mark sits in, for a bar `width` cells wide. */
export const markColumnsOf = (width: number): { at: number; level: Level; column: number }[] =>
  MARKS.map(mark => ({ ...mark, column: Math.min(width - 1, Math.round((width * mark.at) / 100)) }))

export const filledOf = (percent: number, width: number): number =>
  Math.round((width * Math.min(100, Math.max(0, percent))) / 100)

export const cellsOf = (percent: number, width: number): Cell[] => {
  const filled = filledOf(percent, width)
  const marks = markColumnsOf(width)
  const [warn, high, critical] = marks.map(m => m.column) as [number, number, number]
  return Array.from({ length: width }, (_, column): Cell => {
    const mark = marks.find(m => m.column === column)
    if (mark !== undefined) return { kind: 'mark', level: mark.level, at: mark.at, isLit: percent >= mark.at }
    if (column < filled) return { kind: 'fill' }
    const zone: Level = column > warn && column < high ? 'warn' : column > high && column < critical ? 'high' : 'low'
    return { kind: 'rail', zone }
  })
}

/** The row under the bar: each mark's number centred under its column, blanks elsewhere. */
export const scaleOf = (width: number): { text: string; level: Level; at: number }[] => {
  const pieces: { text: string; level: Level; at: number }[] = []
  let cursor = 0
  for (const mark of markColumnsOf(width)) {
    const label = `${mark.at}`
    const start = Math.max(cursor, mark.column - Math.floor((label.length - 1) / 2))
    pieces.push({ text: ' '.repeat(start - cursor) + label, level: mark.level, at: mark.at })
    cursor = start + label.length
  }
  return pieces
}

/**
 * What fits beside the bar in `columns` cells: the label goes first, then the tokens; the
 * percentage and the marks always stay.
 */
export const layoutOf = (
  columns: number,
  parts: { label: string; percent: string; tokens: string },
): { label: boolean; tokens: boolean; width: number } => {
  const MIN_BAR = 20
  const widthWith = (label: boolean, tokens: boolean) =>
    columns -
    (label ? parts.label.length + 1 : 0) -
    (1 + parts.percent.length) -
    (tokens ? parts.tokens.length + 1 : 0)
  if (widthWith(true, true) >= MIN_BAR) return { label: true, tokens: true, width: widthWith(true, true) }
  if (widthWith(false, true) >= MIN_BAR) return { label: false, tokens: true, width: widthWith(false, true) }
  return { label: false, tokens: false, width: Math.max(10, widthWith(false, false)) }
}

const ZONE: Record<Level, string> = {
  low: 'under 20%, no action',
  warn: '20%+, recommend clearing',
  high: '30%+, say it plainly',
  critical: '40%+, recommend strongly',
}

/** The line the model reads: the host's context signal the kernel asks it to report from. */
export const modelLineOf = (reading: Reading): string =>
  reading.kind === 'none'
    ? '[nzt-context] Context used: no reading yet.'
    : `[nzt-context] Context used: ${reading.percent}% (${abbreviate(reading.tokens)} of ${abbreviate(reading.window)} tokens), ${ZONE[levelOf(reading.percent)]}.`

/** The notice a turn's next tool result carries when the fill crossed a mark mid-turn. */
export const crossingLineOf = (reading: Reading & { kind: 'ok' }): string =>
  `[nzt-context] Context crossed a mark: now ${reading.percent}% (${abbreviate(reading.tokens)} of ${abbreviate(reading.window)} tokens), ${ZONE[levelOf(reading.percent)]}.`
