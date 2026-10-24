import type { ClientElements, Elements } from 'claude-code'

import type { BandPart, Level, Palette, Running, Usage } from '../types'
import type { Texts } from './i18n'
import { abbreviate, costOf, countdownOf, levelOf, MARKS, modelNameOf } from './kernel'

/** The context meter: ten cells of 10%, with the kernel's marks as two cells more between them. */
export const CELLS = 10
const LIMIT_CELLS = 8
const GAP = 2
// What leaves first when the band does not fit, in order; the cells, the marks and the
// percentage always stay, and say the stretch without color. The countdowns go before the cost
// so the model stays at 120 columns, where the whole line does not fit.
const DROPS = ['tokens', 'countdown', 'cost', 'effort', 'model', 'week', 'fiveHour', 'clear', 'labels'] as const
const MODEL_ICON = '◇'
type Drop = (typeof DROPS)[number]

/** The context meter: the cells and the percentage, then the tokens. */
export type ContextModel = { kind: 'none'; label: string } | { kind: 'ok'; percent: number; level: Level; tokens: string | null }

export type LimitModel = { kind: 'fiveHour' | 'week'; percent: number; label: string; countdown: string | null }

export type ClearModel = 'dim' | 'main' | 'confirm' | null

export type RunningModel = { name: string; effort: string | null }

export type BandModel = {
  context: ContextModel | null
  limits: LimitModel[]
  cost: string | null
  running: RunningModel | null
  clear: ClearModel
  /** Each part's label at the left of its meter; the model goes without one. */
  hasLabels: boolean
}

export type BandInput = {
  usage: Usage
  running: Running
  now: number
  parts: Record<BandPart, boolean>
  columns: number
  isWorking: boolean
  isConfirming: boolean
  t: Texts
}

/** A context color: the theme's accent, then yellow from 30 and red from 40. */
export const levelColor = (palette: Palette, level: Level): string =>
  level === 'low' ? palette.user : level === 'warn' ? palette.warn : palette.err

/** The plan's windows warn from 80% and turn to error from 95%: their cuts, not the kernel's. */
export const limitColor = (palette: Palette, percent: number): string =>
  percent >= 95 ? palette.err : percent >= 80 ? palette.warn : palette.user

export const percentText = (percent: number, level: Level): string =>
  level === 'critical' ? ` ${Math.round(percent)}% ` : `${Math.round(percent)}%`

const contextWidth = (context: ContextModel): number => {
  if (context.kind === 'none') return CELLS + MARKS.length + 1 + context.label.length
  let meter = CELLS + MARKS.length + 1 + percentText(context.percent, context.level).length
  if (context.tokens !== null) meter += 1 + context.tokens.length
  return meter
}

const limitText = (limit: LimitModel) => `${Math.round(limit.percent)}%${limit.countdown === null ? '' : ` · ${limit.countdown}`}`

const runningText = (running: RunningModel) => `${running.name}${running.effort === null ? '' : ` · ${running.effort}`}`

const clearWidth = (clear: ClearModel, t: Texts): number =>
  clear === null ? 0 : clear === 'confirm' ? 3 + t.confirmClear.length + GAP + t.cancel.length : 3 + t.clear.length

export const widthOf = (model: BandModel, t: Texts): number => {
  const labeled = (label: string, meter: number) => (model.hasLabels ? label.length + 1 : 0) + meter
  const pieces = [
    model.running === null ? 0 : 2 + runningText(model.running).length,
    model.context === null ? 0 : labeled(t.context, contextWidth(model.context)),
    ...model.limits.map(limit => labeled(limit.label, LIMIT_CELLS + 1 + limitText(limit).length)),
    model.cost === null ? 0 : labeled(t.cost, model.cost.length),
    clearWidth(model.clear, t),
  ].filter(width => width > 0)
  return pieces.reduce((sum, width) => sum + width, 0) + GAP * Math.max(0, pieces.length - 1)
}

const without = (model: BandModel, drop: Drop): BandModel => {
  const context = model.context
  switch (drop) {
    case 'tokens':
      return context?.kind === 'ok' ? { ...model, context: { ...context, tokens: null } } : model
    case 'countdown':
      return { ...model, limits: model.limits.map(limit => ({ ...limit, countdown: null })) }
    case 'cost':
      return { ...model, cost: null }
    case 'effort':
      return model.running === null ? model : { ...model, running: { ...model.running, effort: null } }
    case 'model':
      return { ...model, running: null }
    case 'week':
    case 'fiveHour':
      return { ...model, limits: model.limits.filter(limit => limit.kind !== drop) }
    case 'clear':
      return { ...model, clear: null }
    case 'labels':
      return { ...model, hasLabels: false }
  }
}

/**
 * What the band shows: the parts switched on, as wide as the session gives it. Null when
 * every part is off, which draws no band at all.
 */
export const bandModelOf = (input: BandInput): BandModel | null => {
  const { usage, parts, t } = input
  if (!Object.values(parts).some(Boolean)) return null
  const reading = usage.reading
  const context: ContextModel | null = !parts.context
    ? null
    : reading.kind === 'none'
      ? { kind: 'none', label: t.noReading }
      : {
          kind: 'ok',
          percent: reading.percent,
          level: levelOf(reading.percent),
          tokens: `${abbreviate(reading.tokens)}/${abbreviate(reading.window)}`,
        }
  // Before the first reading there are no limits nor a cost to show, and nothing to clear yet.
  const hasReading = reading.kind === 'ok'
  const limits: LimitModel[] = hasReading
    ? usage.limits
        .filter(limit => parts[limit.kind])
        .map(limit => ({
          kind: limit.kind,
          percent: limit.percent,
          label: limit.kind === 'fiveHour' ? t.fiveHour : t.week,
          countdown: countdownOf(limit.resetsAt, input.now),
        }))
    : []
  const cost = hasReading && parts.cost ? costOf(usage.costUsd) : null
  const clear: ClearModel =
    !hasReading || !parts.clear || input.isWorking
      ? null
      : input.isConfirming
        ? 'confirm'
        : levelOf(reading.percent) === 'low'
          ? 'dim'
          : 'main'
  // Not a usage figure: the model is known before the first reading.
  const running: RunningModel | null =
    parts.model && input.running.model !== null ? { name: modelNameOf(input.running.model), effort: input.running.effort } : null
  let model: BandModel = { context, limits, cost, running, clear, hasLabels: true }
  for (const drop of DROPS) {
    if (widthOf(model, t) <= input.columns) break
    model = without(model, drop)
  }
  if (model.context?.kind === 'none' && widthOf(model, t) > input.columns) {
    model = { ...model, context: { kind: 'none', label: t.noReadingShort } }
  }
  return model
}

/** One frame of the context meter: what the still band draws, and every frame of the live one. */
export type MeterFrame = {
  percent: number
  level: Level
  /** The cells lit; fractional while the fill moves, rounded to draw. */
  filled: number
  /** Cells drawn bright, as a stretch of light runs along the fill while a turn works. */
  bright: readonly number[]
  /** The mark (30, 40) drawn off in this frame, as it blinks on being crossed. */
  blinkOff: number | null
  /** Past 40, the pulse's off beat: the percentage drawn without its pill. */
  pulseOff: boolean
}

export const stillFrame = (percent: number): MeterFrame => ({
  percent,
  level: levelOf(percent),
  filled: Math.round((CELLS * Math.min(100, Math.max(0, percent))) / 100),
  bright: [],
  blinkOff: null,
  pulseOff: false,
})

/** The colors a meter frame needs, plain data so a surface module can carry them. */
export type MeterColors = { low: string; warn: string; critical: string; muted: string; fg: string; surface: string }

export const meterColorsOf = (palette: Palette): MeterColors => ({
  low: palette.user,
  warn: palette.warn,
  critical: palette.err,
  muted: palette.muted,
  fg: palette.fg,
  surface: palette.surface,
})

type TextOnly = Pick<ClientElements, 'Text'>

/** The ten cells with their marks, as runs of Text. */
export const drawCells = ({ Text }: TextOnly, frame: MeterFrame, colors: MeterColors, isReading = true) => {
  const filled = Math.round(frame.filled)
  const runs: { text: string; color: string; dim: boolean; bold: boolean }[] = []
  const push = (text: string, color: string, dim: boolean, bold = false) => {
    const last = runs.at(-1)
    if (last !== undefined && last.color === color && last.dim === dim && last.bold === bold) last.text += text
    else runs.push({ text, color, dim, bold })
  }
  for (let i = 0; i < CELLS; i++) {
    const mark = MARKS.find(one => one.at === i * 10)
    if (mark !== undefined) {
      const isLit = isReading && frame.percent >= mark.at && frame.blinkOff !== mark.at
      push(isLit ? '▰' : '▱', isReading ? colors[mark.level] : colors.muted, !isReading, isLit)
    }
    if (isReading && i < filled) push('▰', frame.bright.includes(i) ? colors.fg : colors[frame.level], false, frame.bright.includes(i))
    else push('▱', colors.muted, true)
  }
  return (
    <Text>
      {runs.map(run => (
        <Text color={run.color} dimColor={run.dim} bold={run.bold}>
          {run.text}
        </Text>
      ))}
    </Text>
  )
}

/** The context meter after its cells: the percentage and the tokens. */
export const drawContextText = ({ Text }: TextOnly, context: ContextModel, frame: MeterFrame, colors: MeterColors) => {
  if (context.kind === 'none') return <Text dimColor italic>{` ${context.label}`}</Text>
  const color = colors[frame.level]
  const isPill = frame.level === 'critical' && !frame.pulseOff
  const after = context.tokens ?? ''
  return (
    <Text>
      {' '}
      {isPill ? (
        <Text backgroundColor={color} color={colors.surface} bold>
          {percentText(frame.percent, frame.level)}
        </Text>
      ) : (
        <Text color={frame.level === 'low' ? colors.fg : color} bold={frame.level !== 'low'}>
          {percentText(frame.percent, frame.level)}
        </Text>
      )}
      {after !== '' && <Text color={colors.muted}>{` ${after}`}</Text>}
    </Text>
  )
}

type Handlers = { onClear: () => void }

const drawRunning = (Text: TextOnly['Text'], running: RunningModel, palette: Palette) => (
  <Text key="running">
    <Text color={palette.user}>{MODEL_ICON}</Text>
    <Text color={palette.fg}>{` ${running.name}`}</Text>
    {running.effort !== null && <Text color={palette.muted}>{` · ${running.effort}`}</Text>}
  </Text>
)

const limitCells = (Text: TextOnly['Text'], limit: LimitModel, palette: Palette) => {
  const lit = Math.round((Math.min(100, limit.percent) / 100) * LIMIT_CELLS)
  return (
    <Text>
      <Text color={limitColor(palette, limit.percent)}>{'▰'.repeat(lit)}</Text>
      <Text color={palette.muted} dimColor>
        {'▱'.repeat(LIMIT_CELLS - lit)}
      </Text>
      <Text bold>{` ${Math.round(limit.percent)}%`}</Text>
      {limit.countdown !== null && <Text color={palette.muted}>{` · ${limit.countdown}`}</Text>}
    </Text>
  )
}

/** One part of the band: its label at the left of its meter, while the band has room for labels. */
const part = (Box: Elements['terminal']['Box'], key: string, label: unknown, meter: unknown) => (
  <Box key={key} flexDirection="row" gap={1} alignItems="center">
    {label}
    {meter}
  </Box>
)

const clearButton = (
  { Box, Button, Text }: Pick<Elements['terminal'], 'Box' | 'Button' | 'Text'>,
  clear: ClearModel,
  palette: Palette,
  t: Texts,
  handlers: Handlers,
) => {
  if (clear === null) return null
  if (clear === 'confirm') {
    return (
      <Box flexDirection="row" gap={GAP}>
        <Button key="clear" plain hotkey="0" onPress={handlers.onClear}>
          <Text color={palette.err} bold>
            {t.confirmClear}
          </Text>
        </Button>
        <Text color={palette.muted}>{t.cancel}</Text>
      </Box>
    )
  }
  return (
    <Button key="clear" plain hotkey="0" dimColor={clear === 'dim'} onPress={handlers.onClear}>
      <Text color={clear === 'main' ? palette.user : palette.muted} bold={clear === 'main'}>
        {t.clear}
      </Text>
    </Button>
  )
}

/**
 * The band on the terminal, in one line: the model, then each part with its label at its left —
 * the context (given, still or live), the plan's windows and the cost — and the clear button
 * against the right edge.
 */
export const drawTerminalBand = (
  elements: Pick<Elements['terminal'], 'Box' | 'Text' | 'Button'>,
  model: BandModel,
  palette: Palette,
  t: Texts,
  handlers: Handlers,
  contextNode: unknown,
) => {
  const { Box, Text } = elements
  const label = (text: string) => (model.hasLabels ? <Text color={palette.muted}>{text}</Text> : null)
  return (
    <Box flexDirection="row" justifyContent="space-between">
      <Box flexDirection="row" gap={GAP}>
        {model.running !== null && drawRunning(Text, model.running, palette)}
        {model.context !== null && part(Box, 'context-part', label(t.context), contextNode)}
        {model.limits.map(limit => part(Box, limit.kind, label(limit.label), limitCells(Text, limit, palette)))}
        {model.cost !== null && part(Box, 'cost', label(t.cost), <Text color={palette.muted}>{model.cost}</Text>)}
      </Box>
      {clearButton(elements, model.clear, palette, t, handlers)}
    </Box>
  )
}

/** A ring of `percent`, with the kernel's three marks when it is the context's. */
export const ringSvg = (percent: number, color: string, track: string, marks: readonly { at: number; color: string }[]): string => {
  const radius = 9
  const around = 2 * Math.PI * radius
  const fill = (around * Math.min(100, Math.max(0, percent))) / 100
  const ticks = marks
    .map(mark => {
      const angle = (mark.at / 100) * 2 * Math.PI - Math.PI / 2
      const at = (r: number) => `${(13 + Math.cos(angle) * r).toFixed(2)}`
      const atY = (r: number) => `${(13 + Math.sin(angle) * r).toFixed(2)}`
      return `<line x1="${at(6)}" y1="${atY(6)}" x2="${at(12.5)}" y2="${atY(12.5)}" stroke="${mark.color}" stroke-width="1.6"/>`
    })
    .join('')
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">` +
    `<circle cx="13" cy="13" r="${radius}" fill="none" stroke="${track}" stroke-opacity="0.3" stroke-width="3"/>` +
    `<circle cx="13" cy="13" r="${radius}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" ` +
    `stroke-dasharray="${fill.toFixed(2)} ${around.toFixed(2)}" transform="rotate(-90 13 13)"/>${ticks}</svg>`
  )
}

/** The band on the desktop, in one line: the model, a labeled ring per figure, the cost, and the clear button. */
export const drawDesktopBand = (
  elements: Pick<Elements['desktop'], 'Box' | 'Text' | 'Button' | 'Svg'>,
  model: BandModel,
  palette: Palette,
  t: Texts,
  handlers: Handlers & { onCancel: () => void },
) => {
  const { Box, Text, Button, Svg } = elements
  const context = model.context
  const contextRing =
    context === null ? null : context.kind === 'none' ? (
      <Box flexDirection="row" gap={1} alignItems="center">
        <Svg source={ringSvg(0, palette.muted, palette.muted, MARKS.map(mark => ({ at: mark.at, color: palette.muted })))} alt={context.label} />
        <Text color={palette.muted} italic>
          {context.label}
        </Text>
      </Box>
    ) : (
      <Box flexDirection="row" gap={1} alignItems="center">
        <Svg
          source={ringSvg(
            context.percent,
            levelColor(palette, context.level),
            palette.muted,
            MARKS.map(mark => ({ at: mark.at, color: context.percent >= mark.at ? levelColor(palette, mark.level) : palette.muted })),
          )}
          alt={`${t.context} ${Math.round(context.percent)}%`}
        />
        <Text>
          <Text color={context.level === 'low' ? palette.fg : levelColor(palette, context.level)} bold>{`${Math.round(context.percent)}%`}</Text>
          {context.tokens !== null && <Text color={palette.muted}>{` ${context.tokens}`}</Text>}
        </Text>
      </Box>
    )
  const clear =
    model.clear === null ? null : model.clear === 'confirm' ? (
      <Box flexDirection="row" gap={1} alignItems="center">
        <Text color={palette.err} bold>
          {t.confirmClearDesk}
        </Text>
        <Button key="clear" variant="primary" label={t.clear} onPress={handlers.onClear} />
        <Button key="cancel" label={t.cancelDesk} onPress={handlers.onCancel} />
      </Box>
    ) : (
      <Button key="clear" variant={model.clear === 'main' ? 'primary' : 'secondary'} dimColor={model.clear === 'dim'} label={t.clear} onPress={handlers.onClear} />
    )
  const label = (text: string) => (model.hasLabels ? <Text color={palette.muted}>{text}</Text> : null)
  const part = (key: string, left: unknown, meter: unknown) => (
    <Box key={key} flexDirection="row" gap={1} alignItems="center">
      {left}
      {meter}
    </Box>
  )
  return (
    <Box flexDirection="row" justifyContent="space-between" alignItems="center">
      <Box flexDirection="row" gap={2} alignItems="center">
        {model.running !== null && drawRunning(Text, model.running, palette)}
        {context !== null && part('context-part', label(t.context), contextRing)}
        {model.limits.map(limit =>
          part(
            limit.kind,
            label(limit.label),
            <Box flexDirection="row" gap={1} alignItems="center">
              <Svg source={ringSvg(limit.percent, limitColor(palette, limit.percent), palette.muted, [])} alt={`${limit.label} ${Math.round(limit.percent)}%`} />
              <Text>
                <Text bold>{`${Math.round(limit.percent)}%`}</Text>
                {limit.countdown !== null && <Text color={palette.muted}>{` · ${limit.countdown}`}</Text>}
              </Text>
            </Box>,
          ),
        )}
        {model.cost !== null && part('cost', label(t.cost), <Text color={palette.muted}>{model.cost}</Text>)}
      </Box>
      {clear}
    </Box>
  )
}
