import type { Level, Limit, Reading, Usage } from '../types'

/** The kernel's marks, in percent; each one opens the level named beside it. Not configurable. */
export const MARKS = [
  { at: 20, level: 'warn' },
  { at: 30, level: 'high' },
  { at: 40, level: 'critical' },
] as const satisfies readonly { at: number; level: Level }[]

const RANK: Record<Level, number> = { low: 0, warn: 1, high: 2, critical: 3 }

export const levelOf = (percent: number): Level =>
  MARKS.reduce<Level>((level, mark) => (percent >= mark.at ? mark.level : level), 'low')

export const isAbove = (level: Level, than: Level | null): boolean => than === null || RANK[level] > RANK[than]

/** The engine's figures as a reading; a fill it has not reported is no reading, never 0%. */
export const readingOf = (context: { tokens?: number; window: number; percent?: number }): Reading =>
  context.percent === undefined || context.tokens === undefined || !(context.window > 0)
    ? { kind: 'none' }
    : { kind: 'ok', percent: context.percent, tokens: context.tokens, window: context.window }

const LIMIT_KINDS: Record<string, Limit['kind']> = { five_hour: 'fiveHour', seven_day: 'week' }

/** The plan's windows the band shows: the five-hour one and the weekly one, when reported. */
export const limitsOf = (rateLimits: readonly { kind: string; percentUsed: number; resetsAt?: string }[]): Limit[] =>
  rateLimits.flatMap(limit => {
    const kind = LIMIT_KINDS[limit.kind]
    if (kind === undefined) return []
    const resetsAt = limit.resetsAt === undefined ? NaN : Date.parse(limit.resetsAt)
    return [{ kind, percent: limit.percentUsed, resetsAt: Number.isNaN(resetsAt) ? null : resetsAt }]
  })

export const usageOf = (usage: {
  context: { tokens?: number; window: number; percent?: number }
  rateLimits: readonly { kind: string; percentUsed: number; resetsAt?: string }[]
  cost?: { usd: number }
}): Usage => ({ reading: readingOf(usage.context), limits: limitsOf(usage.rateLimits), costUsd: usage.cost?.usd ?? null })

export const NO_USAGE: Usage = { reading: { kind: 'none' }, limits: [], costUsd: null }

/** Tokens in thousands below a million, in millions from there: 34k, 412k, 1M, 1.5M. */
export const abbreviate = (tokens: number): string => {
  if (tokens >= 1_000_000) return `${Math.round(tokens / 100_000) / 10}M`
  return `${Math.round(tokens / 1000)}k`
}

/** What is left until a window resets: `2h15` within a day, `5d2h` past it, `0h40` under an hour. */
export const countdownOf = (resetsAt: number | null, now: number): string | null => {
  if (resetsAt === null) return null
  const minutes = Math.max(0, Math.round((resetsAt - now) / 60_000))
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  if (days > 0) return `${days}d${hours}h`
  return `${hours}h${String(minutes % 60).padStart(2, '0')}`
}

export const costOf = (usd: number | null): string | null => (usd === null ? null : `$${usd.toFixed(2)}`)

/** A model's short name: `claude-opus-5-5` reads `Opus 5.5`; a name of any other form goes as given. */
export const modelNameOf = (model: string): string => {
  const parts = /^claude-([a-z]+)-(\d+)-(\d+)(?:-\d{8})?(\[[^\]]*\])?$/.exec(model.trim())
  if (parts === null) return model.trim()
  const [, family, major, minor, window] = parts
  return `${family![0]!.toUpperCase()}${family!.slice(1)} ${major}.${minor}${window === undefined ? '' : ` ${window}`}`
}

/** The effort as the engine names it; a numeric one is shown as its number. */
export const effortOf = (effort: string | number | undefined): string | null => (effort === undefined ? null : String(effort))

const ZONE: Record<Level, string> = {
  low: 'under 20%, no action',
  warn: '20%+, recommend clearing',
  high: '30%+, say it plainly',
  critical: '40%+, recommend strongly',
}

/** The line the agent reads with each prompt: the host's context signal the kernel reports from. */
export const agentLineOf = (reading: Reading): string =>
  reading.kind === 'none'
    ? '[nzt-look] Context used: no reading yet.'
    : `[nzt-look] Context used: ${reading.percent}% (${abbreviate(reading.tokens)} of ${abbreviate(reading.window)} tokens), ${ZONE[levelOf(reading.percent)]}.`

/** The notice a turn's next tool result carries when the context crossed a mark mid-turn. */
export const crossingLineOf = (reading: Reading & { kind: 'ok' }): string =>
  `[nzt-look] Context crossed a mark: now ${reading.percent}% (${abbreviate(reading.tokens)} of ${abbreviate(reading.window)} tokens), ${ZONE[levelOf(reading.percent)]}.`

/** How long the clear button waits for its second press. */
export const CONFIRM_MS = 5000

export const isConfirming = (confirmAt: number | null, now: number): boolean => confirmAt !== null && now - confirmAt < CONFIRM_MS
