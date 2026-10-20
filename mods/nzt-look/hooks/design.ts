import type { CustomTheme, PaletteKey } from '../types'
import { toLight } from './light'
import { CLAUDE_DRAWING, KEYS, missingOf, paletteFrom, THEMES } from './palette'

export const DESIGN_TOOL = 'design'

const paletteSchema = {
  type: 'object',
  properties: Object.fromEntries(KEYS.map(key => [key, { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' }])),
  required: [...KEYS],
}

/** What the agent reads about the tool: what each color paints, and what makes a theme valid. */
export const DESIGN_SPEC = {
  name: DESIGN_TOOL,
  description: [
    'Designs a theme for the nzt-look mod and applies it at once, when the person asks for one ("a theme that feels like a sunset").',
    'Give a short name and a dark palette of 15 colors as #rrggbb; give a light one too, or one is derived.',
    'read, write, run, search, web, mcp, other: the color of each kind of tool row.',
    'user: the accent (the prompt, headers, the band under 20%). fg: body text. muted: secondary text and rules.',
    'surface: what cards and tables are drawn on. zebra: every other table row, close to surface.',
    'ok, err, warn: success, failure and warning.',
    'Text colors should read on surface and zebra; the mod nudges any that do not, keeping their hue.',
  ].join(' '),
  inputSchema: {
    type: 'object',
    properties: { name: { type: 'string' }, dark: paletteSchema, light: paletteSchema },
    required: ['name', 'dark'],
  },
}

/** A name the theme can be kept under: lower case, dashes, never a built-in theme's. */
export const slugOf = (name: string): string => {
  const slug =
    name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 32) || 'mi-tema'
  return slug === CLAUDE_DRAWING || THEMES.some(theme => theme.name === slug) ? `mi-${slug}` : slug
}

/** The theme the agent designed, or the colors it lacks or wrote wrong. */
export const designedOf = (input: unknown): { theme: CustomTheme } | { missing: string[] } => {
  const held = typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {}
  const name = typeof held.name === 'string' && held.name.trim() !== '' ? held.name.trim() : null
  const dark = paletteFrom(held.dark)
  const lightGiven = held.light !== undefined && held.light !== null
  const light = lightGiven ? paletteFrom(held.light) : null
  const missing = [
    ...(name === null ? ['name'] : []),
    ...missingOf(held.dark).map((key: PaletteKey) => `dark.${key}`),
    ...(lightGiven ? missingOf(held.light).map((key: PaletteKey) => `light.${key}`) : []),
  ]
  if (missing.length > 0 || dark === null || name === null) return { missing }
  const slug = slugOf(name)
  return { theme: { name: slug, label: name, dark, light: light ?? toLight(dark) } }
}
