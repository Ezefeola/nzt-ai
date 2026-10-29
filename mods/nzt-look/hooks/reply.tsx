import type { Elements } from 'claude-code'

import type { Palette, Part } from '../types'
import { contrastOf, MIN_CONTRAST, mix } from './contrast'
import type { Texts } from './i18n'
import { plainOf } from './markdown'
import type { CalloutKind, Segment } from './markdown'

/** Past this many rows a table folds, with `▾ N más`. */
export const TABLE_FOLD = 14

export type ReplyElements = Pick<Elements['terminal'], 'Box' | 'Text' | 'Button' | 'Markdown'>

/** What drawing a reply needs beyond its segments: the look, the room, and the person's folds. */
export type ReplyContext = {
  palette: Palette
  t: Texts
  surface: 'terminal' | 'desktop'
  columns: number
  parts: Record<Part, boolean>
  canFold: boolean
  keyOf: (index: number) => string
  isUnfolded: (index: number) => boolean
  onToggle: (index: number) => void
  onCopy: (text: string) => void
  /** The drawers later parts add: code, math and diagrams; null hands the block back to prose. */
  drawCode?: (segment: Segment & { kind: 'code' }, index: number) => unknown | null
  drawMath?: (segment: Segment & { kind: 'math' }, index: number) => unknown | null
  drawMermaid?: (segment: Segment & { kind: 'mermaid' }, index: number) => unknown | null
}

const width = (text: string) => [...text].length

const pad = (text: string, size: number, align: 'left' | 'right' | 'center') => {
  const room = Math.max(0, size - width(text))
  if (align === 'right') return ' '.repeat(room) + text
  if (align === 'center') return ' '.repeat(Math.floor(room / 2)) + text + ' '.repeat(Math.ceil(room / 2))
  return text + ' '.repeat(room)
}

/** Below this many cells a column stops being readable, and the table goes back to Claude Code. */
export const MIN_COLUMN = 6

/**
 * Column widths that fit the room: the widest columns give up cells first, none under the
 * minimum; null when even that does not fit.
 */
export const fitColumns = (sizes: readonly number[], room: number): number[] | null => {
  const available = room - (3 * (sizes.length - 1) + 2)
  const fitted = [...sizes]
  let total = fitted.reduce((sum, size) => sum + size, 0)
  if (total <= available) return fitted
  if (sizes.reduce((sum, size) => sum + Math.min(size, MIN_COLUMN), 0) > available) return null
  while (total > available) {
    const widest = fitted.indexOf(Math.max(...fitted))
    fitted[widest]!--
    total--
  }
  return fitted
}

/** A cell's text in lines of at most `size` cells, broken between words unless one alone is wider. */
export const wrapCell = (text: string, size: number): string[] => {
  const lines: string[] = []
  let current = ''
  for (const word of text.split(/\s+/).filter(Boolean)) {
    let rest = word
    while (width(rest) > size) {
      if (current !== '') lines.push(current)
      current = ''
      lines.push([...rest].slice(0, size).join(''))
      rest = [...rest].slice(size).join('')
    }
    if (rest === '') continue
    if (current === '') current = rest
    else if (width(current) + 1 + width(rest) <= size) current = `${current} ${rest}`
    else {
      lines.push(current)
      current = rest
    }
  }
  if (current !== '' || lines.length === 0) lines.push(current)
  return lines
}

/** Past this many characters a column asks for no more of the row: a long cell wraps instead. */
const WIDEST_SHARE = 40

/**
 * Each column's share of the row, in whole percent, from the longest text it holds: a short
 * column keeps its words on one line, a long one takes what is left and wraps. Whole, because
 * the desktop refuses a width like `31.6%` and the whole table falls back to Claude Code's.
 */
export const sharesOf = (sizes: readonly number[]): number[] => {
  const asked = sizes.map(size => Math.min(Math.max(size, MIN_COLUMN), WIDEST_SHARE))
  const total = asked.reduce((sum, size) => sum + size, 0)
  return asked.map(size => Math.round((size / total) * 100))
}

const JUSTIFY = { left: 'flex-start', right: 'flex-end', center: 'center' } as const

/** How far the desktop header band moves from the surface towards the accent, at most. */
export const BAND_TINT = 0.18

/**
 * The desktop header band: the theme's surface tinted with its accent, so no theme needs a new
 * key. A theme whose accent sits close to its text gets less tint, down to what keeps the
 * header's text readable; at none it is the surface, which every theme already reads on.
 */
export const bandOf = (palette: Palette): string => {
  for (let tint = BAND_TINT; tint > 0; tint -= 0.02) {
    const band = mix(palette.surface, palette.user, tint)
    if (contrastOf(palette.fg, band) >= MIN_CONTRAST) return band
  }
  return palette.surface
}

/**
 * The table on the desktop: a grid of boxes, each cell in its column's share of the row and its
 * text wrapping inside it. A proportional font does not line up padded text, and a row that
 * wraps as one line breaks its columns apart. The header sits on its own band with the copy
 * button at its end; `zebra` alone is too close to `surface` to tell the rows apart, so each row
 * also gets room above and below.
 */
const drawDesktopTable = ({ Box, Text, Button }: ReplyElements, segment: Segment & { kind: 'table' }, index: number, ctx: ReplyContext) => {
  const { palette, t } = ctx
  const header = segment.header.map(plainOf)
  const rows = segment.rows.map(row => header.map((_, i) => plainOf(row[i] ?? '')))
  const shares = sharesOf(header.map((cell, i) => Math.max(width(cell), ...rows.map(row => width(row[i]!)))))
  const isFolded = ctx.canFold && rows.length > TABLE_FOLD && !ctx.isUnfolded(index)
  const shown = isFolded ? rows.slice(0, TABLE_FOLD) : rows
  const canFoldThis = ctx.canFold && rows.length > TABLE_FOLD
  const copy = ctx.parts.copy && <Button key={`${ctx.keyOf(index)}:copy`} plain label={t.copy} onPress={() => ctx.onCopy(segment.source)} />
  const row = (cells: string[], background: string, isHeader: boolean) => (
    <Box flexDirection="row" backgroundColor={background}>
      {cells.map((cell, i) => (
        <Box
          width={`${shares[i]}%`}
          flexShrink={1}
          minWidth={0}
          paddingX="md"
          paddingY="sm"
          flexDirection="row"
          columnGap="sm"
          alignItems="center"
          justifyContent={isHeader && copy && i === cells.length - 1 ? 'space-between' : JUSTIFY[segment.align[i] ?? 'left']}
        >
          <Text color={palette.fg} bold={isHeader} wrap="wrap">
            {cell}
          </Text>
          {isHeader && i === cells.length - 1 && copy}
        </Box>
      ))}
    </Box>
  )
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={palette.zebra} overflow="hidden">
      {row(header, bandOf(palette), true)}
      {shown.map((cells, i) => row(cells, i % 2 === 1 ? palette.zebra : palette.surface, false))}
      {canFoldThis && (
        <Box flexDirection="row" columnGap={2} paddingX="md">
          {isFolded && <Button key={`${ctx.keyOf(index)}:more`} plain label={t.more(rows.length - TABLE_FOLD)} onPress={() => ctx.onToggle(index)} />}
          {!isFolded && <Button key={`${ctx.keyOf(index)}:less`} plain label={t.less} onPress={() => ctx.onToggle(index)} />}
        </Box>
      )}
    </Box>
  )
}

/** A table as a grid with a header band and zebra rows; null when it does not fit the room. */
export const drawTable = (elements: ReplyElements, segment: Segment & { kind: 'table' }, index: number, ctx: ReplyContext) => {
  if (ctx.surface === 'desktop') return drawDesktopTable(elements, segment, index, ctx)
  const { Box, Text, Button } = elements
  const { palette, t } = ctx
  const header = segment.header.map(plainOf)
  const rows = segment.rows.map(row => header.map((_, i) => plainOf(row[i] ?? '')))
  const sizes = fitColumns(
    header.map((cell, i) => Math.max(width(cell), ...rows.map(row => width(row[i]!)))),
    ctx.columns,
  )
  if (sizes === null) return null
  const isFolded = ctx.canFold && rows.length > TABLE_FOLD && !ctx.isUnfolded(index)
  const shown = isFolded ? rows.slice(0, TABLE_FOLD) : rows
  // A row whose cells wrap takes as many lines as its tallest cell; the others are padded below.
  const lines = (cells: string[]) => {
    const wrapped = cells.map((cell, i) => wrapCell(cell, sizes[i]!))
    const height = Math.max(...wrapped.map(cell => cell.length))
    return Array.from(
      { length: height },
      (_, line) => ` ${wrapped.map((cell, i) => pad(cell[line] ?? '', sizes[i]!, segment.align[i] ?? 'left')).join(' │ ')} `,
    )
  }
  return (
    <Box flexDirection="column" borderStyle={ctx.surface === 'desktop' ? 'round' : undefined} borderColor={palette.muted}>
      {lines(header).map(text => (
        <Text color={palette.user} backgroundColor={palette.surface} bold>
          {text}
        </Text>
      ))}
      {shown.flatMap((row, i) =>
        lines(row).map(text => (
          <Text color={palette.fg} backgroundColor={i % 2 === 1 ? palette.zebra : palette.surface}>
            {text}
          </Text>
        )),
      )}
      <Box flexDirection="row" columnGap={2}>
        {isFolded && <Button key={`${ctx.keyOf(index)}:more`} plain label={t.more(rows.length - TABLE_FOLD)} onPress={() => ctx.onToggle(index)} />}
        {!isFolded && ctx.canFold && rows.length > TABLE_FOLD && (
          <Button key={`${ctx.keyOf(index)}:less`} plain label={t.less} onPress={() => ctx.onToggle(index)} />
        )}
        {ctx.parts.copy && <Button key={`${ctx.keyOf(index)}:copy`} plain label={t.copy} onPress={() => ctx.onCopy(segment.source)} />}
      </Box>
    </Box>
  )
}

const CALLOUT_GLYPHS: Record<CalloutKind, string> = { note: 'ℹ', tip: '✦', important: '❢', warning: '▲', caution: '✕' }

const calloutColor = (palette: Palette, kind: CalloutKind): string =>
  kind === 'note' ? palette.user : kind === 'tip' ? palette.ok : kind === 'important' ? palette.read : kind === 'warning' ? palette.warn : palette.err

/** A `> [!NOTE]` as a box with its title, the body in Claude Code's markdown. */
export const drawCallout = ({ Box, Text, Markdown }: ReplyElements, segment: Segment & { kind: 'callout' }, ctx: ReplyContext) => {
  const color = calloutColor(ctx.palette, segment.callout)
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={color} paddingX={1}>
      <Text color={color} bold>{`${CALLOUT_GLYPHS[segment.callout]} ${segment.title ?? ctx.t.callouts[segment.callout]}`}</Text>
      {segment.body.trim() !== '' && <Markdown text={segment.body} />}
    </Box>
  )
}

/** A task list with marks and how many are done. */
export const drawTasks = ({ Box, Text }: ReplyElements, segment: Segment & { kind: 'tasks' }, ctx: ReplyContext) => {
  const { palette, t } = ctx
  const done = segment.items.filter(item => item.done).length
  return (
    <Box flexDirection="column">
      {segment.items.map(item => (
        <Text>
          <Text color={item.done ? palette.ok : palette.muted}>{item.done ? '● ' : '○ '}</Text>
          <Text color={item.done ? palette.muted : palette.fg} strikethrough={item.done}>
            {plainOf(item.text)}
          </Text>
        </Text>
      ))}
      <Text color={palette.muted}>{t.tasks(done, segment.items.length)}</Text>
    </Box>
  )
}

/** A command's `key: value` lines as a two-column card, the keys dim. */
export const drawPairs = ({ Box, Text }: ReplyElements, segment: Segment & { kind: 'pairs' }, ctx: ReplyContext) => {
  const { palette } = ctx
  const keyWidth = Math.max(...segment.pairs.map(([key]) => width(key)))
  // On the desktop the keys line up as a column of boxes: padding a key with spaces does not.
  if (ctx.surface === 'desktop') {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor={palette.muted} overflow="hidden">
        {segment.pairs.map(([key, value], i) => (
          <Box flexDirection="row" columnGap={2} paddingX={1} backgroundColor={i % 2 === 1 ? palette.zebra : palette.surface}>
            <Box width={keyWidth + 1} flexShrink={0}>
              <Text color={palette.muted}>{key}</Text>
            </Box>
            <Box flexShrink={1} minWidth={0}>
              <Text color={palette.fg} wrap="wrap">{value}</Text>
            </Box>
          </Box>
        ))}
      </Box>
    )
  }
  return (
    <Box flexDirection="column" borderStyle={ctx.surface === 'desktop' ? 'round' : undefined} borderColor={palette.muted}>
      {segment.pairs.map(([key, value], i) => (
        <Text backgroundColor={i % 2 === 1 ? palette.zebra : palette.surface}>
          <Text color={palette.muted}>{` ${pad(key, keyWidth, 'left')}  `}</Text>
          <Text color={palette.fg}>{`${value} `}</Text>
        </Text>
      ))}
    </Box>
  )
}

/** The block a segment draws as, or null when it goes back to prose. */
const drawnOf = (elements: ReplyElements, segment: Segment, index: number, ctx: ReplyContext): unknown | null => {
  switch (segment.kind) {
    case 'prose':
      return null
    case 'table':
      return ctx.parts.tables ? drawTable(elements, segment, index, ctx) : null
    case 'callout':
      return ctx.parts.callouts ? drawCallout(elements, segment, ctx) : null
    case 'tasks':
      return ctx.parts.callouts ? drawTasks(elements, segment, ctx) : null
    case 'code':
      return ctx.parts.code && ctx.drawCode !== undefined ? ctx.drawCode(segment, index) : null
    case 'math':
      return ctx.parts.math && ctx.drawMath !== undefined ? ctx.drawMath(segment, index) : null
    case 'mermaid':
      return ctx.parts.diagrams && ctx.drawMermaid !== undefined ? ctx.drawMermaid(segment, index) : null
    case 'pairs':
      return ctx.parts.commands ? drawPairs(elements, segment, ctx) : null
  }
}

/**
 * A reply with its blocks drawn and the prose between them left to Claude Code's markdown; null
 * when the mod draws none of it, so the reply stays Claude Code's own.
 */
export const drawReply = (elements: ReplyElements, segments: readonly Segment[], ctx: ReplyContext) => {
  const { Box, Markdown } = elements
  const blocks: unknown[] = []
  let prose: string[] = []
  let drawnCount = 0
  const flush = () => {
    if (prose.length > 0) blocks.push(<Markdown text={prose.join('\n')} />)
    prose = []
  }
  segments.forEach((segment, index) => {
    const drawn = segment.kind === 'prose' ? null : drawnOf(elements, segment, index, ctx)
    if (drawn === null) {
      prose.push(segment.kind === 'prose' ? segment.text : segment.source)
      return
    }
    flush()
    blocks.push(drawn)
    drawnCount++
  })
  flush()
  if (drawnCount === 0) return null
  return (
    <Box flexDirection="column" rowGap={1}>
      {blocks}
    </Box>
  )
}

/** A reply the mod drew, led by the bullet Claude Code puts on the replies it draws itself. */
export const drawBulleted = ({ Box, Text }: Pick<ReplyElements, 'Box' | 'Text'>, reply: unknown, palette: Palette) => (
  <Box flexDirection="row">
    <Text color={palette.fg}>● </Text>
    <Box flexDirection="column" flexShrink={1}>
      {reply}
    </Box>
  </Box>
)
