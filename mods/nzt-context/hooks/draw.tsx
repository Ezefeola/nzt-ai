import type { ClientElements, Color } from 'claude-code'

import type { Level } from '../types'
import { cellsOf, levelOf, scaleOf } from './gauge'
import type { Cell } from './gauge'

/** What the band shows at one instant; the still band and every animation frame draw one. */
export type Frame = {
  /** The label, or null when the band is too narrow for it. */
  label: string | null
  /** The fill drawn, in percent; fractional while the fill moves. */
  percent: number
  /** The tokens beside the percentage (`34k/200k`), or null when they do not fit. */
  tokens: string | null
  /** Cells the bar takes. */
  width: number
  /** First column of the bright stretch that runs along the fill while a turn works. */
  shimmerAt: number | null
  /** The mark (20, 30, 40) blinking, drawn off in this frame. */
  blinkOff: number | null
  /** Past 40, the pulse's off beat: the percentage without its background. */
  pulseOff: boolean
}

export type Still = Omit<Frame, 'shimmerAt' | 'blinkOff' | 'pulseOff'>

export const still = (frame: Still): Frame => ({ ...frame, shimmerAt: null, blinkOff: null, pulseOff: false })

export const COLOR: Record<Level, Color> = {
  low: 'inactive',
  warn: 'warning',
  high: 'error',
  critical: 'error',
}

const SHIMMER = 4

type Style = { color: Color; bold: boolean; dim: boolean }
type Run = Style & { text: string }

const styled = (cell: Cell, column: number, frame: Frame, level: Level): Run => {
  if (cell.kind === 'fill') {
    const isBright = frame.shimmerAt !== null && column >= frame.shimmerAt && column < frame.shimmerAt + SHIMMER
    return isBright
      ? { text: '━', color: 'text', bold: true, dim: false }
      : { text: '━', color: COLOR[level], bold: level === 'critical', dim: false }
  }
  if (cell.kind === 'mark') {
    return cell.isLit && frame.blinkOff !== cell.at
      ? { text: '┃', color: COLOR[cell.level], bold: true, dim: false }
      : { text: '╂', color: 'inactive', bold: false, dim: false }
  }
  return cell.zone === 'low'
    ? { text: '─', color: 'inactive', bold: false, dim: true }
    : { text: '┄', color: COLOR[cell.zone], bold: false, dim: true }
}

/** Consecutive cells drawn alike, so the bar is a handful of runs instead of one per cell. */
export const runsOf = (frame: Frame): Run[] => {
  const level = levelOf(frame.percent)
  const runs: Run[] = []
  cellsOf(frame.percent, frame.width).forEach((cell, column) => {
    const run = styled(cell, column, frame, level)
    const last = runs.at(-1)
    if (last !== undefined && last.color === run.color && last.bold === run.bold && last.dim === run.dim) last.text += run.text
    else runs.push(run)
  })
  return runs
}

/** The percentage with a space each side, so the pill past 40 does not move what follows. */
export const pillOf = (percent: number): string => ` ${Math.round(percent)}% `

type Elements = Pick<ClientElements, 'Box' | 'Text'>

export const drawBand = ({ Box, Text }: Elements, frame: Frame) => {
  const level = levelOf(frame.percent)
  const indent = frame.label === null ? 0 : frame.label.length + 1
  const pill = pillOf(frame.percent)
  return (
    <Box flexDirection="column">
      <Text wrap="truncate">
        {frame.label !== null && <Text dimColor>{frame.label} </Text>}
        {runsOf(frame).map(run => (
          <Text color={run.color} bold={run.bold} dimColor={run.dim}>
            {run.text}
          </Text>
        ))}{' '}
        {level === 'critical' && !frame.pulseOff ? (
          <Text backgroundColor="error" color="inverseText" bold>
            {pill}
          </Text>
        ) : (
          <Text color={COLOR[level]} bold={level !== 'low'}>
            {pill}
          </Text>
        )}
        {frame.tokens !== null && <Text dimColor> {frame.tokens}</Text>}
      </Text>
      <Text wrap="truncate">
        {' '.repeat(indent)}
        {scaleOf(frame.width).map(piece => (
          <Text color={frame.percent >= piece.at && frame.blinkOff !== piece.at ? COLOR[piece.level] : 'inactive'}>
            {piece.text}
          </Text>
        ))}
      </Text>
    </Box>
  )
}

export const drawNoReading = ({ Box, Text }: Elements, label: string, noReading: string, width: number) => (
  <Box>
    <Text wrap="truncate">
      <Text dimColor>{label} </Text>
      <Text color="inactive" dimColor>
        {'─'.repeat(width)}
      </Text>
      <Text dimColor>  {noReading}</Text>
    </Text>
  </Box>
)
