import type { BandPart, CodeColors, CustomTheme, Palette, Part, Prefs, Variant } from '../types'
import { legiblePalette } from './contrast'
import { toLight } from './light'
import { DEFAULT_THEME, paletteFrom, THEMES, themeNamed } from './palette'
import type { Theme, Words } from './palette'

export const BAND_PARTS = ['context', 'fiveHour', 'week', 'cost', 'model', 'clear'] as const satisfies readonly BandPart[]

export const PARTS = [
  'tools',
  'diffs',
  'shell',
  'tables',
  'code',
  'diagrams',
  'math',
  'callouts',
  'commands',
  'spinner',
  'links',
  'prompt',
  'fold',
  'copy',
] as const satisfies readonly Part[]

export const DEFAULT_PREFS: Prefs = {
  theme: DEFAULT_THEME,
  variant: 'auto',
  isDrawing: true,
  band: { context: true, fiveHour: true, week: true, cost: true, model: true, clear: true },
  agentLine: true,
  parts: Object.fromEntries(PARTS.map(part => [part, true])) as Record<Part, boolean>,
  calm: false,
  words: 'claude',
  quietReads: false,
  expandReads: false,
}

const record = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {}

const flag = (value: unknown, fallback: boolean): boolean => (typeof value === 'boolean' ? value : fallback)

const flags = <K extends string>(value: unknown, keys: readonly K[], fallback: Record<K, boolean>): Record<K, boolean> => {
  const held = record(value)
  return Object.fromEntries(keys.map(key => [key, flag(held[key], fallback[key])])) as Record<K, boolean>
}

/**
 * What the store held, read field by field: a field missing or of the wrong kind takes its
 * default, so a store written by another version, or broken, never stops the mod.
 */
export const parsePrefs = (value: unknown, names: readonly string[]): Prefs => {
  const held = record(value)
  return {
    theme: typeof held.theme === 'string' && names.includes(held.theme) ? held.theme : DEFAULT_PREFS.theme,
    variant: held.variant === 'dark' || held.variant === 'light' ? held.variant : 'auto',
    isDrawing: flag(held.isDrawing, true),
    band: flags(held.band, BAND_PARTS, DEFAULT_PREFS.band),
    agentLine: flag(held.agentLine, true),
    parts: flags(held.parts, PARTS, DEFAULT_PREFS.parts),
    calm: flag(held.calm, false),
    words: held.words === 'theme' ? 'theme' : 'claude',
    quietReads: flag(held.quietReads, false),
    expandReads: flag(held.expandReads, false),
  }
}

export const parseCustom = (value: unknown): CustomTheme[] => {
  if (!Array.isArray(value)) return []
  return value.flatMap(item => {
    const held = record(item)
    const dark = paletteFrom(held.dark)
    const light = paletteFrom(held.light)
    if (typeof held.name !== 'string' || dark === null || light === null) return []
    return [{ name: held.name, label: typeof held.label === 'string' ? held.label : held.name, dark, light }]
  })
}

export const parseFolders = (value: unknown, names: readonly string[]): Record<string, string> =>
  Object.fromEntries(
    Object.entries(record(value)).filter((entry): entry is [string, string] => typeof entry[1] === 'string' && names.includes(entry[1])),
  )

export const namesOf = (custom: readonly CustomTheme[]): string[] => [...THEMES.map(theme => theme.name), ...custom.map(theme => theme.name)]

/** The theme in force: the one pinned to this folder, else the one of always. */
export const themeFor = (prefs: Prefs, folders: Record<string, string>, folder: string | null): string =>
  (folder === null ? undefined : folders[folder]) ?? prefs.theme

/** A theme's palette for a variant, as it was written: its own, or derived for light. */
export const rawPaletteOf = (name: string, custom: readonly CustomTheme[], variant: Variant): Palette => {
  const own = custom.find(theme => theme.name === name)
  if (own !== undefined) return own[variant]
  const builtIn: Theme = themeNamed(name) ?? themeNamed(DEFAULT_THEME)!
  if (variant === 'dark') return builtIn.dark
  return builtIn.light ?? toLight(builtIn.dark)
}

/** The palette the mod draws with: the theme's, every text color adjusted until it reads. */
export const paletteOf = (name: string, custom: readonly CustomTheme[], variant: Variant): Palette =>
  legiblePalette(rawPaletteOf(name, custom, variant), variant)

/** A built-in theme's own colors for code in a variant; a theme of the person's own has none. */
export const codeColorsOf = (name: string, custom: readonly CustomTheme[], variant: Variant): CodeColors | null =>
  custom.some(theme => theme.name === name) ? null : ((themeNamed(name) ?? themeNamed(DEFAULT_THEME)!).code?.[variant] ?? null)

/** The words a theme says; a theme of the person's own says those of the theme it came from. */
export const wordsOf = (name: string, lang: 'es' | 'en'): Words => {
  const base = name.startsWith('mi-') ? name.slice(3) : name
  return (themeNamed(base) ?? themeNamed(DEFAULT_THEME)!).words[lang]
}

/** `mi-<tema>`: where a repaint of `name` is kept; a theme already the person's keeps its name. */
export const ownNameOf = (name: string): string => (name.startsWith('mi-') ? name : `mi-${name}`)

/** The custom themes with `theme` in place of the one of its name, or added last. */
export const withCustom = (custom: readonly CustomTheme[], theme: CustomTheme): CustomTheme[] =>
  custom.some(one => one.name === theme.name) ? custom.map(one => (one.name === theme.name ? theme : one)) : [...custom, theme]
