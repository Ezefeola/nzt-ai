/** A laid-out formula: its rows of text, and which row the line it sits on runs through. */
export type MathBlock = { lines: string[]; base: number }

const SYMBOLS: Record<string, string> = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'ϑ',
  iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', varpi: 'ϖ', rho: 'ρ', sigma: 'σ', varsigma: 'ς', tau: 'τ',
  upsilon: 'υ', phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π', Sigma: 'Σ', Upsilon: 'Υ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
  cdot: '·', times: '×', div: '÷', pm: '±', mp: '∓', leq: '≤', le: '≤', geq: '≥', ge: '≥', neq: '≠', ne: '≠', approx: '≈',
  equiv: '≡', sim: '∼', simeq: '≃', propto: '∝', infty: '∞', to: '→', rightarrow: '→', leftarrow: '←', Rightarrow: '⇒',
  Leftarrow: '⇐', leftrightarrow: '↔', Leftrightarrow: '⇔', implies: '⟹', iff: '⟺', mapsto: '↦', partial: '∂', nabla: '∇',
  in: '∈', notin: '∉', ni: '∋', subset: '⊂', subseteq: '⊆', supset: '⊃', supseteq: '⊇', cup: '∪', cap: '∩', emptyset: '∅',
  varnothing: '∅', forall: '∀', exists: '∃', neg: '¬', land: '∧', lor: '∨', wedge: '∧', vee: '∨', oplus: '⊕', otimes: '⊗',
  circ: '∘', bullet: '•', star: '⋆', ldots: '…', dots: '…', cdots: '⋯', vdots: '⋮', ddots: '⋱', prime: '′', angle: '∠',
  perp: '⊥', parallel: '∥', mid: '∣', ell: 'ℓ', hbar: 'ℏ', Re: 'ℜ', Im: 'ℑ', aleph: 'ℵ', deg: '°',
  langle: '⟨', rangle: '⟩', lceil: '⌈', rceil: '⌉', lfloor: '⌊', rfloor: '⌋', quad: '  ', qquad: '    ', ',': ' ', ';': ' ', ' ': ' ',
  '{': '{', '}': '}', '%': '%', '$': '$', '&': '&', '#': '#', '_': '_', '\\': ' ',
  sin: 'sin', cos: 'cos', tan: 'tan', log: 'log', ln: 'ln', exp: 'exp', lim: 'lim', max: 'max', min: 'min', sup: 'sup', inf: 'inf',
  det: 'det', gcd: 'gcd', mod: 'mod', arg: 'arg',
}

/** Relations and arrows read with a space each side, as `=` does. */
const RELATIONS = new Set([
  'leq', 'le', 'geq', 'ge', 'neq', 'ne', 'approx', 'equiv', 'sim', 'simeq', 'propto', 'to', 'rightarrow', 'leftarrow', 'Rightarrow',
  'Leftarrow', 'leftrightarrow', 'Leftrightarrow', 'implies', 'iff', 'mapsto', 'in', 'notin', 'ni', 'subset', 'subseteq', 'supset',
  'supseteq', 'cdot', 'times', 'div', 'pm', 'mp',
])

/** The operators that carry limits stacked above and below in a display formula. */
const BIG: Record<string, string> = { sum: '∑', prod: '∏', int: '∫', iint: '∬', oint: '∮', coprod: '∐', bigcup: '⋃', bigcap: '⋂', lim: 'lim' }

const SUPER: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '=': '⁼',
  '(': '⁽', ')': '⁾', n: 'ⁿ', i: 'ⁱ', a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', k: 'ᵏ', m: 'ᵐ', o: 'ᵒ', p: 'ᵖ', t: 'ᵗ', x: 'ˣ', y: 'ʸ', T: 'ᵀ',
  '′': '′', '*': '*',
}
const SUB: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', '=': '₌',
  '(': '₍', ')': '₎', a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', o: 'ₒ', p: 'ₚ', r: 'ᵣ', s: 'ₛ', t: 'ₜ',
  u: 'ᵤ', v: 'ᵥ', x: 'ₓ',
}

type Node =
  | { kind: 'text'; text: string }
  | { kind: 'row'; items: Node[] }
  | { kind: 'frac'; top: Node; bottom: Node }
  | { kind: 'sqrt'; body: Node }
  | { kind: 'scripts'; base: Node; sup: Node | null; sub: Node | null }
  | { kind: 'big'; symbol: string; sup: Node | null; sub: Node | null }

class MathError extends Error {}

/** TeX as a tree; throws on what it cannot read, so the block stays as written. */
export const parseTex = (tex: string): Node => {
  let at = 0
  const peek = () => tex[at]
  const skipSpace = () => {
    while (at < tex.length && /\s/.test(tex[at]!)) at++
  }
  const command = (): string => {
    at++ // the backslash
    if (at >= tex.length) throw new MathError('a lone backslash')
    if (!/[A-Za-z]/.test(tex[at]!)) return tex[at++]!
    const start = at
    while (at < tex.length && /[A-Za-z]/.test(tex[at]!)) at++
    return tex.slice(start, at)
  }
  const group = (): Node => {
    skipSpace()
    if (peek() === '{') {
      at++
      const inside = row('}')
      if (peek() !== '}') throw new MathError('an open brace')
      at++
      return inside
    }
    return atom()
  }
  const atom = (): Node => {
    skipSpace()
    const char = peek()
    if (char === undefined) throw new MathError('nothing where something was expected')
    if (char === '\\') {
      const name = command()
      if (name === 'frac' || name === 'dfrac' || name === 'tfrac') return { kind: 'frac', top: group(), bottom: group() }
      if (name === 'sqrt') return { kind: 'sqrt', body: group() }
      if (name === 'text' || name === 'mathrm' || name === 'operatorname' || name === 'textbf' || name === 'mathbf' || name === 'mathit' || name === 'mathbb' || name === 'mathcal') {
        return group()
      }
      if (name === 'left' || name === 'right' || name === 'big' || name === 'Big' || name === 'bigg' || name === 'displaystyle') {
        return { kind: 'text', text: '' }
      }
      if (BIG[name] !== undefined) return { kind: 'big', symbol: BIG[name]!, sup: null, sub: null }
      const symbol = SYMBOLS[name]
      if (symbol === undefined) throw new MathError(`\\${name}`)
      return { kind: 'text', text: RELATIONS.has(name) ? ` ${symbol} ` : symbol }
    }
    if (char === '{') return group()
    at++
    if (char === '-') return { kind: 'text', text: '−' }
    if (char === '*') return { kind: 'text', text: '∗' }
    if (char === '=' || char === '<' || char === '>' || char === '+') return { kind: 'text', text: ` ${char} ` }
    return { kind: 'text', text: char }
  }
  const row = (end?: string): Node => {
    const items: Node[] = []
    for (;;) {
      skipSpace()
      const char = peek()
      if (char === undefined || char === end) break
      if (char === '}') throw new MathError('a stray brace')
      if (char === '^' || char === '_') {
        at++
        const script = group()
        const last = items.pop() ?? { kind: 'text', text: '' }
        const holder: Node = last.kind === 'scripts' || last.kind === 'big' ? last : { kind: 'scripts', base: last, sup: null, sub: null }
        if (holder.kind === 'scripts' || holder.kind === 'big') {
          if (char === '^') holder.sup = script
          else holder.sub = script
        }
        items.push(holder)
        continue
      }
      items.push(atom())
    }
    return { kind: 'row', items }
  }
  const tree = row()
  if (at < tex.length) throw new MathError('text left over')
  return tree
}

const widthOf = (text: string) => [...text].length

const padTo = (text: string, width: number) => text + ' '.repeat(Math.max(0, width - widthOf(text)))

const center = (text: string, width: number) => {
  const room = Math.max(0, width - widthOf(text))
  return ' '.repeat(Math.floor(room / 2)) + text + ' '.repeat(Math.ceil(room / 2))
}

const blockWidth = (block: MathBlock) => Math.max(0, ...block.lines.map(widthOf))

const text = (value: string): MathBlock => ({ lines: [value], base: 0 })

/** Blocks side by side, lined up on their bases. */
export const hcat = (blocks: readonly MathBlock[]): MathBlock => {
  if (blocks.length === 0) return text('')
  const above = Math.max(...blocks.map(block => block.base))
  const below = Math.max(...blocks.map(block => block.lines.length - block.base - 1))
  const lines = Array.from({ length: above + below + 1 }, () => '')
  for (const block of blocks) {
    const width = blockWidth(block)
    const top = above - block.base
    lines.forEach((_, row) => {
      lines[row] += padTo(block.lines[row - top] ?? '', width)
    })
  }
  return { lines: lines.map(line => line.replace(/\s+$/, '')), base: above }
}

/** Text on one row in super- or subscript letters, or null when one has no such letter. */
const scriptOf = (block: MathBlock, map: Record<string, string>): string | null => {
  if (block.lines.length !== 1) return null
  const chars = [...block.lines[0]!.replace(/\s+/g, '')]
  if (chars.length === 0 || chars.some(char => map[char] === undefined)) return null
  return chars.map(char => map[char]).join('')
}

const layout = (node: Node, isDisplay: boolean): MathBlock => {
  switch (node.kind) {
    case 'text':
      return text(node.text)
    case 'row':
      return hcat(node.items.map(item => layout(item, isDisplay)))
    case 'frac': {
      const top = layout(node.top, isDisplay)
      const bottom = layout(node.bottom, isDisplay)
      if (!isDisplay) {
        const wrap = (block: MathBlock) => (block.lines[0]!.length > 1 ? `(${block.lines[0]})` : block.lines[0]!)
        if (top.lines.length === 1 && bottom.lines.length === 1) return text(`${wrap(top)}/${wrap(bottom)}`)
      }
      const width = Math.max(blockWidth(top), blockWidth(bottom)) + 2
      return { lines: [...top.lines.map(line => center(line, width)), '─'.repeat(width), ...bottom.lines.map(line => center(line, width))], base: top.lines.length }
    }
    case 'sqrt': {
      const body = layout(node.body, isDisplay)
      if (body.lines.length === 1) return isDisplay ? { lines: [` ${'_'.repeat(blockWidth(body))}`, `√${body.lines[0]}`], base: 1 } : text(`√(${body.lines[0]})`)
      return hcat([text('√('), body, text(')')])
    }
    case 'scripts': {
      const base = layout(node.base, isDisplay)
      const sup = node.sup === null ? null : layout(node.sup, isDisplay)
      const sub = node.sub === null ? null : layout(node.sub, isDisplay)
      const supText = sup === null ? '' : scriptOf(sup, SUPER)
      const subText = sub === null ? '' : scriptOf(sub, SUB)
      if (supText !== null && subText !== null && base.lines.length === 1) return { lines: [`${base.lines[0]}${supText}${subText}`], base: 0 }
      const parts: MathBlock[] = [base]
      if (sup !== null) parts.push({ lines: [...sup.lines.map(line => `^${line}`), ''], base: sup.lines.length })
      if (sub !== null) parts.push({ lines: ['', ...sub.lines.map(line => `_${line}`)], base: 0 })
      return hcat(parts)
    }
    case 'big': {
      const sup = node.sup === null ? null : layout(node.sup, isDisplay)
      const sub = node.sub === null ? null : layout(node.sub, isDisplay)
      if (!isDisplay) {
        const inline = `${node.symbol}${sub === null ? '' : (scriptOf(sub, SUB) ?? `_${sub.lines[0]}`)}${sup === null ? '' : (scriptOf(sup, SUPER) ?? `^${sup.lines[0]}`)}`
        return text(`${inline} `)
      }
      const width = Math.max(widthOf(node.symbol), sup === null ? 0 : blockWidth(sup), sub === null ? 0 : blockWidth(sub))
      const upper = sup?.lines.map(line => center(line, width)) ?? []
      const lower = sub?.lines.map(line => center(line, width)) ?? []
      return { lines: [...upper, center(node.symbol, width) + ' ', ...lower], base: upper.length }
    }
  }
}

/** A display formula laid out in rows, fractions and limits stacked; null when it cannot be read. */
export const displayOf = (tex: string): MathBlock | null => {
  try {
    const lines = tex.split(/\\\\\s*\n?|\n(?=\s*&)/).map(line => line.replace(/&/g, ''))
    const blocks = lines.map(line => layout(parseTex(line), true))
    return { lines: blocks.flatMap((block, i) => (i === 0 ? block.lines : ['', ...block.lines])), base: 0 }
  } catch {
    return null
  }
}

/** An inline formula on one row in Unicode; null when it cannot be read. */
export const inlineOf = (tex: string): string | null => {
  try {
    const block = layout(parseTex(tex), false)
    return block.lines.length === 1 ? block.lines[0]!.replace(/\s+/g, ' ').trim() : null
  } catch {
    return null
  }
}

// `$…$` that is a formula, not a price: something TeX-like inside, no space just inside the marks.
const INLINE = /(?<![\\$\w])\$(?!\s)([^$\n]*?[\\^_{}][^$\n]*?)(?<!\s)\$(?![\w$])/g

/**
 * Prose with each inline formula turned into Unicode; a formula it cannot read is left as
 * written, and so is everything inside a code span.
 */
export const withInlineMath = (prose: string): string =>
  prose
    .split(/(`[^`\n]*`)/)
    .map((part, i) =>
      i % 2 === 1
        ? part
        : part.replace(INLINE, (whole, tex: string) => {
            const unicode = inlineOf(tex)
            return unicode === null ? whole : unicode
          }),
    )
    .join('')
