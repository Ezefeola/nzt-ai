import type { Elements } from 'claude-code'

import type { Palette } from '../types'
import type { Texts } from './i18n'
import { clipLines, ICONS, INTERRUPTED } from './tools'
import type { Kind } from './tools'

export type RowState = 'running' | 'ok' | 'failed' | 'cut'

export type ToolRowModel = {
  id: string
  kind: Kind
  name: string
  target: string
  state: RowState
  diff: { added: number; removed: number } | null
  time: string | null
  /** A file this turn created or edited: its path takes the state's color. */
  tone: 'created' | 'edited' | null
  isOpen: boolean
  input: string
  output: string
  isCalm: boolean
}

type RowElements = Pick<Elements['terminal'], 'Box' | 'Text' | 'Button'>

/** The node's glyph says the state by its shape: running, done, failed, cut. */
const NODES: Record<RowState, string> = { running: '○', ok: '●', failed: '✕', cut: '◌' }

export const kindColor = (palette: Palette, kind: Kind): string => palette[kind]

const nodeColor = (palette: Palette, row: ToolRowModel): string =>
  row.state === 'failed' ? palette.err : row.state === 'cut' ? palette.muted : kindColor(palette, row.kind)

const OPEN_HEAD = 8
const OPEN_TAIL = 4

/** The lines of a block shown under an opened row: cut to 8 + 4 unless it failed, which shows whole. */
const blockLines = (text: string, isWhole: boolean, t: Texts): string[] => {
  const lines = text.replace(/\n$/, '').split('\n')
  if (isWhole) return lines
  const clip = clipLines(lines, OPEN_HEAD, OPEN_TAIL)
  return clip.hidden === 0 ? clip.head : [...clip.head, t.more(clip.hidden), ...clip.tail]
}

export const drawToolRow = (
  { Box, Text, Button }: RowElements,
  row: ToolRowModel,
  palette: Palette,
  t: Texts,
  surface: 'terminal' | 'desktop',
  onToggle: () => void,
) => {
  const lead = surface === 'terminal' ? NODES[row.state] : ICONS[row.kind]
  const targetColor = row.tone === 'created' ? palette.ok : row.tone === 'edited' ? palette.warn : palette.muted
  const rail = surface === 'terminal' ? <Text color={palette.user}>┃ </Text> : null
  const canOpen = !row.isCalm && (row.input !== '' || row.output !== '')
  const isWhole = row.state === 'failed'
  const opened = canOpen && row.isOpen
  const line = (
    <Text wrap="truncate-end">
      {rail}
      <Text color={nodeColor(palette, row)}>{lead}</Text>
      <Text color={kindColor(palette, row.kind)} bold>{` ${row.name}`}</Text>
      {row.target !== '' && <Text color={targetColor}>{` ${row.target}`}</Text>}
      {row.state === 'cut' && <Text color={palette.warn}>{` · ${INTERRUPTED}`}</Text>}
    </Text>
  )
  return (
    <Box flexDirection="column">
      <Box flexDirection="row" justifyContent="space-between">
        <Box flexShrink={1}>
          {canOpen ? (
            <Button key={`row:${row.id}`} plain onPress={onToggle}>
              {line}
            </Button>
          ) : (
            line
          )}
        </Box>
        <Box flexDirection="row" columnGap={1} flexShrink={0}>
          {row.diff !== null && (
            <Text>
              <Text color={palette.ok}>{`+${row.diff.added}`}</Text>
              <Text color={palette.err}>{` −${row.diff.removed}`}</Text>
            </Text>
          )}
          {row.time !== null && <Text color={palette.muted}>{row.time}</Text>}
          {canOpen && <Button key={`open:${row.id}`} plain label={opened ? '▾' : '▸'} onPress={onToggle} />}
        </Box>
      </Box>
      {opened && row.input !== '' && (
        <Box flexDirection="column" paddingLeft={surface === 'terminal' ? 0 : 2}>
          {blockLines(row.input, false, t).map(line => (
            <Text color={palette.muted} wrap="truncate-end">
              {surface === 'terminal' && <Text color={palette.user}>┃   </Text>}
              {line}
            </Text>
          ))}
        </Box>
      )}
      {(opened || (row.state === 'failed' && row.output !== '')) && row.output !== '' && (
        <Box flexDirection="column" paddingLeft={surface === 'terminal' ? 0 : 2}>
          {blockLines(row.output, isWhole, t).map(line => (
            <Text color={row.state === 'failed' ? palette.err : palette.fg} wrap="truncate-end">
              {surface === 'terminal' && <Text color={palette.user}>┃   </Text>}
              {line}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  )
}

/** The grouped row: how many reads and searches, by name, and ▸ to unfold them. */
export const drawGroupRow = (
  { Box, Text, Button }: RowElements,
  counts: readonly { name: string; count: number; kind: Kind }[],
  hasFailed: boolean,
  palette: Palette,
  t: Texts,
  surface: 'terminal' | 'desktop',
  key: string,
  onOpen: () => void,
) => (
  <Box flexDirection="row" justifyContent="space-between">
    <Button key={`row:${key}`} plain onPress={onOpen}>
      <Text wrap="truncate-end">
        {surface === 'terminal' && <Text color={palette.user}>┃ </Text>}
        <Text color={hasFailed ? palette.err : palette.read}>{surface === 'terminal' ? (hasFailed ? '✕' : '●') : ICONS.read}</Text>
        <Text color={palette.muted}>{` ${t.grouped(counts.map(count => `${count.name} ${count.count}`))}`}</Text>
      </Text>
    </Button>
    <Button key={key} plain label="▸" onPress={onOpen} />
  </Box>
)
