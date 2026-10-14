/** What happened to a file against HEAD: added, modified, deleted, renamed, or in conflict. */
export type Mark = 'A' | 'M' | 'D' | 'R' | '!'

/**
 * One changed file, its path relative to the repository's root with `/` separators.
 * `from` is the old path of a rename. `added` and `removed` are null when they could not
 * be counted, and both 0 for a binary file.
 */
export type Change = {
  path: string
  from?: string
  mark: Mark
  added: number | null
  removed: number | null
  isBinary: boolean
  isUntracked: boolean
}

export type Snapshot =
  | { kind: 'idle' }
  | { kind: 'norepo'; reason: string }
  | { kind: 'error'; message: string }
  | { kind: 'ok'; files: Change[] }

/** One file's diff as git gave it. `cutLines` is how many lines were left out. */
export type Diff =
  | { kind: 'text'; source: string; cutLines: number }
  | { kind: 'binary' }
  | { kind: 'moved' }
  | { kind: 'empty' }
  | { kind: 'error'; message: string }

/** A diff line: added, removed, context, or `~` where context was left out. */
export type Line = { op: '+' | '-' | ' ' | '~'; t: string }

/**
 * One edit Claude made in a turn. `file` is the path as the pane shows it; `source` is the
 * edit as unified-diff hunks numbered where it lands in the file; `more` counts the diff
 * lines past the ones kept.
 */
export type TurnStep = {
  tool: 'Edit' | 'Write' | 'NotebookEdit'
  file: string
  note?: 'replaceAll' | 'newFile' | 'rewrite'
  source: string
  more: number
  added: number
  removed: number
}

/**
 * Which view the pane shows and the step each view is on; the HEAD view's loaded diff. `diffTop`
 * is the first diff line the window shows; `indexTop` the first index line, null while the index
 * follows the current step.
 */
export type View = {
  mode: 'turn' | 'head'
  turnIndex: number
  headIndex: number
  diffTop: number
  indexTop: number | null
  diffPath: string | null
  diff: Diff | null
}

declare module 'claude-code' {
  interface PluginState {
    'nzt-changes': {
      snapshot: Snapshot
      view: View
      /** The edits of the last finished main-loop turn that had any. */
      turn: TurnStep[]
      /** Absolute paths Claude wrote or edited in this session, `/` separators. */
      touched: string[]
    }
  }
}
