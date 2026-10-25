import type { CodeColors, Palette } from '../types'
import type { Style } from './canvas'
import { highlight, isShellLanguage, tokenColor } from './highlight'
import type { MathBlock } from './math'
import type { Diagram } from './mermaid'

const SLICES = ['read', 'write', 'run', 'search', 'web', 'mcp', 'ok', 'warn'] as const

/** The theme's color for a part of a diagram. */
export const styleColor = (palette: Palette, style: Style | null): string | undefined => {
  if (style === null) return undefined
  if (style.startsWith('slice')) return palette[SLICES[Number(style.slice(5)) % SLICES.length]!]
  return { box: palette.user, label: palette.fg, edge: palette.muted, arrow: palette.user, note: palette.read, title: palette.fg, muted: palette.muted }[
    style as Exclude<Style, `slice${number}`>
  ]
}

/** A diagram as a card: its rows drawn in the theme's colors, on one font so the lines join. */
export const drawDiagram = (
  { Box, Text, Button }: ReplyElements,
  diagram: Diagram,
  palette: Palette,
  t: Texts,
  options: { surface: 'terminal' | 'desktop'; canCopy: boolean; key: string; onCopy: () => void },
) => (
  <Box flexDirection="column" borderStyle="round" borderColor={palette.muted} backgroundColor={options.surface === 'desktop' ? palette.surface : undefined} paddingX={1}>
    <Box flexDirection="row" justifyContent="space-between">
      <Text color={palette.muted}>{`mermaid · ${diagram.kind}`}</Text>
      {options.canCopy && <Button key={`${options.key}:copy`} plain label={t.copy} onPress={options.onCopy} />}
    </Box>
    {diagram.rows.map(runs => (
      <Text mono wrap="truncate-end">
        {runs.length === 0 ? ' ' : runs.map(run => <Text color={styleColor(palette, run.style)} bold={run.style === 'title'}>{run.text}</Text>)}
      </Text>
    ))}
  </Box>
)
import type { Texts } from './i18n'
import type { ReplyElements } from './reply'

/** Past this many lines a code block folds, with `▾ N más`. */
export const CODE_FOLD = 24

export type CodeOptions = {
  surface: 'terminal' | 'desktop'
  isUnfolded: boolean
  canFold: boolean
  canCopy: boolean
  key: string
  onToggle: () => void
  onCopy: () => void
  /** The theme's own colors for code, when it has them. */
  code: CodeColors | null
}

/** A display formula as a card: its rows in the theme's text, on one font so fractions line up. */
export const drawMath = (
  { Box, Text, Button }: ReplyElements,
  block: MathBlock,
  palette: Palette,
  t: Texts,
  options: { surface: 'terminal' | 'desktop'; canCopy: boolean; key: string; onCopy: () => void },
) => (
  <Box flexDirection="column" borderStyle="round" borderColor={palette.muted} backgroundColor={options.surface === 'desktop' ? palette.surface : undefined} paddingX={2}>
    {block.lines.map(line => (
      <Text color={palette.fg} mono>
        {line === '' ? ' ' : line}
      </Text>
    ))}
    {options.canCopy && (
      <Box flexDirection="row" justifyContent="flex-end">
        <Button key={`${options.key}:copy`} plain label={t.copy} onPress={options.onCopy} />
      </Box>
    )}
  </Box>
)

/**
 * A code block framed, its language on the frame's first row and its tokens in the theme's
 * colors; numbered on the desktop. Null where Claude Code's own drawing stays: a language the
 * highlighter does not know, and a shell block on the desktop, which keeps its Run button.
 */
export const drawCode = (
  { Box, Text, Button }: ReplyElements,
  code: string,
  language: string,
  palette: Palette,
  t: Texts,
  options: CodeOptions,
) => {
  if (options.surface === 'desktop' && isShellLanguage(language)) return null
  const lines = highlight(code.replace(/\n$/, ''), language)
  if (lines === null) return null
  const isFolded = options.canFold && lines.length > CODE_FOLD && !options.isUnfolded
  const shown = isFolded ? lines.slice(0, CODE_FOLD) : lines
  const gutter = String(lines.length).length
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={palette.muted}
      backgroundColor={options.code?.surface ?? (options.surface === 'desktop' ? palette.surface : undefined)}
      paddingX={1}
    >
      <Box flexDirection="row" justifyContent="space-between">
        <Text color={palette.muted}>{language}</Text>
        {options.canCopy && <Button key={`${options.key}:copy`} plain label={t.copy} onPress={options.onCopy} />}
      </Box>
      {/* On the desktop the line is set in one font, as a diagram is: the indent and the numbers line up. */}
      {shown.map((tokens, i) => (
        <Text wrap="wrap" mono={options.surface === 'desktop' ? true : undefined}>
          {options.surface === 'desktop' && <Text color={palette.muted}>{`${String(i + 1).padStart(gutter)}  `}</Text>}
          {tokens.length === 0 ? ' ' : tokens.map(token => (
                <Text color={tokenColor(palette, token.kind, options.code) ?? options.code?.plain ?? palette.fg} italic={token.kind === 'comment'}>
                  {token.text}
                </Text>
              ))}
        </Text>
      ))}
      {isFolded && <Button key={`${options.key}:more`} plain label={t.more(lines.length - CODE_FOLD)} onPress={options.onToggle} />}
      {!isFolded && options.canFold && lines.length > CODE_FOLD && <Button key={`${options.key}:less`} plain label={t.less} onPress={options.onToggle} />}
    </Box>
  )
}
