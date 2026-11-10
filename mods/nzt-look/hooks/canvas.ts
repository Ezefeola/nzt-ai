/** What a cell of a diagram is, for its color. */
export type Style = 'box' | 'label' | 'edge' | 'arrow' | 'note' | 'title' | 'muted' | `slice${number}`

export type Run = { text: string; style: Style | null }

const UP = 1
const DOWN = 2
const LEFT = 4
const RIGHT = 8

const LINE_CHARS: Record<number, string> = {
  [UP]: '│',
  [DOWN]: '│',
  [UP | DOWN]: '│',
  [LEFT]: '─',
  [RIGHT]: '─',
  [LEFT | RIGHT]: '─',
  [DOWN | RIGHT]: '┌',
  [DOWN | LEFT]: '┐',
  [UP | RIGHT]: '└',
  [UP | LEFT]: '┘',
  [UP | DOWN | RIGHT]: '├',
  [UP | DOWN | LEFT]: '┤',
  [LEFT | RIGHT | DOWN]: '┬',
  [LEFT | RIGHT | UP]: '┴',
  [UP | DOWN | LEFT | RIGHT]: '┼',
}

const DASHED: Record<string, string> = { '│': '┆', '─': '┄' }

/**
 * A grid of cells a diagram is drawn on: text that sits where it is put, and lines that join
 * where they meet (a tee, a cross) instead of overwriting each other.
 */
export class Canvas {
  private texts = new Map<string, { char: string; style: Style }>()
  private lines = new Map<string, { mask: number; style: Style; isDashed: boolean }>()
  width = 0
  height = 0

  private grow(x: number, y: number) {
    this.width = Math.max(this.width, x + 1)
    this.height = Math.max(this.height, y + 1)
  }

  put(x: number, y: number, text: string, style: Style) {
    ;[...text].forEach((char, i) => {
      this.texts.set(`${x + i},${y}`, { char, style })
      this.grow(x + i, y)
    })
  }

  private mark(x: number, y: number, mask: number, style: Style, isDashed: boolean) {
    const key = `${x},${y}`
    const held = this.lines.get(key)
    this.lines.set(key, { mask: (held?.mask ?? 0) | mask, style, isDashed: (held?.isDashed ?? true) && isDashed })
    this.grow(x, y)
  }

  /** A straight run between two cells on one row or one column, both ends included; one cell is a vertical one. */
  line(x1: number, y1: number, x2: number, y2: number, style: Style = 'edge', isDashed = false) {
    if (y1 === y2 && x1 !== x2) {
      const [from, to] = x1 <= x2 ? [x1, x2] : [x2, x1]
      for (let x = from; x <= to; x++) this.mark(x, y1, (x > from ? LEFT : 0) | (x < to ? RIGHT : 0) || LEFT | RIGHT, style, isDashed)
    } else {
      const [from, to] = y1 <= y2 ? [y1, y2] : [y2, y1]
      for (let y = from; y <= to; y++) this.mark(x1, y, (y > from ? UP : 0) | (y < to ? DOWN : 0) || UP | DOWN, style, isDashed)
    }
  }

  /** A path through the given corners, joined at each turn. */
  path(points: readonly [number, number][], style: Style = 'edge', isDashed = false) {
    for (let i = 1; i < points.length; i++) {
      const [x1, y1] = points[i - 1]!
      const [x2, y2] = points[i]!
      if (x1 === x2 && y1 === y2) continue
      this.line(x1, y1, x2, y2, style, isDashed)
      // The corner cell carries both directions, so it is drawn as a turn.
      if (i < points.length - 1) {
        const [x3, y3] = points[i + 1]!
        const into = x1 === x2 ? (y2 > y1 ? UP : DOWN) : x2 > x1 ? LEFT : RIGHT
        const out = x2 === x3 ? (y3 > y2 ? DOWN : UP) : x3 > x2 ? RIGHT : LEFT
        if (!(x2 === x3 && y2 === y3)) this.mark(x2, y2, into | out, style, isDashed)
      }
    }
  }

  /** A box: its corners by shape, its label centred on its rows. */
  box(x: number, y: number, width: number, labels: readonly string[], shape: 'rect' | 'round' | 'decision' = 'rect') {
    const height = labels.length + 2
    const [tl, tr, bl, br] = shape === 'round' ? ['╭', '╮', '╰', '╯'] : shape === 'decision' ? ['╱', '╲', '╲', '╱'] : ['┌', '┐', '└', '┘']
    this.put(x, y, `${tl}${'─'.repeat(width - 2)}${tr}`, 'box')
    this.put(x, y + height - 1, `${bl}${'─'.repeat(width - 2)}${br}`, 'box')
    labels.forEach((label, i) => {
      this.put(x, y + 1 + i, '│', 'box')
      this.put(x + width - 1, y + 1 + i, '│', 'box')
      const room = width - 2 - [...label].length
      this.put(x + 1 + Math.floor(room / 2), y + 1 + i, label, 'label')
    })
  }

  /** The grid as rows of runs, each run one style. */
  rows(): Run[][] {
    const rows: Run[][] = []
    for (let y = 0; y < this.height; y++) {
      const runs: Run[] = []
      for (let x = 0; x < this.width; x++) {
        const key = `${x},${y}`
        const text = this.texts.get(key)
        const line = this.lines.get(key)
        let char = ' '
        let style: Style | null = null
        if (text !== undefined) ({ char, style } = text)
        else if (line !== undefined) {
          const plain = LINE_CHARS[line.mask] ?? '┼'
          char = line.isDashed ? (DASHED[plain] ?? plain) : plain
          style = line.style
        }
        const last = runs.at(-1)
        if (last !== undefined && last.style === style) last.text += char
        else runs.push({ text: char, style })
      }
      const last = runs.at(-1)
      if (last !== undefined) last.text = last.text.replace(/\s+$/, '')
      rows.push(runs.filter(run => run.text !== ''))
    }
    return rows
  }
}
