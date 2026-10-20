/** What the tree paints of Claude's work. The commit's green shows whenever something does. */
export type ActivityShown = 'read-write' | 'write' | 'read' | 'none'

/** What the column at the right of each row shows. */
export type Column = 'date' | 'age' | 'size'

/** Which glyphs the rows' icons are drawn with; `auto` is Nerd Font only where it is known to be there. */
export type Icons = 'auto' | 'nerd' | 'unicode'

/** The mod's settings, as `/config` holds them under `nzt-files`. */
export type Settings = {
  activity: ActivityShown
  follow: boolean
  openAtStart: boolean
  column: Column
  openWith: string
  icons: Icons
  notices: boolean
}

const oneOf = <T extends string>(value: unknown, options: readonly T[], fallback: T): T =>
  options.includes(value as T) ? (value as T) : fallback

const flag = (value: unknown, fallback: boolean) => (typeof value === 'boolean' ? value : fallback)

/** The settings from the mod's options; anything missing or unknown is its default. */
export const settingsOf = (options: Readonly<Record<string, unknown>>): Settings => ({
  activity: oneOf(options.activity, ['read-write', 'write', 'read', 'none'] as const, 'read-write'),
  follow: flag(options.follow, true),
  openAtStart: flag(options.openAtStart, true),
  column: oneOf(options.column, ['date', 'age', 'size'] as const, 'date'),
  openWith: typeof options.openWith === 'string' ? options.openWith.trim() : '',
  icons: oneOf(options.icons, ['auto', 'nerd', 'unicode'] as const, 'auto'),
  notices: flag(options.notices, true),
})
