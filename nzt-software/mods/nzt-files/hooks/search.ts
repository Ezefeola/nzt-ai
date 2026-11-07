import type { Entry, Listing, Mark } from '../types'

import { ancestorsOf, folderOf, nameOf } from './tree'

/** The most matches the tree shows of one search. */
export const MAX_MATCHES = 60

/** Folders the search does not walk into: they stay in the tree, opened by hand. */
export const HEAVY = new Set(['.git', 'node_modules', 'bin', 'obj', 'dist', 'target'])

/** One file or folder of the project as the search knows it. */
export type Indexed = { path: string; isDir: boolean; size: number; mtimeMs: number }

/** The paths that hold `query`, without case, in the order walked: at most `MAX_MATCHES`. */
export const matchesOf = (index: Indexed[], query: string): Indexed[] => {
  const wanted = query.trim().toLowerCase()
  if (wanted === '') return []
  const found: Indexed[] = []
  for (const item of index) {
    if (!item.path.toLowerCase().includes(wanted)) continue
    found.push(item)
    if (found.length === MAX_MATCHES) break
  }
  return found
}

/**
 * The listings and open folders that show the matches in the tree: each match under the
 * folders that hold it, those folders open, nothing else. A deleted file is not on disk to be
 * walked, so `marks` keeps only the deletions that are not matches, which the tree would
 * otherwise put back in every folder shown.
 */
export const searchTreeOf = (matches: Indexed[], marks: Record<string, Mark>) => {
  const listings: Record<string, Listing> = { '': { kind: 'ok', entries: [] } }
  const open = new Set<string>()
  const add = (folder: string, entry: Entry) => {
    const listing = (listings[folder] ??= { kind: 'ok', entries: [] }) as { kind: 'ok'; entries: Entry[] }
    if (!listing.entries.some(own => own.name === entry.name)) listing.entries.push(entry)
  }
  for (const match of matches) {
    for (const folder of ancestorsOf(match.path)) {
      open.add(folder)
      add(folderOf(folder), { name: nameOf(folder), isDir: true, size: 0, mtimeMs: 0 })
    }
    add(folderOf(match.path), { name: nameOf(match.path), isDir: match.isDir, size: match.size, mtimeMs: match.mtimeMs })
  }
  const kept: Record<string, Mark> = {}
  for (const [path, mark] of Object.entries(marks)) if (mark !== 'D') kept[path] = mark
  return { listings, open: [...open], marks: kept }
}
