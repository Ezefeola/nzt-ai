import type { PhaseId } from './phases'

/**
 * The phase characters: a pixel crab in the style of Clawd, drawn for this mod, with one hat
 * per phase. Each picture is rows of letters, one letter per pixel, '.' the background;
 * the same rows are drawn as terminal cells and as SVG, so a hat is retouched in one place.
 */

/** Blank columns on each side of the 14-pixel crab, room for what it holds; the same on both, so it stays centered. */
const SIDE = 3
export const WIDTH = 14 + SIDE * 2
export const HEIGHT = 12
/** Terminal rows: two pixels per cell, the upper one in the foreground of '▀'. */
export const CELL_ROWS = HEIGHT / 2
/** Frames in one loop: the legs step every frame, the eyes blink on the last. */
export const FRAMES = 8

export const PALETTE: Record<string, string> = {
  o: '#D77757', // body
  k: '#1A1A1A', // eyes
  v: '#9B7BEA', // mortarboard
  V: '#6D4FC9',
  y: '#F5C542', // tassel
  b: '#4C8DF6', // hard hat
  B: '#93BBFB',
  p: '#EC5FA6', // beret
  a: '#F59E0B', // helmet
  w: '#F3F4F6',
  g: '#9CA3AF', // wrench, magnifier handle
  t: '#2BC4B0', // deerstalker
  T: '#1A8F80',
  l: '#BFE8FF', // magnifier glass
  M: '#D1D5DB', // hammer head
  W: '#B7793E', // hammer handle
  h: '#6B7A90', // top hat: slate, since black vanishes on a dark terminal
  Y: '#E5B53B',
}

const NO_HAT = ['..............', '..............', '..............', '..............']

const HATS: Record<PhaseId, string[]> = {
  analysis: ['..............', '.VVVVVVVVVVVV.', '...vvvvvvvv.y.', '....vvvvvv..y.'],
  architecture: ['......BB......', '....bbBBbb....', '...bbbbbbbb...', '.bbbbbbbbbbbb.'],
  ux: ['......p.......', '...pppppppp...', '..pppppppppppp', '...pppppppp...'],
  build: ['...........g.g', '....aaaaaa.ggg', '...aawwwwaa.g.', '..aaaaaaaaaa.g'],
  verify: ['ll....TT......', 'll..tttttt....', '..g.tTTTTt....', '...gtttttttt..'],
  ship: ['....hhhhhh....', '....hhhhhh....', '....YYYYYY....', '..hhhhhhhhhh..'],
}

const BLANK = '..............'

/**
 * What a phase's character holds in the hand on the right: the SIDE columns past the crab,
 * one string per row from `top`. It stays with the body while the hat bobs, and keeps a
 * column or a row away from anything on the hat, so the two never touch. The hand is row 7.
 */
const HELD: Partial<Record<PhaseId, { top: number; rows: string[] }>> = {
  // A small hammer, the hand reaching one pixel more to its handle.
  build: { top: 6, rows: ['MMM', 'oW.', '.W.'] },
}

const body = (step: boolean, blink: boolean) => [
  '..oooooooooo..',
  blink ? '..oooooooooo..' : '..okkooookko..',
  'oooooooooooooo',
  '..oooooooooo..',
  step ? '..o.o....o.o..' : '...o.o..o.o...',
]

/** One frame of a phase's character, HEIGHT rows of WIDTH letters; no phase draws it bare. */
export const frameOf = (phase: PhaseId | undefined, tick: number): string[] => {
  const n = ((tick % FRAMES) + FRAMES) % FRAMES
  const step = n % 2 === 0
  const hat = phase === undefined ? NO_HAT : HATS[phase]
  // The hat bobs with the step: one blank row above it or below it.
  const top = step ? [...hat, BLANK] : [BLANK, ...hat]
  const held = phase === undefined ? undefined : HELD[phase]
  return [...top, ...body(step, n === FRAMES - 1), BLANK, BLANK].map(
    (row, y) => '.'.repeat(SIDE) + row + (held?.rows[y - held.top] ?? '.'.repeat(SIDE)),
  )
}

/** A hat in miniature: MINI_WIDTH pixels by two, one terminal row. */
export const MINI_WIDTH = 4

const MINI_HATS: Record<PhaseId, string[]> = {
  analysis: ['VVVV', '.vvy'],
  architecture: ['.BB.', 'bbbb'],
  ux: ['.ppp', 'pppp'],
  build: ['.aa.', 'awwa'],
  verify: ['.TT.', 'tttt'],
  ship: ['.hh.', 'hYYh'],
}

/** The miniature of a phase NZT knows; undefined for any other, which wears no hat. */
export const miniOf = (phase: PhaseId | undefined): string[] | undefined =>
  phase === undefined ? undefined : MINI_HATS[phase]

const NONE = 0x01000000
const colorWord = (letter: string | undefined) => {
  const hex = letter === undefined ? undefined : PALETTE[letter]
  return hex === undefined ? undefined : parseInt(hex.slice(1), 16)
}

/** Packs pixel rows into a Raster's cells: base64 of [codePoint, fg, bg] u32 triplets. */
export const cellsOf = (rows: string[]): string => {
  const width = rows[0]?.length ?? 0
  const cellRows = Math.ceil(rows.length / 2)
  const words = new Uint32Array(width * cellRows * 3)
  for (let y = 0; y < cellRows; y++) {
    for (let x = 0; x < width; x++) {
      const top = colorWord(rows[y * 2]?.[x])
      const bottom = colorWord(rows[y * 2 + 1]?.[x])
      const at = (y * width + x) * 3
      if (top === undefined && bottom === undefined) words.set([0x20, NONE, NONE], at)
      else if (top === undefined) words.set([0x2584, bottom ?? NONE, NONE], at)
      else words.set([0x2580, top, bottom ?? NONE], at)
    }
  }
  return toBase64(new Uint8Array(words.buffer))
}

/** One row's pixels as rects, a run of one color merged into one rect. */
const rectsOf = (rows: string[]) =>
  rows
    .flatMap((row, y) => {
      const rects: string[] = []
      for (let x = 0; x < row.length; ) {
        const letter = row[x]!
        let end = x + 1
        while (row[end] === letter) end++
        const fill = PALETTE[letter]
        if (fill !== undefined) rects.push(`<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="${fill}"/>`)
        x = end
      }
      return rects
    })
    .join('')

const svg = (width: number, height: number, scale: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" ` +
  `width="${width * scale}" height="${height * scale}" shape-rendering="crispEdges">${body}</svg>`

/** A still picture as SVG, `scale` CSS pixels per pixel. */
export const svgOf = (rows: string[], scale: number) =>
  svg(rows[0]?.length ?? 0, rows.length, scale, rectsOf(rows))

/**
 * A phase's character as one SVG that animates itself: every frame is a group, and CSS shows
 * one at a time at the terminal's pace. With reduced motion it stands on the first frame.
 */
export const animatedSvgOf = (phase: PhaseId | undefined, scale: number, frameMs: number) => {
  const step = 100 / FRAMES
  const css = Array.from({ length: FRAMES }, (_, i) => {
    const on = i * step
    const keys =
      i === 0
        ? `0%{opacity:1}${step}%{opacity:0}100%{opacity:0}`
        : `0%{opacity:0}${on}%{opacity:1}${on + step}%{opacity:0}100%{opacity:0}`
    return `@keyframes k${i}{${keys}}.f${i}{opacity:0;animation:k${i} ${frameMs * FRAMES}ms steps(1,end) infinite}`
  }).join('')
  const still = '@media (prefers-reduced-motion:reduce){g{animation:none!important}.f0{opacity:1}}'
  const frames = Array.from({ length: FRAMES }, (_, i) => `<g class="f${i}">${rectsOf(frameOf(phase, i))}</g>`)
  return svg(WIDTH, HEIGHT, scale, `<style>${css}${still}</style>${frames.join('')}`)
}

const B64 ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

/** Standard padded base64, written out so it does not depend on Uint8Array.toBase64. */
const toBase64 = (bytes: Uint8Array) => {
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] ?? 0
    const b = bytes[i + 1]
    const c = bytes[i + 2]
    out += B64[a >> 2]
    out += B64[((a & 3) << 4) | ((b ?? 0) >> 4)]
    out += b === undefined ? '=' : B64[((b & 15) << 2) | ((c ?? 0) >> 6)]
    out += c === undefined ? '=' : B64[c & 63]
  }
  return out
}
