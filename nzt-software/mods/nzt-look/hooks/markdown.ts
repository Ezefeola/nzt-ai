/** The callout kinds GitHub writes as `> [!NOTE]`. */
export type CalloutKind = 'note' | 'tip' | 'important' | 'warning' | 'caution'

export type Segment =
  | { kind: 'prose'; text: string }
  | { kind: 'code'; language: string; code: string; source: string }
  | { kind: 'mermaid'; code: string; source: string }
  | { kind: 'math'; tex: string; source: string }
  | { kind: 'table'; header: string[]; align: ('left' | 'right' | 'center')[]; rows: string[][]; source: string }
  | { kind: 'callout'; callout: CalloutKind; title: string | null; body: string; source: string }
  | { kind: 'tasks'; items: { done: boolean; text: string }[]; source: string }
  | { kind: 'pairs'; pairs: [string, string][]; source: string }

/** Three or more `key: value` lines in a row, as a command prints its figures. */
const PAIR = /^\s*([A-Za-z][\w ./()-]{0,40}?):\s+(\S.*)$/
const MIN_PAIRS = 3

const FENCE = /^(\s{0,3})(`{3,}|~{3,})\s*([^\s`]*)[^\n]*$/
const TABLE_RULE = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/
const CALLOUT = /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/i
const TASK = /^\s*[-*+]\s+\[([ xX])\]\s+(.*)$/

/** The cells of a table row: split on unescaped pipes, the outer ones dropped. */
export const cellsOf = (line: string): string[] => {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  return trimmed.split(/(?<!\\)\|/).map(cell => cell.trim().replace(/\\\|/g, '|'))
}

const alignOf = (rule: string): ('left' | 'right' | 'center')[] =>
  cellsOf(rule).map(cell => (cell.startsWith(':') && cell.endsWith(':') ? 'center' : cell.endsWith(':') ? 'right' : 'left'))

/**
 * A reply cut into what the mod draws itself and the prose around it, which Claude Code's
 * markdown keeps drawing. Each drawn segment carries its source, so a part switched off, or
 * one that cannot be drawn faithfully, goes back to being prose exactly as it was written.
 */
export const segmentsOf = (markdown: string, options: { pairs?: boolean } = {}): Segment[] => {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const segments: Segment[] = []
  let prose: string[] = []
  const flush = () => {
    if (prose.length > 0 && prose.join('').trim() !== '') segments.push({ kind: 'prose', text: prose.join('\n') })
    prose = []
  }
  let i = 0
  while (i < lines.length) {
    const line = lines[i]!
    const fence = line.match(FENCE)
    if (fence !== null) {
      const marker = fence[2]!
      const language = (fence[3] ?? '').toLowerCase()
      const body: string[] = []
      let j = i + 1
      while (j < lines.length && !lines[j]!.trim().startsWith(marker)) body.push(lines[j++]!)
      if (j >= lines.length) {
        // An unclosed fence (a reply still streaming) stays prose.
        prose.push(...lines.slice(i))
        break
      }
      const source = lines.slice(i, j + 1).join('\n')
      flush()
      const code = body.join('\n')
      if (language === 'mermaid') segments.push({ kind: 'mermaid', code, source })
      else if (language === 'math' || language === 'latex' || language === 'tex') segments.push({ kind: 'math', tex: code.trim(), source })
      else segments.push({ kind: 'code', language, code, source })
      i = j + 1
      continue
    }
    if (line.trim() === '$$' || line.trim().startsWith('$$')) {
      const opening = line.trim()
      if (opening.length > 4 && opening.endsWith('$$')) {
        flush()
        segments.push({ kind: 'math', tex: opening.slice(2, -2).trim(), source: line })
        i++
        continue
      }
      const body: string[] = [opening.slice(2)]
      let j = i + 1
      while (j < lines.length && !lines[j]!.includes('$$')) body.push(lines[j++]!)
      if (j < lines.length) {
        body.push(lines[j]!.slice(0, lines[j]!.indexOf('$$')))
        flush()
        segments.push({ kind: 'math', tex: body.join('\n').trim(), source: lines.slice(i, j + 1).join('\n') })
        i = j + 1
        continue
      }
    }
    if (line.includes('|') && i + 1 < lines.length && TABLE_RULE.test(lines[i + 1]!) && lines[i + 1]!.includes('-')) {
      const header = cellsOf(line)
      const align = alignOf(lines[i + 1]!)
      const rows: string[][] = []
      let j = i + 2
      while (j < lines.length && lines[j]!.includes('|') && lines[j]!.trim() !== '') rows.push(cellsOf(lines[j++]!))
      flush()
      segments.push({ kind: 'table', header, align, rows, source: lines.slice(i, j).join('\n') })
      i = j
      continue
    }
    const callout = line.match(CALLOUT)
    if (callout !== null) {
      const body: string[] = []
      let j = i + 1
      while (j < lines.length && lines[j]!.startsWith('>')) body.push(lines[j++]!.replace(/^>\s?/, ''))
      flush()
      segments.push({
        kind: 'callout',
        callout: callout[1]!.toLowerCase() as CalloutKind,
        title: callout[2]!.trim() === '' ? null : callout[2]!.trim(),
        body: body.join('\n'),
        source: lines.slice(i, j).join('\n'),
      })
      i = j
      continue
    }
    if (TASK.test(line)) {
      const items: { done: boolean; text: string }[] = []
      let j = i
      while (j < lines.length && TASK.test(lines[j]!)) {
        const task = lines[j]!.match(TASK)!
        items.push({ done: task[1] !== ' ', text: task[2]! })
        j++
      }
      flush()
      segments.push({ kind: 'tasks', items, source: lines.slice(i, j).join('\n') })
      i = j
      continue
    }
    if (options.pairs === true && PAIR.test(line)) {
      let j = i
      while (j < lines.length && PAIR.test(lines[j]!)) j++
      if (j - i >= MIN_PAIRS) {
        const pairs = lines.slice(i, j).map(pair => {
          const match = pair.match(PAIR)!
          return [match[1]!.trim(), match[2]!.trim()] as [string, string]
        })
        flush()
        segments.push({ kind: 'pairs', pairs, source: lines.slice(i, j).join('\n') })
        i = j
        continue
      }
    }
    prose.push(line)
    i++
  }
  flush()
  return segments
}

/** Inline markdown a cell or a task carries, as plain text: the marks dropped, the words kept. */
export const plainOf = (text: string): string =>
  text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/(?<![*\w])\*([^*]+)\*(?!\*)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
