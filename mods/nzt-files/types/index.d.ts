/** What git says about a file against the last commit: modified, untracked, added, deleted. */
export type Mark = 'M' | 'U' | 'A' | 'D'

/** One entry of a folder as the tree lists it. */
export type Entry = { name: string; isDir: boolean }

/** A folder's entries once read, or why they could not be. */
export type Listing = { kind: 'ok'; entries: Entry[] } | { kind: 'error'; message: string }

/** The marks of the project's changed files, by path from the project's folder with `/`. */
export type Marks = { kind: 'idle' } | { kind: 'norepo' } | { kind: 'ok'; files: Record<string, Mark> }

/**
 * The file the viewer shows. `lines` is how many lines the file has; `shown` how many the
 * viewer keeps; `size` its bytes.
 */
export type Opened =
  | { kind: 'loading' }
  | { kind: 'text'; lines: number; shown: number; size: number }
  | { kind: 'binary'; size: number }
  | { kind: 'tooBig'; size: number }
  | { kind: 'deleted' }
  | { kind: 'gone' }
  | { kind: 'error'; message: string }

/**
 * Where the person is: the open folders and the chosen file, by path from the project's folder;
 * `treeTop` the first tree row shown, null while the tree follows the chosen file; `viewTop`
 * the first line of the file shown.
 */
export type Explorer = {
  open: string[]
  selected: string | null
  treeTop: number | null
  viewTop: number
  opened: Opened | null
}

declare module 'claude-code' {
  interface PluginState {
    'nzt-files': {
      /** Each folder read so far, by its path from the project's folder ('' the folder itself). */
      listings: Record<string, Listing>
      marks: Marks
      explorer: Explorer
    }
  }
}
