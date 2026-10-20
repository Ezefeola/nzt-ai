import type { BarMark, Branch, Entry, Listing, Mark } from '../types'

import { ancestorsOf, folderOf, nameOf } from './tree'

/**
 * The branch from the first entry `git status --porcelain=v1 -z --branch` gives:
 * `## main...origin/main [ahead 2, behind 1]`, `## main` with no remote one, `## HEAD (no
 * branch)` on a loose commit (its id is asked apart), `## No commits yet on main`.
 */
export const branchOf = (out: string): Branch | 'detached' | undefined => {
  const line = out.split('\0')[0] ?? ''
  if (!line.startsWith('## ')) return undefined
  const rest = line.slice(3)
  if (rest.startsWith('HEAD (no branch)')) return 'detached'
  const unborn = /^(?:No commits yet on|Initial commit on) (.+)$/.exec(rest)
  if (unborn !== null) return { kind: 'branch', name: unborn[1]!, ahead: 0, behind: 0 }
  const found = /^(.+?)(?:\.\.\.(\S+))?(?: \[(.+)\])?$/.exec(rest)
  if (found === null) return undefined
  const counts = found[3] ?? ''
  const ahead = /ahead (\d+)/.exec(counts)
  const behind = /behind (\d+)/.exec(counts)
  return {
    kind: 'branch',
    name: found[1]!,
    ...(found[2] === undefined ? {} : { upstream: found[2] }),
    ahead: ahead === null ? 0 : Number(ahead[1]),
    behind: behind === null ? 0 : Number(behind[1]),
  }
}

/**
 * The lines each file gained and lost, from `git diff HEAD --numstat -z`, by path from the
 * project's folder (`prefix` as in marksOf). A binary file, which git counts as `-`, is left
 * out; a rename counts on its new path.
 */
export const linesOf = (out: string, prefix = ''): Record<string, [number, number]> => {
  const parts = out.split('\0')
  const lines: Record<string, [number, number]> = {}
  for (let i = 0; i < parts.length; i++) {
    const found = /^(\d+|-)\t(\d+|-)\t(.*)$/s.exec(parts[i] ?? '')
    if (found === null) continue
    let path = found[3]!
    // A rename leaves the path empty and gives the old and the new one next.
    if (path === '') {
      i++
      path = parts[++i] ?? ''
    }
    if (found[1] === '-' || !path.startsWith(prefix)) continue
    lines[path.slice(prefix.length)] = [Number(found[1]), Number(found[2])]
  }
  return lines
}

/**
 * One row of a file drawn as a diff against the last commit: its text, kept (` `), added (`+`)
 * or removed (`-`), its number in the last commit and in the file now. A removed line takes the
 * number of the line now after it; an added one, of the line of the commit after it.
 */
export type DiffLine = { op: ' ' | '+' | '-'; text: string; old: number; now: number }

/**
 * The whole file as a diff: the hunks of `git diff HEAD -U0`, with the lines between them taken
 * from `lines`, the file now. A file cut short (`isWhole` false) ends at its last line, without
 * what was removed after it.
 */
export const diffLinesOf = (diff: string, lines: string[], isWhole = true): DiffLine[] => {
  const out: DiffLine[] = []
  let old = 1
  let now = 1
  let inHunk = false
  const keepUntil = (line: number) => {
    while (now < line && now <= lines.length) out.push({ op: ' ', text: lines[now - 1]!, old: old++, now: now++ })
  }
  for (const raw of diff.split('\n')) {
    const header = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(raw)
    if (header !== null) {
      const start = Number(header[1])
      // A hunk that only removes names the line it went after.
      keepUntil(header[2] === '0' ? start + 1 : start)
      inHunk = true
      continue
    }
    if (!inHunk) continue
    const text = raw.slice(1).replace(/\r$/, '')
    if (raw[0] === '-') out.push({ op: '-', text, old: old++, now })
    else if (raw[0] === '+') out.push({ op: '+', text, old, now: now++ })
    else if (raw[0] === ' ') out.push({ op: ' ', text, old: old++, now: now++ })
  }
  keepUntil(lines.length + 1)
  return isWhole ? out : out.filter(line => line.now <= lines.length)
}

/** A file git sees as new: every one of its lines added. */
export const allAddedOf = (lines: string[]): DiffLine[] => lines.map((text, at) => ({ op: '+', text, old: 1, now: at + 1 }))

/** Whether a diff holds any change at all. */
export const hasChange = (lines: DiffLine[]) => lines.some(line => line.op !== ' ')

/**
 * What a stretch of a diff changed, as the change map of the scroll bar colors it: only added,
 * only removed, or both; and where its first change is in the stretch.
 */
export const changeOf = (lines: DiffLine[]): { kind: BarMark; at: number } | undefined => {
  const at = lines.findIndex(line => line.op !== ' ')
  if (at < 0) return undefined
  const ops = new Set(lines.map(line => line.op))
  return { kind: ops.has('+') && ops.has('-') ? 'change' : ops.has('+') ? 'add' : 'delete', at }
}

/** The rows a diff line takes in `Code` at `columns` cells, its text wrapping under the gutter of the widest number. */
const diffRowsOf = (lines: DiffLine[], columns: number) => {
  const widest = lines.reduce((max, line) => Math.max(max, line.old, line.now), 1)
  const room = Math.max(8, columns - String(widest).length - 3)
  return (line: DiffLine) => Math.max(1, Math.ceil(line.text.replace(/\t/g, '    ').length / room))
}

/** Lines of a diff back into the one hunk `Code` draws them from, its header counted again. */
export const sourceOfDiff = (lines: DiffLine[]) => {
  const first = lines[0]
  if (first === undefined) return ''
  const oldCount = lines.filter(line => line.op !== '+').length
  const nowCount = lines.filter(line => line.op !== '-').length
  // An empty side of a hunk names the line before it.
  const oldStart = oldCount === 0 ? first.old - 1 : first.old
  const nowStart = nowCount === 0 ? first.now - 1 : first.now
  return [`@@ -${oldStart},${oldCount} +${nowStart},${nowCount} @@`, ...lines.map(line => `${line.op}${line.text}`)].join('\n')
}

/**
 * The lines of a diff a window of `rows` rows shows from line `top`, clamped so the window never
 * runs past the end, as textWindow does for a file.
 */
export const diffWindow = (lines: DiffLine[], top: number, rows: number, columns: number) => {
  const size = diffRowsOf(lines, columns)
  let last = lines.length
  for (let used = 0; last > 0 && used + size(lines[last - 1]!) <= rows; last--) used += size(lines[last - 1]!)
  const first = Math.max(0, Math.min(Number.isFinite(top) ? Math.floor(top) : 0, last))
  let count = 0
  for (let used = 0; first + count < lines.length && used + size(lines[first + count]!) <= rows; count++) {
    used += size(lines[first + count]!)
  }
  return { first, count: Math.min(lines.length - first, Math.max(1, count)), total: lines.length, lastTop: last }
}

/**
 * Only the changed files and the folders that hold them, all open, for ± Changes. Each entry
 * keeps the size and date its folder's listing gave, when that folder was read; a deleted file
 * is left to the tree, which puts it back struck through.
 */
export const changedTreeOf = (marks: Record<string, Mark>, known: Record<string, Listing>) => {
  const listings: Record<string, Listing> = { '': { kind: 'ok', entries: [] } }
  const open = new Set<string>()
  const add = (folder: string, entry: Entry) => {
    const listing = (listings[folder] ??= { kind: 'ok', entries: [] }) as { kind: 'ok'; entries: Entry[] }
    if (!listing.entries.some(own => own.name === entry.name)) listing.entries.push(entry)
  }
  const fromDisk = (path: string, isDir: boolean): Entry => {
    const listing = known[folderOf(path)]
    const own = listing?.kind === 'ok' ? listing.entries.find(entry => entry.name === nameOf(path)) : undefined
    return own ?? { name: nameOf(path), isDir, size: 0, mtimeMs: 0 }
  }
  for (const [path, mark] of Object.entries(marks)) {
    for (const folder of ancestorsOf(path)) {
      open.add(folder)
      listings[folder] ??= { kind: 'ok', entries: [] }
      // A folder gone with everything in it the tree puts back from the deletions.
      if (Object.entries(marks).some(([held, own]) => own !== 'D' && held.startsWith(`${folder}/`))) add(folderOf(folder), fromDisk(folder, true))
    }
    if (mark !== 'D') add(folderOf(path), fromDisk(path, false))
  }
  return { listings, open: [...open] }
}

/** How many files of each mark every folder holds, at any depth. */
export const countsOf = (marks: Record<string, Mark>): Record<string, Partial<Record<Mark, number>>> => {
  const counts: Record<string, Partial<Record<Mark, number>>> = {}
  for (const [path, mark] of Object.entries(marks)) {
    for (let folder = folderOf(path); folder !== ''; folder = folderOf(folder)) {
      const own = (counts[folder] ??= {})
      own[mark] = (own[mark] ?? 0) + 1
    }
  }
  return counts
}

/** The order a folder's counts are written in, as the explorer of VS Code reads them. */
export const COUNT_ORDER: readonly Mark[] = ['U', 'A', 'M', 'D']

/** The git and GitHub operations the last row of the pane follows. */
const OPS = new Set(['commit', 'push', 'pull', 'fetch', 'checkout', 'switch', 'merge', 'rebase', 'stash', 'reset', 'tag'])

/** Options of git that take the next word as their value, so it is not the subcommand. */
const VALUED = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace'])

/** A command line cut into the commands it chains: `&&`, `||`, `;`, `|` and new lines. */
export const segmentsOf = (command: string) =>
  command
    .split(/&&|\|\||[;|\n]/)
    .map(segment => wordsOf(segment.trim()))
    .filter(words => words.length > 0)

/** A command's words, with the quotes around a word taken off. */
export const wordsOf = (segment: string) =>
  [...segment.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map(found => found[1] ?? found[2] ?? found[3]!)

/**
 * The git operations a shell command runs, in order, each once: `git commit`, `git -C x push`,
 * `gh pr create` as `pr`. Anything else is not one.
 */
export const gitOpsOf = (command: string): string[] => {
  const ops: string[] = []
  for (const words of segmentsOf(command)) {
    const tool = (words[0] ?? '').replace(/\.exe$/i, '').toLowerCase()
    let op: string | undefined
    if (tool === 'git') {
      let i = 1
      while (i < words.length && words[i]!.startsWith('-')) i += VALUED.has(words[i]!) ? 2 : 1
      const sub = words[i]
      if (sub !== undefined && OPS.has(sub)) op = sub
    } else if (tool === 'gh' && words[1] === 'pr') op = 'pr'
    if (op !== undefined && !ops.includes(op)) ops.push(op)
  }
  return ops
}
