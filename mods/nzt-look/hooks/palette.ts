import type { CodeColors, Palette, PaletteKey } from '../types'

/** The order a palette is written in below, one color per key. */
export const KEYS = [
  'read',
  'write',
  'run',
  'search',
  'web',
  'mcp',
  'other',
  'user',
  'fg',
  'muted',
  'surface',
  'zebra',
  'ok',
  'err',
  'warn',
] as const satisfies readonly PaletteKey[]

/** The keys a theme writes text in; `surface` and `zebra` are what it is written on. */
export const TEXT_KEYS = KEYS.filter(key => key !== 'surface' && key !== 'zebra')

/** The words a theme says while a turn works and when it ends, in each language. */
export type Words = { spinner: readonly string[]; done: readonly string[] }

export type Theme = {
  name: string
  label: string
  dark: Palette
  /** Its own light palette; without one, `light.ts` derives it. */
  light: Palette | null
  words: { es: Words; en: Words }
  /** Its own colors for code in each variant; without them, code takes the palette's keys. */
  code: { dark: CodeColors; light: CodeColors } | null
}

const paletteOf = (colors: string): Palette => {
  const values = colors.split(',')
  return Object.fromEntries(KEYS.map((key, i) => [key, values[i]!])) as Palette
}

const theme = (
  name: string,
  label: string,
  dark: string,
  light: string | null,
  es: Words,
  en: Words,
  code: Theme['code'] = null,
): Theme => ({ name, label, dark: paletteOf(dark), light: light === null ? null : paletteOf(light), words: { es, en }, code })

// nzt is specs/nzt-brand.md, which rules over it: its dark palette takes the reading tones, not
// the brand's own values, which glare over a long conversation. The other fifteen carry the colors
// of the public themes they are named after.
export const THEMES: readonly Theme[] = [
  theme(
    'nzt',
    'NZT',
    '#5ccaa9,#e2d36e,#d3dfdb,#5ccaa9,#5ccaa9,#5ccaa9,#7f9893,#5ccaa9,#d3dfdb,#7f9893,#0c1918,#102221,#5ccaa9,#e8909a,#e2d36e',
    '#0b6b55,#6b5d00,#07100f,#0b6b55,#0b6b55,#0b6b55,#4d6662,#0b6b55,#07100f,#4d6662,#ffffff,#e8f2ee,#0b6b55,#b3263a,#6b5d00',
    { spinner: ['Pensando', 'Trabajando', 'Armando', 'Midiendo', 'Ajustando'], done: ['Listo', 'Hecho'] },
    { spinner: ['Thinking', 'Working', 'Building', 'Measuring', 'Tuning'], done: ['Done', 'Finished'] },
    // Most of nzt's keys are its accent, so code highlighted with them reads as one color.
    {
      dark: {
        surface: '#0a1514',
        plain: '#b9c7c3',
        keyword: '#62c4a8',
        string: '#d4c77a',
        number: '#e0a08f',
        comment: '#6f8a85',
        type: '#c8b4e8',
        function: '#9fd4e0',
        property: '#a9c4be',
      },
      light: {
        surface: '#edf5f2',
        plain: '#2b3d3a',
        keyword: '#0b6b55',
        string: '#6b5d00',
        number: '#a3402c',
        comment: '#5a716c',
        type: '#6a46a8',
        function: '#1d6878',
        property: '#3f5d57',
      },
    },
  ),
  theme(
    'noir',
    'Noir',
    '#e2e2e2,#e2e2e2,#e2e2e2,#e2e2e2,#e2e2e2,#e2e2e2,#e2e2e2,#e2e2e2,#e2e2e2,#8c8c8c,#151515,#1c1c1c,#e2e2e2,#f87171,#a3a3a3',
    '#111111,#111111,#111111,#111111,#111111,#111111,#111111,#111111,#151515,#6b6b6b,#ffffff,#f2f2f2,#151515,#c42b2b,#6b6b6b',
    { spinner: ['Pensando', 'Trabajando', 'Componiendo', 'Considerando', 'Sopesando'], done: ['Listo', 'Terminado', 'Resuelto'] },
    { spinner: ['Thinking', 'Working', 'Composing', 'Considering', 'Weighing'], done: ['Done', 'Finished', 'Settled'] },
  ),
  theme(
    'tokyo-night',
    'Tokyo Night',
    '#7dcfff,#fb9f68,#e0af68,#bb9af7,#7aa2f7,#73daca,#a9b1d6,#7aa2f7,#c0caf5,#737aa2,#1f2335,#1d2030,#9ece6a,#f7768e,#e0af68',
    '#007197,#b15c00,#8c6c3e,#7847bd,#2e7de9,#118c74,#6172b0,#2e7de9,#3760bf,#848cb5,#d0d5e3,#dfe2eb,#587539,#f52a65,#8c6c3e',
    {
      spinner: ['Encendiendo neones', 'Lloviznando', 'Resplandeciendo', 'Cableando', 'Manejando de noche', 'Esquivando la lluvia'],
      done: ['Se encendió', 'Cableó', 'Despachó', 'Aterrizó'],
    },
    { spinner: ['Neon-ing', 'Drizzling', 'Glowing', 'Wiring', 'Night-driving', 'Rain-checking'], done: ['Lit up', 'Wired', 'Shipped', 'Landed'] },
  ),
  theme(
    'dracula',
    'Dracula',
    '#8be9fd,#ffb86c,#f1fa8c,#bd93f9,#ff79c6,#5cee81,#f8f8f2,#bd93f9,#f8f8f2,#6272a4,#2b2d3a,#2a2c37,#5cee81,#f36161,#f1fa8c',
    null,
    { spinner: ['Cavilando', 'Rondando', 'Conjurando', 'Acechando', 'Tramando', 'Desvelando'], done: ['Se alzó', 'Conjuró', 'Mordió', 'Venció'] },
    { spinner: ['Brooding', 'Haunting', 'Conjuring', 'Lurking', 'Scheming', 'Unliving'], done: ['Risen', 'Conjured', 'Bitten', 'Vanquished'] },
  ),
  theme(
    'catppuccin',
    'Catppuccin Mocha',
    '#89dceb,#fab387,#f9e2af,#cba6f7,#74c7ec,#94e2d5,#bac2de,#cba6f7,#cdd6f4,#7f849c,#252536,#232334,#a6e3a1,#f38ba8,#f9e2af',
    '#04a5e5,#fe640b,#df8e1d,#8839ef,#209fb5,#179299,#5c5f77,#8839ef,#4c4f69,#8c8fa1,#e6e9ef,#eceef3,#40a02b,#d20f39,#df8e1d',
    {
      spinner: ['Ronroneando', 'Siesteando', 'Saltando', 'Amasando', 'Estirándose', 'Acurrucándose'],
      done: ['Saltó', 'Ronroneó', 'Durmió', 'Se acurrucó'],
    },
    { spinner: ['Purring', 'Napping', 'Pouncing', 'Kneading', 'Stretching', 'Nuzzling'], done: ['Pounced', 'Purred', 'Napped', 'Curled up'] },
  ),
  theme(
    'rose-pine',
    'Rosé Pine',
    '#9ccfd8,#ebbcba,#f6c177,#c4a7e7,#3e8fb0,#31748f,#908caa,#c4a7e7,#e0def4,#6e6a86,#26233a,#1f1d2e,#9ccfd8,#eb6f92,#f6c177',
    '#56949f,#d7827e,#ea9d34,#907aa9,#286983,#286983,#797593,#907aa9,#575279,#9893a5,#f2e9e1,#fffaf3,#56949f,#b4637a,#ea9d34',
    { spinner: ['Floreciendo', 'Podando', 'Infusionando', 'Deshojando', 'Marchitando', 'Trepando'], done: ['Floreció', 'Podó', 'Infusionó', 'Plantó'] },
    { spinner: ['Blooming', 'Pruning', 'Steeping', 'Petaling', 'Wilting', 'Climbing'], done: ['Bloomed', 'Pruned', 'Steeped', 'Planted'] },
  ),
  theme(
    'nord',
    'Nord',
    '#8fbcbb,#d08770,#ebcb8b,#b48ead,#5e81ac,#88c0d0,#d8dee9,#88c0d0,#e5e9f0,#7b88a1,#3b4252,#353b49,#a3be8c,#bf616a,#ebcb8b',
    null,
    { spinner: ['Derivando', 'Escarchando', 'Enfriando', 'Deshelando', 'Esquiando', 'Deslizándose'], done: ['Congeló', 'Deshieló', 'Trazó', 'Cruzó'] },
    { spinner: ['Drifting', 'Frosting', 'Chilling', 'Thawing', 'Skiing', 'Gliding'], done: ['Frozen', 'Thawed', 'Charted', 'Crossed'] },
  ),
  theme(
    'gruvbox',
    'Gruvbox',
    '#83a598,#d48443,#b8bb26,#d3869b,#8ec07c,#deb24b,#ebdbb2,#deb24b,#ebdbb2,#928374,#32302f,#2f2c2a,#b8bb26,#e15d4e,#d48443',
    null,
    { spinner: ['Preparando', 'Tostando', 'Hirviendo', 'Dorando', 'Filtrando', 'Encendiendo'], done: ['Preparó', 'Tostó', 'Doró', 'Sirvió'] },
    { spinner: ['Brewing', 'Roasting', 'Simmering', 'Toasting', 'Percolating', 'Kindling'], done: ['Brewed', 'Roasted', 'Toasted', 'Served'] },
  ),
  theme(
    'kanagawa',
    'Kanagawa',
    '#7fb4ca,#fca169,#e6c384,#957fb8,#7e9cd8,#7aa89f,#c8c093,#7e9cd8,#dcd7ba,#727169,#2a2a37,#232330,#98bb6c,#e46876,#e6c384',
    '#4e8ca2,#cc6d00,#836f4a,#624c83,#4d699b,#597b75,#716e61,#4d699b,#545464,#8a8980,#e7dba0,#ede5b4,#6f894e,#c84053,#836f4a',
    { spinner: ['Coronando la ola', 'Entintando', 'Pincelando', 'Creciendo', 'Rompiendo', 'Bajando'], done: ['Coronó', 'Entintó', 'Pinceló', 'Rompió'] },
    { spinner: ['Cresting', 'Inking', 'Brushing', 'Swelling', 'Breaking', 'Ebbing'], done: ['Crested', 'Inked', 'Brushed', 'Broken'] },
  ),
  theme(
    'everforest',
    'Everforest',
    '#7fbbb3,#e69875,#dbbc7f,#d699b6,#83c092,#83c092,#9da9a0,#a7c080,#d3c6aa,#859289,#3d484d,#343f44,#a7c080,#e67e80,#dbbc7f',
    '#3a94c5,#f57d26,#dfa000,#df69ba,#35a77c,#35a77c,#829181,#8da101,#5c6a72,#939f91,#efebd4,#f4f0d9,#8da101,#f85552,#dfa000',
    {
      spinner: ['Recolectando', 'Echando raíces', 'Brotando', 'Caminando', 'Cubriendo de musgo', 'Ramificando'],
      done: ['Creció', 'Arraigó', 'Recolectó', 'Acampó'],
    },
    { spinner: ['Foraging', 'Rooting', 'Sprouting', 'Hiking', 'Mossing', 'Branching'], done: ['Grown', 'Rooted', 'Foraged', 'Camped'] },
  ),
  theme(
    'one-dark',
    'One Dark',
    '#56b6c2,#d19a66,#e5c07b,#c678dd,#61afef,#56b6c2,#abb2bf,#61afef,#abb2bf,#5c6370,#2c313a,#262a31,#98c379,#e06c75,#e5c07b',
    '#0184bc,#986801,#c18401,#a626a4,#4078f2,#0184bc,#696c77,#4078f2,#383a42,#a0a1a7,#f0f0f1,#f5f5f6,#50a14f,#e45649,#c18401',
    { spinner: ['Compilando', 'Linteando', 'Atomizando', 'Empaquetando', 'Indexando', 'Parseando'], done: ['Compiló', 'Linteó', 'Empaquetó', 'Indexó'] },
    { spinner: ['Compiling', 'Linting', 'Atomizing', 'Bundling', 'Indexing', 'Parsing'], done: ['Built', 'Linted', 'Bundled', 'Indexed'] },
  ),
  theme(
    'solarized',
    'Solarized',
    '#2aa198,#ba5227,#a48011,#6c71c4,#3489c4,#2aa198,#93a1a1,#3489c4,#93a1a1,#586e75,#073642,#04313c,#839603,#cf3f3c,#a48011',
    '#2aa198,#cb4b16,#b58900,#6c71c4,#268bd2,#2aa198,#657b83,#268bd2,#586e75,#93a1a1,#eee8d5,#f5efdc,#859900,#dc322f,#b58900',
    { spinner: ['Orbitando', 'Asoleándose', 'Llameando', 'Eclipsando', 'Saliendo', 'Poniéndose'], done: ['Salió', 'Se puso', 'Orbitó', 'Eclipsó'] },
    { spinner: ['Orbiting', 'Basking', 'Flaring', 'Eclipsing', 'Rising', 'Setting'], done: ['Risen', 'Set', 'Orbited', 'Eclipsed'] },
  ),
  theme(
    'night-owl',
    'Night Owl',
    '#7fdbca,#f78c6c,#ecc48d,#c792ea,#82aaff,#7fdbca,#d6deeb,#82aaff,#d6deeb,#637777,#0b2942,#071d33,#addb67,#e95956,#ecc48d',
    null,
    { spinner: ['Ululando', 'Posándose', 'Bajando en picada', 'Vigilando', 'Merodeando', 'Planeando'], done: ['Avistó', 'Cazó', 'Se posó', 'Atrapó'] },
    { spinner: ['Hooting', 'Perching', 'Swooping', 'Watching', 'Prowling', 'Gliding'], done: ['Spotted', 'Swooped', 'Perched', 'Caught'] },
  ),
  theme(
    'ayu',
    'Ayu',
    '#95e6cb,#e99356,#f3b360,#d2a6ff,#63bff5,#46b3d9,#bfbdb6,#e6b450,#bfbdb6,#626a73,#131721,#0f131a,#aad94c,#f07178,#f3b360',
    '#4cbf99,#fa8d3e,#f2ae49,#a37acc,#399ee6,#55b4d4,#787b80,#ffaa33,#5c6166,#8a9199,#f3f4f5,#f8f9fa,#86b300,#e65050,#f2ae49',
    { spinner: ['Amaneciendo', 'Destellando', 'Templando', 'Encendiendo', 'Brillando', 'Madurando'], done: ['Amaneció', 'Brilló', 'Templó', 'Encendió'] },
    { spinner: ['Dawning', 'Glinting', 'Warming', 'Kindling', 'Shining', 'Ripening'], done: ['Dawned', 'Shone', 'Warmed', 'Lit'] },
  ),
  theme(
    'github',
    'GitHub',
    '#79c0ff,#f4a762,#c39431,#d2a8ff,#62a7f5,#56d4dd,#c9d1d9,#62a7f5,#e1e9f1,#7d8590,#161b22,#11161d,#3fb950,#ea5e57,#c39431',
    '#0969da,#bc4c00,#9a6700,#8250df,#0550ae,#1b7c83,#57606a,#0969da,#1f2328,#656d76,#f6f8fa,#fafbfc,#1a7f37,#cf222e,#9a6700',
    {
      spinner: ['Commiteando', 'Rebaseando', 'Forkeando', 'Pusheando', 'Haciendo cherry-pick', 'Guardando en stash'],
      done: ['Mergeó', 'Pusheó', 'Commiteó', 'Tagueó'],
    },
    { spinner: ['Committing', 'Rebasing', 'Forking', 'Pushing', 'Cherry-picking', 'Stashing'], done: ['Merged', 'Pushed', 'Committed', 'Tagged'] },
  ),
  theme(
    'mono',
    'Monochrome',
    '#9e9e9e,#e0e0e0,#bdbdbd,#9e9e9e,#9e9e9e,#9e9e9e,#9e9e9e,#e0e0e0,#e0e0e0,#7a7a7a,#262626,#222222,#e0e0e0,#f7f7f7,#bdbdbd',
    null,
    { spinner: ['Trabajando', 'Pensando', 'Leyendo', 'Escribiendo', 'Revisando'], done: ['Listo', 'Terminado', 'Completo'] },
    { spinner: ['Working', 'Thinking', 'Reading', 'Writing', 'Checking'], done: ['Done', 'Finished', 'Completed'] },
  ),
]

export const DEFAULT_THEME = 'nzt'

export const themeNamed = (name: string): Theme | undefined => THEMES.find(one => one.name === name)

const HEX = /^#[0-9a-f]{6}$/

/** A color as the mod keeps it: `#rrggbb` in lowercase, or null when it is not one. */
export const hexOf = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const text = value.trim().toLowerCase()
  const long = /^#[0-9a-f]{3}$/.test(text) ? `#${[...text.slice(1)].map(c => c + c).join('')}` : text
  return HEX.test(long) ? long : null
}

/** A palette read from data: every key a color, or null when one is missing or is not a color. */
export const paletteFrom = (value: unknown): Palette | null => {
  if (typeof value !== 'object' || value === null) return null
  const record = value as Record<string, unknown>
  const colors = KEYS.map(key => hexOf(record[key]))
  if (colors.some(color => color === null)) return null
  return Object.fromEntries(KEYS.map((key, i) => [key, colors[i]!])) as Palette
}

/** The keys a palette lacks or holds something that is not a color in. */
export const missingOf = (value: unknown): PaletteKey[] => {
  const record = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
  return KEYS.filter(key => hexOf(record[key]) === null)
}
