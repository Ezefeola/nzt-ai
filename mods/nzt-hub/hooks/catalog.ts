/**
 * The NZT mods the pane lists, in the catalog's order; each one's type, glyph and color. A mod
 * of type `nzt` needs an artifact of the method; a `generic` one works in any project.
 */
export const CATALOG = [
  // 'claude' is a theme key: NZT's accent, so it follows the theme.
  { id: 'nzt-state', kind: 'nzt', icon: '◆', color: 'claude' },
  { id: 'nzt-changes', kind: 'generic', icon: '±', color: '#c792ea' },
  { id: 'nzt-files', kind: 'generic', icon: '▤', color: '#6cc070' },
  { id: 'nzt-questions', kind: 'generic', icon: '?', color: '#f48fb1' },
  { id: 'nzt-look', kind: 'generic', icon: '◐', color: '#82aaff' },
] as const

export type ModId = (typeof CATALOG)[number]['id']
export type Kind = (typeof CATALOG)[number]['kind']

/** The groups the pane shows, in order: the mods of the method first, then the generic ones. */
export const GROUPS: readonly Kind[] = ['nzt', 'generic']

/** The catalog's ids by group, each group in the catalog's order; a group with no mods left out. */
export const groupsOf = <T extends { id: string }>(mods: readonly T[]) =>
  GROUPS.map(kind => ({ kind, mods: mods.filter(mod => CATALOG.find(entry => entry.id === mod.id)?.kind === kind) })).filter(
    group => group.mods.length > 0,
  )

export const MARKETPLACE = 'Ezefeola/nzt-ai'

/** What the person pastes in the prompt to install a mod from this repository. */
export const installCommand = (id: string) => `/plugin install ${id} --marketplace ${MARKETPLACE}`

/**
 * Whether the session has a mod: it registered its command, or its options show in /config
 * (every NZT mod has a language option, so a mod whose command failed to load still counts).
 */
export const isInstalled = (
  id: string,
  commands: readonly { name: string; plugin?: string }[],
  configKeys: readonly string[],
) => commands.some(c => c.name === id || c.plugin === id) || configKeys.some(key => key.startsWith(`${id}.`))

/**
 * Claude Code's list of installed plugins, beside the folder that holds this one: the
 * `.claude` folder the plugin's path runs through. Undefined when the path has none.
 */
export const installedFileOf = (pluginRoot: string) => {
  const path = pluginRoot.replace(/\\/g, '/')
  const at = path.lastIndexOf('/.claude/')
  return at < 0 ? undefined : `${path.slice(0, at)}/.claude/plugins/installed_plugins.json`
}

/**
 * Each plugin's installed version by its name, read from that list. The file is Claude
 * Code's own and undocumented: anything unexpected in it reads as no versions.
 */
export const versionsOf = (text: string): Record<string, string> => {
  try {
    const plugins = (JSON.parse(text) as { plugins?: unknown }).plugins
    if (typeof plugins !== 'object' || plugins === null) return {}
    const versions: Record<string, string> = {}
    for (const [key, installs] of Object.entries(plugins)) {
      const name = key.split('@')[0]!
      const first = Array.isArray(installs) ? installs.find(i => typeof i?.version === 'string') : undefined
      if (first !== undefined && versions[name] === undefined) versions[name] = first.version
    }
    return versions
  } catch {
    return {}
  }
}
