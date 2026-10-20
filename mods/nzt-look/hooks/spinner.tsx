import type { Elements } from 'claude-code'

import type { Palette } from '../types'

/** One of a list, the same one for the same seed: a turn keeps its word while it redraws. */
export const pick = (list: readonly string[], seed: string): string => {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return list[hash % list.length]!
}

/** A time as the footer says it: `41s`, `1m 4s`. */
export const durationOf = (ms: number): string => {
  const seconds = Math.max(0, Math.round(ms / 1000))
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

/** Tokens as the spinner counts them: `300`, `1.2k`, `48k`. */
export const tokensOf = (count: number): string => {
  if (count < 1000) return String(count)
  const thousands = count / 1000
  return `${thousands < 10 ? thousands.toFixed(1).replace(/\.0$/, '') : Math.round(thousands)}k`
}

/** What a turn's spinner carries after its word: the time, the tokens, the effort, each once known. */
export type Figures = { elapsedMs: number | null; tokens: number; effort: string | null }

// Claude Code's own spinner, as its types show it: `Sauteing… (12s, 300 tokens)`.
export const figuresOf = ({ elapsedMs, tokens, effort }: Figures): string => {
  const parts = [
    elapsedMs === null ? null : durationOf(elapsedMs),
    tokens > 0 ? `${tokensOf(tokens)} tokens` : null,
    effort === null ? null : `${effort} effort`,
  ].filter(Boolean)
  return parts.length === 0 ? '' : ` (${parts.join(', ')})`
}

/** The glyph the desktop's spinner shows for what the turn is doing. */
export const PHASE_ICONS: Record<'requesting' | 'responding' | 'thinking' | 'tool-input' | 'tool-use', string> = {
  thinking: '✻',
  requesting: '◌',
  responding: '✎',
  'tool-input': '…',
  'tool-use': '▶',
}

/** The colors the animated spinner needs, plain data so its surface module can carry them. */
export type SpinnerColors = { fg: string; muted: string; accent: string }

type TextElements = Pick<Elements['terminal'], 'Box' | 'Text'>

/** The spinner standing still: calm mode, the desktop, or where the animation failed. */
export const drawStillSpinner = ({ Text }: TextElements, glyph: string, word: string, suffix: string, palette: Palette) => (
  <Text>
    <Text color={palette.user}>{`${glyph} `}</Text>
    <Text color={palette.fg} bold>
      {word}
    </Text>
    <Text color={palette.muted}>{suffix}</Text>
  </Text>
)

/** The line that closes a turn: Claude Code's own, and after it the tools and the lines changed. */
export const drawFooter = ({ Box, Text }: TextElements, line: unknown, extra: string, palette: Palette) => (
  <Box flexDirection="row" flexWrap="wrap">
    {line}
    <Text color={palette.muted}>{extra}</Text>
  </Box>
)

/** The person's prompt inside a rounded outline as wide as what they wrote. */
export const drawPrompt = ({ Box, Text }: TextElements, text: string, palette: Palette) => (
  <Box flexDirection="row">
    <Box borderStyle="round" borderColor={palette.user} paddingX={1} flexShrink={1}>
      <Text color={palette.fg} wrap="wrap">
        {text}
      </Text>
    </Box>
  </Box>
)
