import type { Entry, Listing, Mark } from '../types'

/** The only entry the tree hides. */
const HIDDEN = '.git'

/** The most lines and characters the viewer keeps of a file. */
export const MAX_LINES = 5000
export const MAX_CHARS = 1_000_000

/** Which mark a folder's dot takes when it holds several: the strongest. */
const RANK: Record<Mark, number> = { D: 3, M: 2, A: 1, U: 1 }

export const folderOf = (path: string) => path.slice(0, Math.max(0, path.lastIndexOf('/')))
export const nameOf = (path: string) => path.slice(path.lastIndexOf('/') + 1)
export const join = (folder: string, name: string) => (folder === '' ? name : `${folder}/${name}`)

/** The folders that hold `path`, outermost first: `a/b/c.ts` is held by `a` and `a/b`. */
export const ancestorsOf = (path: string) => {
  const folders: string[] = []
  for (let folder = folderOf(path); folder !== ''; folder = folderOf(folder)) folders.unshift(folder)
  return folders
}

/**
 * `path`, absolute or relative to the project's folder `root`, as a path from that folder;
 * undefined when it lies outside. On Windows the case does not tell paths apart, and Git
 * Bash's `/c/...` is `C:/...`.
 */
export const relativeTo = (root: string, path: string): string | undefined => {
  const isWindows = /^[A-Za-z]:/.test(root)
  let clean = path.trim().replace(/\\/g, '/')
  if (isWindows) clean = clean.replace(/^\/([A-Za-z])\//, (_, drive: string) => `${drive}:/`)
  const isAbsolute = clean.startsWith('/') || /^[A-Za-z]:\//.test(clean)
  const words: string[] = []
  for (const word of (isAbsolute ? clean : `${root}/${clean}`).split('/')) {
    if (word === '' || word === '.') continue
    if (word === '..') words.pop()
    else words.push(word)
  }
  const whole = (root.startsWith('/') ? '/' : '') + words.join('/')
  const same = (a: string, b: string) => (isWindows ? a.toLowerCase() === b.toLowerCase() : a === b)
  if (same(whole, root)) return ''
  if (!same(whole.slice(0, root.length + 1), `${root}/`)) return undefined
  return whole.slice(root.length + 1)
}

const markOf = (xy: string): Mark | undefined => {
  if (xy === '??') return 'U'
  const [x, y] = [xy[0], xy[1]]
  // Added to the index and deleted from the tree: it exists neither in the commit nor on disk.
  if (x === 'A' && y === 'D') return undefined
  if (x === 'A' || x === 'C' || x === 'R') return 'A'
  if (x === 'D' || y === 'D') return 'D'
  return 'M'
}

/**
 * The marks `git status --porcelain=v1 -z` gives, by path from the project's folder: `prefix`
 * is where that folder sits in the repository (`git rev-parse --show-prefix`), and a file
 * outside it is left out. A rename marks its new path added and its old one deleted.
 */
export const marksOf = (out: string, prefix = ''): Record<string, Mark> => {
  const parts = out.split('\0')
  const marks: Record<string, Mark> = {}
  const put = (path: string, mark: Mark) => {
    if (!path.startsWith(prefix)) return
    const own = path.slice(prefix.length).replace(/\/$/, '')
    if (own !== '') marks[own] = mark
  }
  for (let i = 0; i < parts.length; i++) {
    const entry = parts[i] ?? ''
    // `--branch` puts the branch first, as `## main...origin/main`.
    if (entry.length < 4 || entry.startsWith('## ')) continue
    const xy = entry.slice(0, 2)
    const isRename = xy[0] === 'R' || xy[0] === 'C'
    const from = isRename ? parts[++i] : undefined
    const mark = markOf(xy)
    if (mark !== undefined) put(entry.slice(3), mark)
    if (xy[0] === 'R' && from !== undefined) put(from, 'D')
  }
  return marks
}

/** Each folder that holds a marked file, at any depth, with its strongest mark. */
export const dotsOf = (marks: Record<string, Mark>): Record<string, Mark> => {
  const dots: Record<string, Mark> = {}
  for (const [path, mark] of Object.entries(marks)) {
    for (let folder = folderOf(path); folder !== ''; folder = folderOf(folder)) {
      const held = dots[folder]
      if (held === undefined || RANK[mark] > RANK[held]) dots[folder] = mark
    }
  }
  return dots
}

const byName = (a: Entry, b: Entry) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })

/** A folder's entries as the tree shows them: `.git` out, folders first, each group by name. */
export const sortedOf = (entries: Entry[]): Entry[] => {
  const shown = entries.filter(entry => entry.name !== HIDDEN)
  return [...shown.filter(entry => entry.isDir).sort(byName), ...shown.filter(entry => !entry.isDir).sort(byName)]
}

/**
 * A folder's entries with what was deleted since the last commit put back where it was: a
 * deleted file, or the folder that held it when that folder is gone too.
 */
export const withDeleted = (folder: string, entries: Entry[], marks: Record<string, Mark>): Entry[] => {
  const names = new Set(entries.map(entry => entry.name))
  const extra: Entry[] = []
  const prefix = folder === '' ? '' : `${folder}/`
  for (const [path, mark] of Object.entries(marks)) {
    if (mark !== 'D' || !path.startsWith(prefix)) continue
    const rest = path.slice(prefix.length)
    const cut = rest.indexOf('/')
    const name = cut < 0 ? rest : rest.slice(0, cut)
    if (names.has(name)) continue
    names.add(name)
    extra.push({ name, isDir: cut >= 0, size: 0, mtimeMs: 0 })
  }
  return sortedOf([...entries, ...extra])
}

/** One row of the tree. */
export type Row =
  | {
      kind: 'entry'
      path: string
      name: string
      depth: number
      isDir: boolean
      isOpen: boolean
      mark?: Mark
      isDeleted: boolean
      size: number
      mtimeMs: number
    }
  | { kind: 'error'; path: string; depth: number; message: string }

/** The tree's rows: each open folder's entries under it, as far as they have been read. */
export const rowsOf = (listings: Record<string, Listing>, open: string[], marks: Record<string, Mark>): Row[] => {
  const isOpen = new Set(open)
  const dots = dotsOf(marks)
  const rows: Row[] = []
  const walk = (folder: string, depth: number) => {
    const listing = listings[folder]
    if (listing === undefined) return
    if (listing.kind === 'error') {
      rows.push({ kind: 'error', path: folder, depth, message: listing.message })
      return
    }
    for (const entry of withDeleted(folder, listing.entries, marks)) {
      const path = join(folder, entry.name)
      const isDeleted = marks[path] === 'D' && !listing.entries.some(own => own.name === entry.name)
      const mark = entry.isDir ? dots[path] : marks[path]
      const opened = entry.isDir && isOpen.has(path)
      rows.push({
        kind: 'entry',
        path,
        name: entry.name,
        depth,
        isDir: entry.isDir,
        isOpen: opened,
        ...(mark === undefined ? {} : { mark }),
        isDeleted,
        size: entry.size,
        mtimeMs: entry.mtimeMs,
      })
      if (opened) walk(path, depth + 1)
    }
  }
  walk('', 0)
  return rows
}

/**
 * Which tree rows show in `rows` rows: from `top` once the person scrolled, else with the chosen
 * row in view and two rows above it. When rows are left out, the first and last shown give
 * their place to `↑ n` and `↓ n`, which count the rows they stand for.
 */
export const treeWindow = (total: number, rows: number, top: number | null, chosen: number) => {
  const lastTop = Math.max(0, total - rows)
  // A chosen row past the first window is shown below two rows of air, clear of both edges.
  const wanted = top ?? (chosen < rows - 1 ? 0 : chosen - 2)
  const from = Math.max(0, Math.min(wanted, lastTop))
  const to = Math.min(total, from + rows)
  const above = from > 0 ? from + 1 : 0
  const below = to < total ? total - to + 1 : 0
  return { from, to, lastTop, above, below }
}

/** Tab and the other control characters a `Text` refuses, made visible as spaces or `?`. */
export const printable = (text: string) => text.replace(/\t/g, '  ').replace(/[\u0000-\u001f\u007f]/g, '?')

/** Text of many lines the engine draws as written: tab and newline are its only control characters. */
export const printableLines = (text: string) => text.replace(/\r/g, '').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '?')

/** A text cut to `cells` cells, the cut marked with `…`. */
export const fit = (text: string, cells: number) =>
  text.length <= cells ? text : `${text.slice(0, Math.max(0, cells - 1))}…`

/** Text with a NUL in it is binary: no text file holds one. */
export const isBinaryText = (text: string) => text.includes('\0')

/**
 * A text file's lines as the viewer keeps them: at most `MAX_LINES` and `MAX_CHARS`, control
 * characters but tab made `?`, which `Code` would refuse; and how many lines the file has.
 */
export const contentOf = (text: string) => {
  const all = text.replace(/\r\n?/g, '\n').split('\n')
  if (all[all.length - 1] === '') all.pop()
  const kept: string[] = []
  let size = 0
  for (const line of all) {
    if (kept.length === MAX_LINES || size + line.length + 1 > MAX_CHARS) break
    kept.push(line.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '?'))
    size += line.length + 1
  }
  return { lines: kept, total: all.length }
}

/** How many of `texts`, whole and from the first, fit in `limit` characters joined by `gap` characters; at least one. */
export const fittingCount = (texts: string[], limit: number, gap = 1) => {
  let size = 0
  let count = 0
  for (const text of texts) {
    size += text.length + (count === 0 ? 0 : gap)
    if (size > limit && count > 0) break
    count++
  }
  return count
}

/**
 * The scroll bar's thumb in a track of `rows` rows: as long as the part shown is of the whole
 * (`count` of `total`), and as far down as `first` is of the last top, `lastTop`.
 */
export const thumbOf = (rows: number, first: number, count: number, total: number, lastTop: number) => {
  const size = Math.max(1, Math.min(rows, Math.round((rows * count) / Math.max(1, total))))
  const from = lastTop <= 0 ? 0 : Math.round(((rows - size) * Math.min(first, lastTop)) / lastTop)
  return { from, size }
}

/** The top a click on row `row` of a track of `rows` rows scrolls to. */
export const topAtRow = (row: number, rows: number, lastTop: number) => Math.round((lastTop * row) / Math.max(1, rows - 1))

/** How many rows a line of a file of `total` lines wraps to at `columns` cells, under its number. */
const lineRowsOf = (total: number, columns: number) => {
  const room = Math.max(8, columns - String(total).length - 1)
  return (line: string) => Math.max(1, Math.ceil(line.replace(/\t/g, '    ').length / room))
}

/**
 * The lines a window of `rows` rows shows from line `top` at `columns` cells, a long line
 * taking as many rows as it wraps to under the gutter of line numbers; clamped so the window
 * never runs past the end.
 */
export const textWindow = (lines: string[], top: number, rows: number, columns: number) => {
  const size = lineRowsOf(lines.length, columns)
  let last = lines.length
  for (let used = 0; last > 0 && used + size(lines[last - 1]!) <= rows; last--) used += size(lines[last - 1]!)
  const first = Math.max(0, Math.min(Number.isFinite(top) ? Math.floor(top) : 0, last))
  let count = 0
  for (let used = 0; first + count < lines.length && used + size(lines[first + count]!) <= rows; count++) {
    used += size(lines[first + count]!)
  }
  const shown = Math.max(count, Math.min(1, lines.length - first))
  return { first, count: shown, lastTop: last, total: lines.length }
}
