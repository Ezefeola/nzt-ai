/** What git says about a file against the last commit: modified, untracked, added, deleted. */
export type Mark = 'M' | 'U' | 'A' | 'D'

/** One entry of a folder as the tree lists it; `size` and `mtimeMs` are 0 for a folder. */
export type Entry = { name: string; isDir: boolean; size: number; mtimeMs: number }

/** A folder's entries once read, or why they could not be. */
export type Listing = { kind: 'ok'; entries: Entry[] } | { kind: 'error'; message: string }

/**
 * Where the repository stands: the branch, the remote one it follows and how many commits it
 * is ahead and behind; on a loose commit, its short id.
 */
export type Branch =
  | { kind: 'branch'; name: string; upstream?: string; ahead: number; behind: number }
  | { kind: 'detached'; commit: string }

/**
 * The marks of the project's changed files, by path from the project's folder with `/`, the
 * lines each modified file gained and lost, and the branch.
 */
export type Marks =
  | { kind: 'idle' }
  | { kind: 'norepo' }
  | { kind: 'ok'; files: Record<string, Mark>; lines: Record<string, [number, number]>; branch?: Branch }

/** What the change map of the scroll bar colors a stretch of the file with: added, removed, or both. */
export type BarMark = 'add' | 'change' | 'delete'

/**
 * The file the viewer shows. `lines` is how many lines the file has; `shown` how many the
 * viewer keeps; `size` its bytes; `changes` what git said of the file when its diff against the
 * last commit was read, null when it has none to show.
 */
export type Opened =
  | { kind: 'loading' }
  | { kind: 'text'; lines: number; shown: number; size: number; changes: string | null }
  | { kind: 'binary'; size: number }
  | { kind: 'tooBig'; size: number }
  | { kind: 'deleted' }
  | { kind: 'gone' }
  | { kind: 'error'; message: string }

/**
 * Where the person is: the open folders, the chosen file and the row the keys act on, by path
 * from the project's folder; `treeTop` the first tree row shown, null while the tree follows
 * the cursor; `viewTop` the first line of the file shown (in the drawn Markdown, its first
 * block); `expanded` the file over the whole pane; `markdown` whether a Markdown file is drawn;
 * `search` what is typed in the search; `sized` the Σ button's choice, null for the setting's;
 * `changesOnly` whether the tree shows only what changed since the last commit.
 */
export type Explorer = {
  open: string[]
  selected: string | null
  cursor: string | null
  treeTop: number | null
  viewTop: number
  opened: Opened | null
  expanded: boolean
  markdown: boolean
  search: string
  sized: boolean | null
  changesOnly: boolean
}

/** What Claude is doing to a file: reading, writing or committing it; `isFading` once it ended well. */
export type Doing = { kind: 'read' | 'write' | 'commit'; isFading: boolean }

/** The git operation Claude ran last, while it runs and for a while after it ends. */
export type GitOp = { op: string; state: 'running' | 'done' | 'failed'; detail?: string }

/** A folder's size in bytes, `pending` while it is counted, `failed` when it could not be. */
export type Size = number | 'pending' | 'failed'

declare module 'claude-code' {
  interface PluginState {
    'nzt-files': {
      /** Each folder read so far, by its path from the project's folder ('' the folder itself). */
      listings: Record<string, Listing>
      marks: Marks
      explorer: Explorer
      /** What Claude is doing now, by path from the project's folder. */
      activity: Record<string, Doing>
      gitOp: GitOp | null
      /** The folders' sizes counted so far, by path from the project's folder. */
      sizes: Record<string, Size>
      /** The brief notice over the last rows: what was copied, or what could not be opened. */
      notice: string | null
    }
  }
}
