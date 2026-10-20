/** What a tool does, for its color and its glyph on the row. */
export type Kind = 'read' | 'write' | 'run' | 'search' | 'web' | 'mcp' | 'other'

const KINDS: Record<string, Kind> = {
  Read: 'read',
  NotebookRead: 'read',
  Edit: 'write',
  MultiEdit: 'write',
  Write: 'write',
  NotebookEdit: 'write',
  Bash: 'run',
  PowerShell: 'run',
  Grep: 'search',
  Glob: 'search',
  LS: 'search',
  WebFetch: 'web',
  WebSearch: 'web',
}

// Claude Code keeps these: subagents, plan mode, tasks and the permission dialog cannot be
// redrawn faithfully.
const KEPT = new Set(['Agent', 'Task', 'TaskCreate', 'TaskUpdate', 'TaskList', 'TodoWrite', 'ExitPlanMode', 'EnterPlanMode', 'AskUserQuestion'])

export const isKept = (tool: string): boolean => KEPT.has(tool)

export const kindOf = (tool: string): Kind => KINDS[tool] ?? (tool.startsWith('mcp__') ? 'mcp' : 'other')

/** Reads and searches: what the grouped row counts and what quiet reads fold. */
export const isQuiet = (tool: string): boolean => {
  const kind = kindOf(tool)
  return kind === 'read' || kind === 'search'
}

/** The glyph a kind shows on the desktop, where the row carries an icon instead of a node. */
export const ICONS: Record<Kind, string> = { read: '◇', write: '✎', run: '▶', search: '⌕', web: '◎', mcp: '⬡', other: '•' }

const record = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}

const text = (value: unknown): string | null => (typeof value === 'string' && value !== '' ? value : null)

/** A path as the row shows it: relative to the session's folder when it lies inside it. */
export const shortPath = (path: string, cwd: string | null): string => {
  const slash = path.replace(/\\/g, '/')
  const root = cwd?.replace(/\\/g, '/').replace(/\/$/, '')
  if (root !== undefined && root !== '' && slash.toLowerCase().startsWith(`${root.toLowerCase()}/`)) return slash.slice(root.length + 1)
  return slash
}

export const pathOf = (input: unknown): string | null => {
  const held = record(input)
  return text(held.file_path) ?? text(held.notebook_path) ?? text(held.path)
}

/** What the call was about, in one line: the path, the command, the pattern, the address, the skill. */
export const targetOf = (tool: string, input: unknown, cwd: string | null): string => {
  const target = rawTargetOf(tool, input, cwd)
  // A target that only says the tool's name again would read `Skill Skill`.
  return target === tool ? '' : target
}

const rawTargetOf = (tool: string, input: unknown, cwd: string | null): string => {
  const held = record(input)
  const path = pathOf(input)
  if (tool === 'Skill') return text(held.skill) ?? text(held.command) ?? ''
  switch (kindOf(tool)) {
    case 'read':
    case 'write':
      return path === null ? '' : shortPath(path, cwd)
    case 'run':
      return (text(held.command) ?? '').split('\n')[0]!
    case 'search':
      return [text(held.pattern), path === null ? null : shortPath(path, cwd)].filter(Boolean).join(' · ')
    case 'web':
      return text(held.url) ?? text(held.query) ?? ''
    default:
      // The row's name is already the tool's own; anything more would repeat it.
      return ''
  }
}

/** What Claude Code writes on a call it cut, kept in its words whatever the mod's language. */
export const INTERRUPTED = 'Interrupted'

/** Lines added and removed, from the patch the tool reported, or from what it was asked. */
export const diffstatOf = (tool: string, input: unknown, output: unknown): { added: number; removed: number } | null => {
  if (kindOf(tool) !== 'write') return null
  const patches = record(output).structuredPatch
  if (Array.isArray(patches)) {
    let added = 0
    let removed = 0
    for (const patch of patches) {
      for (const line of (record(patch).lines as unknown[]) ?? []) {
        if (typeof line !== 'string') continue
        if (line.startsWith('+')) added++
        else if (line.startsWith('-')) removed++
      }
    }
    return { added, removed }
  }
  const held = record(input)
  const lines = (value: unknown) => (typeof value === 'string' && value !== '' ? value.split('\n').length : 0)
  if (tool === 'Write') return { added: lines(held.content), removed: 0 }
  if (tool === 'Edit') return { added: lines(held.new_string), removed: lines(held.old_string) }
  return null
}

export const isCreatedOf = (tool: string, output: unknown): boolean => tool === 'Write' && record(output).type === 'create'

/** The call's input as the opened row shows it: one `key: value` per line. */
export const inputTextOf = (input: unknown): string =>
  Object.entries(record(input))
    .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
    .join('\n')

/** The call's answer as the opened row shows it: the text a person would read, not the record. */
export const outputTextOf = (tool: string, output: unknown): string => {
  if (typeof output === 'string') return output
  const held = record(output)
  if (tool === 'Read') return text(record(held.file).content) ?? ''
  if (tool === 'Bash' || tool === 'PowerShell') return [text(held.stdout), text(held.stderr)].filter(Boolean).join('\n')
  if (tool === 'Grep' || tool === 'Glob') return text(held.content) ?? (Array.isArray(held.filenames) ? held.filenames.join('\n') : '')
  if (tool === 'WebFetch') return text(held.result) ?? ''
  if (output === undefined) return ''
  return JSON.stringify(output, null, 2)
}

/** A time as the row shows it: `0.4s`, `41s`, `1m 4s`. */
export const timeOf = (ms: number): string => {
  if (ms < 10_000) return `${(ms / 1000).toFixed(1)}s`
  const seconds = Math.round(ms / 1000)
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

/** A text cut to `head` lines and `tail` lines, with how many were left out between them. */
export const clipLines = (lines: readonly string[], head: number, tail: number): { head: string[]; hidden: number; tail: string[] } =>
  lines.length <= head + tail
    ? { head: [...lines], hidden: 0, tail: [] }
    : { head: lines.slice(0, head), hidden: lines.length - head - tail, tail: lines.slice(lines.length - tail) }
