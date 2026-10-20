import type { Elements } from 'claude-code'

import type { CodeColors, Palette } from '../types'
import { mix } from './contrast'
import type { Texts } from './i18n'
import { highlight, knows, tokenColor } from './highlight'
import type { TokenKind } from './highlight'
import { clipLines, INTERRUPTED } from './tools'

const HEAD = 8
const TAIL = 4

export type ShellModel = {
  command: string
  stdout: string[]
  stderr: string[]
  /** Null while it worked; the exit code (or -1 when unknown) when it failed. */
  exit: number | null
}

const record = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}

const linesOf = (text: unknown): string[] =>
  typeof text === 'string' && text.trim() !== '' ? text.replace(/\r/g, '').replace(/\n+$/, '').split('\n') : []

/**
 * What a shell call left, as the card draws it; null where the card cannot draw it faithfully
 * (a command sent to the background, an image) and Claude Code's own drawing stays.
 */
export const shellModelOf = (input: unknown, output: unknown, isErrored: boolean): ShellModel | null => {
  const command = typeof record(input).command === 'string' ? (record(input).command as string) : ''
  if (isErrored) {
    const text = typeof output === 'string' ? output : JSON.stringify(output ?? '')
    const lines = linesOf(text)
    const code = lines[0]?.match(/^Exit code (\d+)/)
    return { command, stdout: [], stderr: code === null || code === undefined ? lines : lines.slice(1), exit: code ? Number(code[1]) : -1 }
  }
  const held = record(output)
  if (held.backgroundTaskId !== undefined || held.isImage === true) return null
  return { command, stdout: linesOf(held.stdout), stderr: linesOf(held.stderr), exit: held.interrupted === true ? -1 : null }
}

type Run = { text: string; color?: string; bold?: boolean }

const TOKEN =
  /(\b(?:error|errors|fail|failed|failure|fatal|ERR!?)\b|\b(?:warn|warning|warnings|deprecated)\b|\b(?:ok|pass|passed|success|succeeded|done)\b|[✓✔]|[✗✕✘]|(?:[A-Za-z]:)?[\w.-]*[\\/][\w./\\-]+(?::\d+(?::\d+)?)?|\b\d+(?:\.\d+)*(?:ms|s|%)?\b)/gi

/** A line of output in color: error, warning and success words, paths and numbers. */
export const colorize = (line: string, palette: Palette): Run[] => {
  const runs: Run[] = []
  let at = 0
  for (const match of line.matchAll(TOKEN)) {
    const word = match[0]
    if (match.index! > at) runs.push({ text: line.slice(at, match.index) })
    const lower = word.toLowerCase()
    const color = /^(error|errors|fail|failed|failure|fatal|err!?)$|[✗✕✘]/.test(lower)
      ? palette.err
      : /^(warn|warning|warnings|deprecated)$/.test(lower)
        ? palette.warn
        : /^(ok|pass|passed|success|succeeded|done)$|[✓✔]/.test(lower)
          ? palette.ok
          : /[\\/]/.test(word)
            ? palette.read
            : palette.user
    runs.push({ text: word, color, bold: color === palette.err })
    at = match.index! + word.length
  }
  if (at < line.length) runs.push({ text: line.slice(at) })
  return runs
}

type CardElements = Pick<Elements['terminal'], 'Box' | 'Text' | 'Button'>

const stream = (
  { Box, Text, Button }: CardElements,
  lines: string[],
  isErr: boolean,
  isWhole: boolean,
  palette: Palette,
  t: Texts,
  key: string,
  onToggle: () => void,
) => {
  const clip = isWhole ? { head: lines, hidden: 0, tail: [] as string[] } : clipLines(lines, HEAD, TAIL)
  const line = (text: string) => (
    <Text wrap="wrap" color={isErr ? palette.err : palette.fg}>
      {isErr ? text : colorize(text, palette).map(run => <Text color={run.color} bold={run.bold}>{run.text}</Text>)}
    </Text>
  )
  return (
    <Box flexDirection="column">
      {clip.head.map(line)}
      {clip.hidden > 0 && <Button key={`${key}:more`} plain label={t.more(clip.hidden)} onPress={onToggle} />}
      {clip.tail.map(line)}
      {isWhole && lines.length > HEAD + TAIL && <Button key={`${key}:less`} plain label={t.less} onPress={onToggle} />}
    </Box>
  )
}

/** The shell card: the command, how it ended, the output in color and stderr apart, each folded. */
export const drawShellCard = (
  elements: CardElements,
  model: ShellModel,
  palette: Palette,
  t: Texts,
  options: { isUnfolded: boolean; canFold: boolean; key: string; onToggle: () => void; surface: 'terminal' | 'desktop' },
) => {
  const { Box, Text } = elements
  const failed = model.exit !== null
  // A failure always shows whole.
  const isWhole = failed || options.isUnfolded || !options.canFold
  const isEmpty = model.stdout.length === 0 && model.stderr.length === 0
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={failed ? palette.err : palette.muted}
      backgroundColor={options.surface === 'desktop' ? palette.surface : undefined}
      paddingX={1}
    >
      <Box flexDirection="row" justifyContent="space-between">
        <Box flexShrink={1}>
          <Text wrap="truncate-end">
            <Text color={palette.run}>$ </Text>
            <Text color={palette.fg} bold>
              {model.command.split('\n')[0]}
            </Text>
          </Text>
        </Box>
        <Text color={failed ? palette.err : palette.ok} bold>
          {failed ? `✗ ${model.exit === -1 ? INTERRUPTED : t.exit(model.exit!)}` : '✓'}
        </Text>
      </Box>
      {isEmpty && <Text color={palette.muted}>{t.noOutput}</Text>}
      {model.stdout.length > 0 && stream(elements, model.stdout, false, isWhole, palette, t, `${options.key}:out`, options.onToggle)}
      {model.stderr.length > 0 && (
        <Box flexDirection="column" marginTop={model.stdout.length > 0 ? 1 : 0}>
          {stream(elements, model.stderr, true, isWhole, palette, t, `${options.key}:err`, options.onToggle)}
        </Box>
      )}
    </Box>
  )
}

export type DiffLine = { kind: 'add' | 'del' | 'same' | 'gap'; text: string; oldNo: number | null; newNo: number | null }

/** The lines of the patches an edit reported, numbered on both sides. */
export const diffLinesOf = (output: unknown): DiffLine[] | null => {
  const patches = record(output).structuredPatch
  if (!Array.isArray(patches) || patches.length === 0) return null
  const lines: DiffLine[] = []
  patches.forEach((patch, index) => {
    const held = record(patch)
    let oldNo = Number(held.oldStart) || 1
    let newNo = Number(held.newStart) || 1
    if (index > 0) lines.push({ kind: 'gap', text: '⋯', oldNo: null, newNo: null })
    for (const raw of (held.lines as unknown[]) ?? []) {
      if (typeof raw !== 'string') continue
      const mark = raw[0]
      const text = raw.slice(1)
      if (mark === '+') lines.push({ kind: 'add', text, oldNo: null, newNo: newNo++ })
      else if (mark === '-') lines.push({ kind: 'del', text, oldNo: oldNo++, newNo: null })
      else lines.push({ kind: 'same', text, oldNo: oldNo++, newNo: newNo++ })
    }
  })
  return lines
}

/** The language an edited file is written in, by its extension; null for one the highlighter does not know. */
export const languageOfPath = (path: string): string | null => {
  const extension = /\.([A-Za-z0-9#+]+)$/.exec(path)?.[1]?.toLowerCase()
  return extension !== undefined && knows(extension) ? extension : null
}

/** A diff line's text in the colors of its language; plain text when there is none. */
const drawCodeLine = (
  Text: Pick<Elements['terminal'], 'Text'>['Text'],
  text: string,
  language: string | null,
  palette: Palette,
  code: CodeColors | null,
  isChanged: boolean,
) => {
  const tokens = language === null ? null : highlight(text, language)?.flat()
  // A comment's dim color falls under 4.5:1 over a changed line's background; there it takes the code's text color.
  const colorOf = (kind: TokenKind) =>
    (isChanged && kind === 'comment' ? undefined : tokenColor(palette, kind, code)) ?? code?.plain ?? palette.fg
  if (tokens == null || tokens.length === 0) {
    return (
      <Text color={palette.fg} wrap="wrap">
        {text === '' ? ' ' : text}
      </Text>
    )
  }
  return (
    <Text wrap="wrap">
      {tokens.map(token => (
        <Text color={colorOf(token.kind)} italic={token.kind === 'comment'}>
          {token.text}
        </Text>
      ))}
    </Text>
  )
}

/** An edit's diff card: the path, `+N −M`, and the lines numbered, highlighted, added and removed on their backgrounds. */
export const drawDiffCard = (
  { Box, Text }: Pick<Elements['terminal'], 'Box' | 'Text'>,
  path: string,
  lines: readonly DiffLine[],
  palette: Palette,
  code: CodeColors | null = null,
) => {
  const language = languageOfPath(path)
  const added = lines.filter(line => line.kind === 'add').length
  const removed = lines.filter(line => line.kind === 'del').length
  const width = String(Math.max(0, ...lines.map(line => line.newNo ?? line.oldNo ?? 0))).length
  // At 22% a changed line stands off the card (about 1.5:1 in nzt) and highlighted code on it
  // still reads at 4.5:1, all but comments, which drawCodeLine lifts on those lines.
  const addBack = mix(palette.surface, palette.ok, 0.22)
  const delBack = mix(palette.surface, palette.err, 0.22)
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={palette.muted} backgroundColor={palette.surface} paddingX={1}>
      <Box flexDirection="row" justifyContent="space-between">
        <Text color={palette.write} bold wrap="truncate-end">
          {path}
        </Text>
        <Text>
          <Text color={palette.ok}>{`+${added}`}</Text>
          <Text color={palette.err}>{` −${removed}`}</Text>
        </Text>
      </Box>
      {lines.map(line =>
        line.kind === 'gap' ? (
          <Text color={palette.muted}>{line.text}</Text>
        ) : (
          <Box flexDirection="row">
            {/* The number stays on the card: Tenue over a line's background falls under 4.5:1. */}
            <Text color={palette.muted}>{`${String(line.newNo ?? line.oldNo ?? '').padStart(width)} `}</Text>
            <Box flexDirection="row" flexGrow={1} backgroundColor={line.kind === 'add' ? addBack : line.kind === 'del' ? delBack : undefined}>
              <Text color={line.kind === 'add' ? palette.ok : line.kind === 'del' ? palette.err : palette.muted}>
                {line.kind === 'add' ? '+ ' : line.kind === 'del' ? '− ' : '  '}
              </Text>
              {drawCodeLine(Text, line.text, language, palette, code, line.kind !== 'same')}
            </Box>
          </Box>
        ),
      )}
    </Box>
  )
}
