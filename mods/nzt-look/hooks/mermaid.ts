import { Canvas } from './canvas'
import type { Run } from './canvas'

/** Past this many nodes a diagram stays as written: a picture that size reads worse than its text. */
export const MAX_NODES = 40

export type Diagram = { rows: Run[][]; width: number; kind: string }

class Unreadable extends Error {}

const widthOf = (text: string) => [...text].length

const labelLines = (label: string): string[] =>
  label
    .replace(/^["']|["']$/g, '')
    .split(/<br\s*\/?>|\\n/i)
    .map(line => line.replace(/<\/?[a-z][^>]*>/gi, '').trim())

const stripComments = (code: string) =>
  code
    .split('\n')
    .map(line => line.replace(/%%.*$/, '').trimEnd())
    .filter(line => line.trim() !== '')

// ── Graphs: flowchart and state diagram ───────────────────────────────────────

type Shape = 'rect' | 'round' | 'decision' | 'start' | 'end'
type GraphNode = { id: string; labels: string[]; shape: Shape }
type GraphEdge = { from: string; to: string; label: string | null; isDashed: boolean; hasArrow: boolean }
type Graph = { direction: 'TD' | 'BT' | 'LR' | 'RL'; nodes: GraphNode[]; edges: GraphEdge[] }

const NODE = /^([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*)\s*(\(\(.*?\)\)|\(\[.*?\]\)|\[\[.*?\]\]|\[\(.*?\)\]|\[\/.*?\/\]|\[\\.*?\\\]|\{\{.*?\}\}|\[.*?\]|\(.*?\)|\{.*?\}|>.*?\])?/
const LINK = /^\s*(<?(?:-->|---|-\.->|-\.-|==>|===|--x|--o|-->>|~~~)|--\s*[^-|>]+?\s*-->|==\s*[^=|>]+?\s*==>|-\.\s*[^.|>]+?\s*\.->)\s*(?:\|([^|]*)\|)?\s*/

const shapeOf = (wrapped: string | undefined): { shape: Shape; label: string | null } => {
  if (wrapped === undefined) return { shape: 'rect', label: null }
  if (/^\{/.test(wrapped)) return { shape: 'decision', label: wrapped.replace(/^\{+|\}+$/g, '') }
  if (/^\(/.test(wrapped) || /^\[\(/.test(wrapped)) return { shape: 'round', label: wrapped.replace(/^[[(]+|[)\]]+$/g, '') }
  return { shape: 'rect', label: wrapped.replace(/^[[/\\>]+|[\]/\\]+$/g, '') }
}

const parseFlowchart = (lines: string[]): Graph => {
  const head = lines[0]!.trim().split(/\s+/)
  const direction = (head[1] ?? 'TD').toUpperCase().replace('TB', 'TD') as Graph['direction']
  if (!['TD', 'BT', 'LR', 'RL'].includes(direction)) throw new Unreadable('direction')
  const nodes = new Map<string, GraphNode>()
  const edges: GraphEdge[] = []
  const touch = (id: string, wrapped: string | undefined) => {
    const { shape, label } = shapeOf(wrapped)
    const held = nodes.get(id)
    if (held === undefined) nodes.set(id, { id, labels: labelLines(label ?? id), shape })
    else if (label !== null) nodes.set(id, { id, labels: labelLines(label), shape })
  }
  for (const raw of lines.slice(1)) {
    const line = raw.trim().replace(/;$/, '')
    if (/^(subgraph|end|direction)\b/.test(line)) throw new Unreadable('subgraph')
    if (/^(classDef|class|style|linkStyle|click)\b/.test(line)) continue
    let rest = line
    let previous: string | null = null
    let pending: { label: string | null; isDashed: boolean; hasArrow: boolean } | null = null
    while (rest !== '') {
      const node = rest.match(NODE)
      if (node === null) throw new Unreadable(line)
      const ids = node[1]!
      touch(ids, node[2])
      if (previous !== null && pending !== null) edges.push({ from: previous, to: ids, ...pending })
      previous = ids
      rest = rest.slice(node[0].length).trim()
      if (rest.startsWith('&')) throw new Unreadable('&')
      if (rest === '') break
      const link = rest.match(LINK)
      if (link === null) throw new Unreadable(line)
      const arrow = link[1]!
      const inline = arrow.match(/^(?:--|==|-\.)\s*(.+?)\s*(?:-->|==>|\.->)$/)
      pending = {
        label: link[2]?.trim() || inline?.[1]?.trim() || null,
        isDashed: arrow.includes('.') || arrow === '~~~',
        hasArrow: />$/.test(arrow) || arrow.endsWith('x') || arrow.endsWith('o'),
      }
      rest = rest.slice(link[0].length).trim()
    }
  }
  return { direction, nodes: [...nodes.values()], edges }
}

const parseState = (lines: string[]): Graph => {
  const nodes = new Map<string, GraphNode>()
  const edges: GraphEdge[] = []
  let starts = 0
  let ends = 0
  const nodeOf = (name: string, isTarget: boolean): string => {
    if (name === '[*]') {
      const id = isTarget ? `__end${ends++}` : `__start${starts++}`
      nodes.set(id, { id, labels: [isTarget ? '◉' : '●'], shape: isTarget ? 'end' : 'start' })
      return id
    }
    if (!nodes.has(name)) nodes.set(name, { id: name, labels: [name], shape: 'round' })
    return name
  }
  let direction: Graph['direction'] = 'TD'
  for (const raw of lines.slice(1)) {
    const line = raw.trim()
    const dir = line.match(/^direction\s+(TB|TD|BT|LR|RL)$/i)
    if (dir !== null) {
      direction = dir[1]!.toUpperCase().replace('TB', 'TD') as Graph['direction']
      continue
    }
    if (/^(state\s+.*\{|\}|note\b|--$)/.test(line)) throw new Unreadable('composite')
    const named = line.match(/^state\s+"([^"]+)"\s+as\s+(\w+)$/)
    if (named !== null) {
      nodes.set(named[2]!, { id: named[2]!, labels: labelLines(named[1]!), shape: 'round' })
      continue
    }
    const described = line.match(/^(\w+)\s*:\s*(.+)$/)
    if (described !== null && !line.includes('-->')) {
      nodeOf(described[1]!, false)
      nodes.get(described[1]!)!.labels = labelLines(described[2]!)
      continue
    }
    const transition = line.match(/^(\[\*\]|[\w.]+)\s*-->\s*(\[\*\]|[\w.]+)\s*(?::\s*(.+))?$/)
    if (transition !== null) {
      const from = nodeOf(transition[1]!, false)
      const to = nodeOf(transition[2]!, true)
      edges.push({ from, to, label: transition[3]?.trim() ?? null, isDashed: false, hasArrow: true })
      continue
    }
    if (/^[\w.]+$/.test(line)) {
      nodeOf(line, false)
      continue
    }
    throw new Unreadable(line)
  }
  return { direction, nodes: [...nodes.values()], edges }
}

/** Layers by longest path from the roots, cycles broken where they close. */
const layersOf = (graph: Graph): Map<string, number> => {
  const out = new Map(graph.nodes.map(node => [node.id, [] as string[]]))
  for (const edge of graph.edges) out.get(edge.from)?.push(edge.to)
  const back = new Set<string>()
  const state = new Map<string, 'open' | 'done'>()
  const visit = (id: string) => {
    state.set(id, 'open')
    for (const to of out.get(id) ?? []) {
      if (state.get(to) === 'open') back.add(`${id}>${to}`)
      else if (state.get(to) === undefined) visit(to)
    }
    state.set(id, 'done')
  }
  graph.nodes.forEach(node => state.get(node.id) === undefined && visit(node.id))
  const layer = new Map(graph.nodes.map(node => [node.id, 0]))
  for (let pass = 0; pass < graph.nodes.length; pass++) {
    let changed = false
    for (const edge of graph.edges) {
      if (back.has(`${edge.from}>${edge.to}`) || edge.from === edge.to) continue
      const next = layer.get(edge.from)! + 1
      if (next > layer.get(edge.to)!) {
        layer.set(edge.to, next)
        changed = true
      }
    }
    if (!changed) break
  }
  return layer
}

const LAYER_GAP_TD = 4
const NODE_GAP_TD = 4
const LAYER_GAP_LR = 8
const NODE_GAP_LR = 1

/** A graph on a canvas: boxes in layers, each edge a path with its arrow and its label. */
const drawGraph = (graph: Graph, title: string | null): Canvas => {
  if (graph.nodes.length === 0 || graph.nodes.length > MAX_NODES) throw new Unreadable('size')
  const layer = layersOf(graph)
  const depth = Math.max(...layer.values())
  const isVertical = graph.direction === 'TD' || graph.direction === 'BT'
  const isReversed = graph.direction === 'BT' || graph.direction === 'RL'
  const byLayer: GraphNode[][] = Array.from({ length: depth + 1 }, () => [])
  for (const node of graph.nodes) byLayer[isReversed ? depth - layer.get(node.id)! : layer.get(node.id)!]!.push(node)
  // One barycenter pass: a node sits near the nodes it comes from.
  for (let l = 1; l < byLayer.length; l++) {
    const above = byLayer[l - 1]!
    const place = (id: string) => {
      const sources = graph.edges.filter(edge => edge.to === id || edge.from === id).map(edge => above.findIndex(node => node.id === (edge.to === id ? edge.from : edge.to)))
      const found = sources.filter(i => i >= 0)
      return found.length === 0 ? Infinity : found.reduce((sum, i) => sum + i, 0) / found.length
    }
    byLayer[l]!.sort((a, b) => place(a.id) - place(b.id))
  }
  const size = (node: GraphNode) => {
    if (node.shape === 'start' || node.shape === 'end') return { w: 1, h: 1 }
    return { w: Math.max(...node.labels.map(widthOf)) + 4, h: node.labels.length + 2 }
  }
  const at = new Map<string, { x: number; y: number; w: number; h: number }>()
  const top = title === null ? 0 : 2
  if (isVertical) {
    const rowWidths = byLayer.map(nodes => nodes.reduce((sum, node) => sum + size(node).w, 0) + NODE_GAP_TD * Math.max(0, nodes.length - 1))
    const full = Math.max(...rowWidths)
    let y = top
    byLayer.forEach((nodes, l) => {
      let x = Math.floor((full - rowWidths[l]!) / 2)
      const height = Math.max(...nodes.map(node => size(node).h), 1)
      for (const node of nodes) {
        const { w, h } = size(node)
        at.set(node.id, { x, y: y + Math.floor((height - h) / 2), w, h })
        x += w + NODE_GAP_TD
      }
      y += height + LAYER_GAP_TD
    })
  } else {
    const colHeights = byLayer.map(nodes => nodes.reduce((sum, node) => sum + size(node).h, 0) + NODE_GAP_LR * Math.max(0, nodes.length - 1))
    const full = Math.max(...colHeights)
    let x = 0
    byLayer.forEach((nodes, l) => {
      let y = top + Math.floor((full - colHeights[l]!) / 2)
      const width = Math.max(...nodes.map(node => size(node).w), 1)
      for (const node of nodes) {
        const { w, h } = size(node)
        at.set(node.id, { x: x + Math.floor((width - w) / 2), y, w, h })
        y += h + NODE_GAP_LR
      }
      // As wide a gap as the longest label of an edge that leaves this column needs.
      const ids = new Set(nodes.map(node => node.id))
      const label = Math.max(0, ...graph.edges.filter(edge => ids.has(edge.from) && edge.label !== null).map(edge => widthOf(edge.label!)))
      x += width + Math.max(LAYER_GAP_LR, label + 5)
    })
  }
  // A start or an end point sits on the line of the one state it joins.
  for (const node of graph.nodes) {
    if (node.shape !== 'start' && node.shape !== 'end') continue
    const joined = graph.edges.filter(edge => edge.from === node.id || edge.to === node.id).map(edge => (edge.from === node.id ? edge.to : edge.from))
    const other = joined.length === 1 ? at.get(joined[0]!) : undefined
    const point = at.get(node.id)!
    if (other === undefined) continue
    if (isVertical) point.x = other.x + Math.floor(other.w / 2)
    else point.y = other.y + Math.floor(other.h / 2)
  }
  const canvas = new Canvas()
  if (title !== null) canvas.put(0, 0, title, 'title')
  for (const node of graph.nodes) {
    const box = at.get(node.id)!
    if (node.shape === 'start' || node.shape === 'end') canvas.put(box.x, box.y, node.labels[0]!, 'arrow')
    else canvas.box(box.x, box.y, box.w, node.labels, node.shape === 'decision' ? 'decision' : node.shape)
  }
  const extent = () => ({ right: Math.max(...[...at.values()].map(b => b.x + b.w)), bottom: Math.max(...[...at.values()].map(b => b.y + b.h)) })
  let lane = 0
  for (const edge of graph.edges) {
    const a = at.get(edge.from)!
    const b = at.get(edge.to)!
    const style = 'edge' as const
    if (isVertical) {
      const down = b.y > a.y
      const ax = a.x + Math.floor(a.w / 2)
      // Straight down when the source's middle falls inside the target, so no step is drawn.
      const centered = b.x + Math.floor(b.w / 2)
      const bx = Math.abs(ax - centered) <= 2 && ax > b.x && ax < b.x + b.w - 1 ? ax : centered
      const exitY = down ? a.y + a.h : a.y - 1
      const arrowY = down ? b.y - 1 : b.y + b.h
      const span = Math.abs(b.y - a.y)
      if (down && span <= a.h + LAYER_GAP_TD + 1) {
        const mid = exitY + 1
        canvas.path([[ax, exitY], [ax, mid], [bx, mid], [bx, arrowY]], style, edge.isDashed)
        if (edge.hasArrow) canvas.put(bx, arrowY, '▼', 'arrow')
        if (edge.label !== null) canvas.put(bx + 2, mid + 1, edge.label, 'note')
      } else if (!down && span <= b.h + LAYER_GAP_TD + 1 && graph.direction === 'BT') {
        const mid = exitY - 1
        canvas.path([[ax, exitY], [ax, mid], [bx, mid], [bx, arrowY]], style, edge.isDashed)
        if (edge.hasArrow) canvas.put(bx, arrowY, '▲', 'arrow')
        if (edge.label !== null) canvas.put(bx + 2, mid - 1, edge.label, 'note')
      } else {
        // A long or backward edge goes round by a lane on the right.
        const laneX = extent().right + 2 + lane * 2
        lane++
        const ay = a.y + Math.floor(a.h / 2)
        const by = b.y + Math.floor(b.h / 2)
        canvas.path([[a.x + a.w, ay], [laneX, ay], [laneX, by], [b.x + b.w, by]], style, edge.isDashed)
        if (edge.hasArrow) canvas.put(b.x + b.w, by, '◀', 'arrow')
        if (edge.label !== null) canvas.put(laneX + 2, Math.floor((ay + by) / 2), edge.label, 'note')
      }
    } else {
      const right = b.x > a.x
      const ay = a.y + Math.floor(a.h / 2)
      const by = b.y + Math.floor(b.h / 2)
      const exitX = right ? a.x + a.w : a.x - 1
      const arrowX = right ? b.x - 1 : b.x + b.w
      const span = Math.abs(b.x - a.x)
      if (span <= a.w + LAYER_GAP_LR + 4 && (right || graph.direction === 'RL')) {
        const mid = right ? exitX + 2 : exitX - 2
        canvas.path([[exitX, ay], [mid, ay], [mid, by], [arrowX, by]], style, edge.isDashed)
        if (edge.hasArrow) canvas.put(arrowX, by, right ? '▶' : '◀', 'arrow')
        if (edge.label !== null) {
          const room = Math.abs(arrowX - mid) - 1
          const label = widthOf(edge.label) > room ? [...edge.label].slice(0, Math.max(1, room - 1)).join('') + '…' : edge.label
          canvas.put(Math.min(mid, arrowX) + 1, by - (ay === by ? 0 : 1) - (ay === by ? 1 : 0), label, 'note')
        }
      } else {
        const laneY = extent().bottom + 1 + lane * 2
        lane++
        const ax = a.x + Math.floor(a.w / 2)
        const bx = b.x + Math.floor(b.w / 2)
        canvas.path([[ax, a.y + a.h], [ax, laneY], [bx, laneY], [bx, b.y + b.h]], style, edge.isDashed)
        if (edge.hasArrow) canvas.put(bx, b.y + b.h, '▲', 'arrow')
        if (edge.label !== null) canvas.put(Math.min(ax, bx) + 2, laneY + 1, edge.label, 'note')
      }
    }
  }
  return canvas
}

// ── Sequence ──────────────────────────────────────────────────────────────────

type SeqStep =
  | { kind: 'message'; from: string; to: string; label: string; isDashed: boolean; head: '▶' | '✕' | '▷' }
  | { kind: 'note'; over: string[]; label: string }
  | { kind: 'block'; label: string }

const drawSequence = (lines: string[]): Canvas => {
  const people: { id: string; label: string }[] = []
  const add = (id: string, label = id) => {
    if (!people.some(person => person.id === id)) people.push({ id, label })
  }
  const steps: SeqStep[] = []
  for (const raw of lines.slice(1)) {
    const line = raw.trim()
    const declared = line.match(/^(?:participant|actor)\s+(\S+)(?:\s+as\s+(.+))?$/)
    if (declared !== null) {
      add(declared[1]!, declared[2]?.trim())
      continue
    }
    const message = line.match(/^([^\s-]+)\s*(-{1,2}>>|-{1,2}>|-{1,2}x|-{1,2}\))\s*([+-]?)([^\s:]+)\s*:\s*(.*)$/)
    if (message !== null) {
      add(message[1]!)
      add(message[4]!)
      const arrow = message[2]!
      steps.push({
        kind: 'message',
        from: message[1]!,
        to: message[4]!,
        label: message[5]!.trim(),
        isDashed: arrow.startsWith('--'),
        head: arrow.endsWith('x') ? '✕' : arrow.endsWith(')') ? '▷' : '▶',
      })
      continue
    }
    const note = line.match(/^note\s+(?:over|left of|right of)\s+([^:]+):\s*(.*)$/i)
    if (note !== null) {
      steps.push({ kind: 'note', over: note[1]!.split(',').map(id => id.trim()), label: note[2]!.trim() })
      continue
    }
    const block = line.match(/^(loop|alt|else|opt|par|and|critical|break|rect)\b\s*(.*)$/)
    if (block !== null) {
      steps.push({ kind: 'block', label: `${block[1]}${block[2] ? ` ${block[2]}` : ''}` })
      continue
    }
    if (/^(end|autonumber|activate|deactivate|box|title)\b/.test(line)) continue
    throw new Unreadable(line)
  }
  if (people.length === 0 || people.length > 12) throw new Unreadable('size')
  // Columns as far apart as the widest message between neighbours needs.
  const gap = new Array(people.length).fill(0)
  for (const step of steps) {
    if (step.kind !== 'message') continue
    const a = people.findIndex(person => person.id === step.from)
    const b = people.findIndex(person => person.id === step.to)
    const [lo, hi] = a < b ? [a, b] : [b, a]
    if (lo === hi) gap[lo] = Math.max(gap[lo], widthOf(step.label) + 6)
    else gap[lo] = Math.max(gap[lo], Math.ceil((widthOf(step.label) + 4) / (hi - lo)))
  }
  const centers: number[] = []
  let x = 0
  people.forEach((person, i) => {
    const w = widthOf(person.label) + 4
    const center = x + Math.floor(w / 2)
    centers.push(center)
    x = Math.max(x + w + 2, center + Math.max(gap[i], 8) - Math.floor((widthOf(people[i + 1]?.label ?? '') + 4) / 2))
  })
  const canvas = new Canvas()
  const heads = (y: number) =>
    people.forEach((person, i) => {
      const w = widthOf(person.label) + 4
      canvas.box(centers[i]! - Math.floor(w / 2), y, w, [person.label], 'rect')
    })
  heads(0)
  let y = 3
  const life = (from: number, to: number) => centers.forEach(center => canvas.line(center, from, center, to, 'muted', true))
  for (const step of steps) {
    if (step.kind === 'message') {
      const a = centers[people.findIndex(person => person.id === step.from)]!
      const b = centers[people.findIndex(person => person.id === step.to)]!
      life(y, y + 1)
      if (a === b) {
        canvas.put(a + 2, y, step.label, 'note')
        canvas.path([[a + 1, y + 1], [a + 4, y + 1], [a + 4, y + 2], [a + 2, y + 2]], 'edge', step.isDashed)
        canvas.put(a + 1, y + 2, '◀', 'arrow')
        life(y + 2, y + 2)
        y += 3
        continue
      }
      const [lo, hi] = a < b ? [a, b] : [b, a]
      canvas.put(lo + 2, y, step.label, 'note')
      canvas.line(lo + 1, y + 1, hi - 1, y + 1, 'edge', step.isDashed)
      canvas.put(b > a ? hi - 1 : lo + 1, y + 1, b > a ? step.head : step.head === '▶' ? '◀' : step.head, 'arrow')
      y += 2
    } else if (step.kind === 'note') {
      const idx = step.over.map(id => people.findIndex(person => person.id === id)).filter(i => i >= 0)
      const center = idx.length === 0 ? centers[0]! : Math.floor(idx.reduce((sum, i) => sum + centers[i]!, 0) / idx.length)
      const w = widthOf(step.label) + 4
      life(y, y + 2)
      canvas.box(Math.max(0, center - Math.floor(w / 2)), y, w, [step.label], 'round')
      y += 3
    } else {
      life(y, y)
      canvas.put(0, y, `┄ ${step.label}`, 'title')
      y += 1
    }
  }
  life(y, y)
  heads(y + 1)
  return canvas
}

// ── Pie and mind map ──────────────────────────────────────────────────────────

const BAR = 24

const drawPie = (lines: string[]): Canvas => {
  const title = lines[0]!.trim().match(/^pie(?:\s+showData)?(?:\s+title\s+(.+))?$/)?.[1] ?? null
  const slices: { label: string; value: number }[] = []
  let titled = title
  for (const raw of lines.slice(1)) {
    const line = raw.trim()
    const named = line.match(/^title\s+(.+)$/)
    if (named !== null) {
      titled = named[1]!
      continue
    }
    const slice = line.match(/^"([^"]+)"\s*:\s*([\d.]+)$/)
    if (slice === null) throw new Unreadable(line)
    slices.push({ label: slice[1]!, value: Number(slice[2]) })
  }
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)
  if (slices.length === 0 || !(total > 0)) throw new Unreadable('empty')
  const canvas = new Canvas()
  let y = 0
  if (titled !== null) {
    canvas.put(0, 0, titled, 'title')
    y = 2
  }
  const labelWidth = Math.max(...slices.map(slice => widthOf(slice.label)))
  slices.forEach((slice, i) => {
    const share = slice.value / total
    const cells = Math.max(1, Math.round(share * BAR))
    canvas.put(0, y, slice.label.padEnd(labelWidth), 'label')
    canvas.put(labelWidth + 1, y, '█'.repeat(cells), `slice${i % 8}`)
    canvas.put(labelWidth + 2 + cells, y, `${Math.round(share * 1000) / 10}%`, 'muted')
    y++
  })
  return canvas
}

const drawMindmap = (lines: string[]): Canvas => {
  const items = lines.slice(1).map(raw => ({ depth: raw.length - raw.trimStart().length, text: raw.trim().replace(/^[\w-]*[([{]+|[)\]}]+$/g, '').replace(/^::icon\(.*\)$/, '') }))
  const visible = items.filter(item => item.text !== '')
  if (visible.length === 0 || visible.length > MAX_NODES) throw new Unreadable('size')
  const depths = [...new Set(visible.map(item => item.depth))].sort((a, b) => a - b)
  const canvas = new Canvas()
  visible.forEach((item, i) => {
    const level = depths.indexOf(item.depth)
    if (level === 0) {
      canvas.put(0, i, item.text, 'title')
      return
    }
    const isLast = !visible.slice(i + 1).some(next => depths.indexOf(next.depth) === level && !visible.slice(i + 1, visible.indexOf(next)).some(between => depths.indexOf(between.depth) < level))
    let prefix = ''
    for (let l = 1; l < level; l++) {
      const continues = visible.slice(i + 1).some(next => depths.indexOf(next.depth) === l)
      prefix += continues ? '│  ' : '   '
    }
    canvas.put(0, i, prefix, 'edge')
    canvas.put(widthOf(prefix), i, isLast ? '└─ ' : '├─ ', 'edge')
    canvas.put(widthOf(prefix) + 3, i, item.text, level === 1 ? 'label' : 'muted')
  })
  return canvas
}

/**
 * A Mermaid block drawn in text, or null where it stays as written: a kind the mod does not
 * draw, something it cannot read, more nodes than it draws, or wider than `columns`.
 */
export const diagramOf = (code: string, columns: number): Diagram | null => {
  const lines = stripComments(code)
  if (lines.length === 0) return null
  let title: string | null = null
  if (lines[0]!.trim() === '---') {
    const end = lines.indexOf('---', 1)
    if (end < 0) return null
    title = lines.slice(1, end).find(line => /^title:/.test(line.trim()))?.replace(/^\s*title:\s*/, '') ?? null
    lines.splice(0, end + 1)
  }
  const head = lines[0]?.trim() ?? ''
  try {
    let canvas: Canvas
    let kind: string
    if (/^(flowchart|graph)\b/.test(head)) {
      kind = 'flowchart'
      canvas = drawGraph(parseFlowchart(lines), title)
    } else if (/^stateDiagram(-v2)?\b/.test(head)) {
      kind = 'state'
      canvas = drawGraph(parseState(lines), title)
    } else if (/^sequenceDiagram\b/.test(head)) {
      kind = 'sequence'
      canvas = drawSequence(lines)
    } else if (/^pie\b/.test(head)) {
      kind = 'pie'
      canvas = drawPie(lines)
    } else if (/^mindmap\b/.test(head)) {
      kind = 'mindmap'
      canvas = drawMindmap(lines)
    } else {
      return null
    }
    if (canvas.width > columns) return null
    return { rows: canvas.rows(), width: canvas.width, kind }
  } catch (error) {
    if (error instanceof Unreadable) return null
    throw error
  }
}

/** The note the agent reads while diagrams are on: which kinds the session draws. */
export const DIAGRAM_HINT =
  'This session draws Mermaid code blocks as diagrams: flowchart/graph (TD, BT, LR, RL, no subgraphs), stateDiagram, sequenceDiagram, pie and mindmap. Prefer those kinds when a diagram helps; other kinds, and diagrams over 40 nodes, show as plain code.'
