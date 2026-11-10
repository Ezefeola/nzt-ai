import type { Palette, Variant, VariantPref } from '../types'
import { channelsOf, hexOfChannels } from './contrast'

const deepen = (hex: string, amount: number): string => hexOfChannels(channelsOf(hex).map(value => value * (1 - amount)))

/**
 * A light palette for a theme that brings only its dark one: the surfaces near white, the
 * body text near black, and every other color deepened on its own hue. The contrast pass
 * that follows makes sure each one reads.
 */
export const toLight = (dark: Palette): Palette => ({
  read: deepen(dark.read, 0.45),
  write: deepen(dark.write, 0.45),
  run: deepen(dark.run, 0.45),
  search: deepen(dark.search, 0.45),
  web: deepen(dark.web, 0.45),
  mcp: deepen(dark.mcp, 0.45),
  other: deepen(dark.other, 0.55),
  user: deepen(dark.user, 0.45),
  fg: '#1d1f21',
  muted: '#5f6366',
  surface: '#ffffff',
  zebra: '#f1f2f3',
  ok: deepen(dark.ok, 0.5),
  err: deepen(dark.err, 0.3),
  warn: deepen(dark.warn, 0.5),
})

/** Light, dark, or null when a name says neither (`auto`, a custom slug with neither word). */
export const variantNamed = (value: unknown): Variant | null => {
  const name = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return name.includes('light') ? 'light' : name.includes('dark') ? 'dark' : null
}

/**
 * Whether Claude Code's theme is NZT oscuro or claro: `custom:<file>` for one in the person's
 * themes folder, `custom:<plugin>:<file>` for one a plugin brings.
 */
export const isNztClaudeTheme = (value: unknown): boolean =>
  typeof value === 'string' && /^custom:(?:[^:]+:)?nzt-(?:dark|light)$/i.test(value.trim())

/** `COLORFGBG` is `<fg>;<bg>` (sometimes `<fg>;<default>;<bg>`); background 7 or 15 is light. */
export const colorfgbgLight = (value: string | undefined): boolean | null => {
  if (value === undefined) return null
  const background = Number(value.split(';').at(-1))
  return Number.isNaN(background) ? null : background === 7 || background === 15
}

/**
 * The variant to draw: the one the person forced; else the one Claude Code's theme names;
 * else, under `auto`, what the terminal or the system says; dark when nothing says.
 */
export const variantOf = (pref: VariantPref, themeSetting: string | null, systemLight: boolean | null): Variant => {
  if (pref !== 'auto') return pref
  const named = variantNamed(themeSetting)
  if (named !== null) return named
  return systemLight === true ? 'light' : 'dark'
}

/** What a host command printed, read as whether the system draws light. */
export const windowsLight = (output: string): boolean | null => {
  const match = output.match(/AppsUseLightTheme\s+REG_DWORD\s+0x([0-9a-f]+)/i)
  return match === null ? null : parseInt(match[1]!, 16) === 1
}

export const macLight = (output: string, exitCode: number | null): boolean =>
  !(exitCode === 0 && output.trim().toLowerCase() === 'dark')

export const gnomeLight = (output: string): boolean | null => {
  const text = output.trim().replace(/'/g, '')
  if (text === '') return null
  return !text.includes('dark')
}
