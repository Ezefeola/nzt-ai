import type { Change, Diff, Mark, Snapshot } from '../types'

/** The tree every repository has: the base of a repository with no commit yet. */
export const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904'

/** The most characters one `Code` element draws. */
export const DIFF_LIMIT = 100000

const CONFLICTS = new Set(['DD', 'AU', 'UD', 'UA', 'DU', 'AA', 'UU'])

const markOf = (xy: string): Mark | undefined => {
  if (CONFLICTS.has(xy)) return '!'
  if (xy === '??') return 'A'
  const [x, y] = [xy[0], xy[1]]
  // Added to the index and deleted from the tree: it exists neither in HEAD nor on disk.
  if (x === 'A' && y === 'D') return undefined
  if (x === 'R' || y === 'R') return 'R'
  if (x === 'A' || x === 'C') return 'A'
  if (x === 'D' || y === 'D') return 'D'
  return 'M'
}

/**
 * The files `git status --porcelain=v1 -z` lists, uncounted. A rename's entry is followed
 * by its old path.
 */
export const parseStatus = (out: string): Change[] => {
  const parts = out.split('\0')
  const files: Change[] = []
  for (let i = 0; i < parts.length; i++) {
    const entry = parts[i] ?? ''
    if (entry.length < 4) continue
    const xy = entry.slice(0, 2)
    const path = entry.slice(3)
    const isRename = xy[0] === 'R' || xy[0] === 'C' || xy[1] === 'R' || xy[1] === 'C'
    const from = isRename ? parts[++i] : undefined
    const mark = markOf(xy)
    if (mark === undefined) continue
    files.push({
      path,
      ...(mark === 'R' && from !== undefined ? { from } : {}),
      mark,
      added: null,
      removed: null,
      isBinary: false,
      isUntracked: xy === '??',
    })
  }
  return files
}

export type Count = { added: number; removed: number; isBinary: boolean }

/** `git diff --numstat -z` by the file's current path; a binary file counts `-`. */
export const parseNumstat = (out: string): Map<string, Count> => {
  const counts = new Map<string, Count>()
  const parts = out.split('\0')
  for (let i = 0; i < parts.length; i++) {
    const fields = (parts[i] ?? '').split('\t')
    if (fields.length < 3) continue
    const [added, removed, path] = fields
    // A rename leaves the path empty and gives the old and new paths as the next two parts.
    const current = path === '' ? parts[(i += 2)] : path
    if (current === undefined) continue
    const isBinary = added === '-'
    counts.set(current, {
      added: isBinary ? 0 : Number(added),
      removed: isBinary ? 0 : Number(removed),
      isBinary,
    })
  }
  return counts
}

/** A file's lines, the newline that ends the last one not opening another. */
const linesOf = (text: string) => {
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  if (lines[lines.length - 1] === '') lines.pop()
  return lines
}

export const isBinaryText = (text: string) => text.includes('\0')

export const countLines = (text: string) => linesOf(text).length

/** Tab and newline are the only control characters `Code` draws. */
const drawable = (text: string) =>
  text.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '?')

/** A new file as one hunk of added lines; an empty file has no hunk at all. */
export const addedDiffOf = (text: string): Diff => {
  if (isBinaryText(text)) return { kind: 'binary' }
  const lines = linesOf(drawable(text))
  if (lines.length === 0) return { kind: 'empty' }
  return clip(`@@ -0,0 +1,${lines.length} @@\n${lines.map(line => `+${line}`).join('\n')}`)
}

const HUNK = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@(.*)$/

/**
 * The hunks of a diff that fit in `limit` characters. A diff cut inside a hunk does not
 * parse, so the last hunk kept gets its header recounted to the lines that stayed.
 */
const clip = (hunks: string, limit = DIFF_LIMIT): Diff => {
  const lines = hunks.split('\n')
  if (hunks.length <= limit) return { kind: 'text', source: hunks, cutLines: 0 }

  const kept: string[] = []
  let size = 0
  for (const line of lines) {
    if (size + line.length + 1 > limit) break
    kept.push(line)
    size += line.length + 1
  }
  const header = kept.map(line => line.startsWith('@@')).lastIndexOf(true)
  if (header === kept.length - 1) kept.pop()
  else if (header >= 0) {
    const body = kept.slice(header + 1)
    const removed = body.filter(line => line.startsWith('-')).length
    const added = body.filter(line => line.startsWith('+')).length
    const context = body.filter(line => line.startsWith(' ') || line === '').length
    kept[header] = (kept[header] ?? '').replace(
      HUNK,
      (_, from, to, rest) => `@@ -${from},${context + removed} +${to},${context + added} @@${rest}`,
    )
  }
  return { kind: 'text', source: kept.join('\n'), cutLines: lines.length - kept.length }
}

/** What `git diff` printed for one file, as the pane draws it. */
export const diffOf = (raw: string, limit = DIFF_LIMIT): Diff => {
  const text = drawable(raw)
  if (/^Binary files .* differ$/m.test(text) || text.includes('GIT binary patch')) {
    return { kind: 'binary' }
  }
  const start = text.search(/^@@/m)
  if (start < 0) {
    return /^rename from /m.test(text) ? { kind: 'moved' } : { kind: 'empty' }
  }
  return clip(text.slice(start).replace(/\n$/, ''), limit)
}

export type Group = { folder: string; files: Change[] }

export const folderOf = (path: string) => path.slice(0, Math.max(0, path.lastIndexOf('/')))
export const nameOf = (path: string) => path.slice(path.lastIndexOf('/') + 1)

/** Files by folder: the root first, then folders and files in alphabetical order. */
export const groupsOf = (files: Change[]): Group[] => {
  const byFolder = new Map<string, Change[]>()
  for (const file of files) {
    const folder = folderOf(file.path)
    byFolder.set(folder, [...(byFolder.get(folder) ?? []), file])
  }
  return [...byFolder.entries()]
    .sort(([a], [b]) => (a === '' ? -1 : b === '' ? 1 : a.localeCompare(b)))
    .map(([folder, list]) => ({
      folder,
      files: [...list].sort((a, b) => nameOf(a.path).localeCompare(nameOf(b.path))),
    }))
}

/** The order the HEAD view groups its files in, by what happened to them. */
export const MARK_ORDER: readonly Mark[] = ['M', 'A', 'D', 'R', '!']

/** The HEAD view's steps: by mark in `MARK_ORDER`, and within one mark in folder order. */
export const treeOrderOf = (files: Change[]): Change[] =>
  MARK_ORDER.flatMap(mark => groupsOf(files.filter(file => file.mark === mark)).flatMap(group => group.files))

/**
 * `path` relative to `root`, both with `/`; undefined when it is outside. Windows paths
 * compare without case, as the file system does.
 */
export const relativeTo = (root: string, path: string) => {
  const slashed = path.replace(/\\/g, '/')
  const prefix = `${root.replace(/\\/g, '/').replace(/\/$/, '')}/`
  const isWindows = /^[A-Za-z]:\//.test(prefix)
  const matches = isWindows
    ? slashed.toLowerCase().startsWith(prefix.toLowerCase())
    : slashed.startsWith(prefix)
  return matches ? slashed.slice(prefix.length) : undefined
}

/** Where the repository is and what its changes are measured against. */
export type Repo = { root: string; base: string }

/** What one untracked file counts once read: its lines, or binary. */
export const countOf = (text: string): Count =>
  isBinaryText(text)
    ? { added: 0, removed: 0, isBinary: true }
    : { added: countLines(text), removed: 0, isBinary: false }

/** The status entries with their line counts filled in where they are known. */
export const countedOf = (files: Change[], counts: (file: Change) => Count | null): Change[] =>
  files.map(file => {
    const count = counts(file)
    return count === null
      ? file
      : { ...file, added: count.added, removed: count.removed, isBinary: count.isBinary }
  })

/** A snapshot as a string a reread compares with the last one. */
export const keyOf = (snapshot: Snapshot) => JSON.stringify(snapshot)
