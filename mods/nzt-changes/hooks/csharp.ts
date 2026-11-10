/**
 * C# colored the way Visual Studio's dark theme colors it, told from the shape of the text
 * alone: Claude Code's highlighter leaves methods, types and variables plain, and a mod
 * cannot add a grammar to it. Without the compiler a name is guessed from where it stands,
 * so a property can pass for a type now and then.
 */

export type Kind =
  | 'plain'
  | 'keyword'
  | 'control'
  | 'type'
  | 'interface'
  | 'method'
  | 'variable'
  | 'member'
  | 'string'
  | 'number'
  | 'comment'
  | 'preprocessor'

export type Token = { text: string; kind: Kind }

/** Visual Studio 2022's dark theme. */
export const CSHARP_COLORS: Record<Exclude<Kind, 'plain'>, string> = {
  keyword: '#569CD6',
  control: '#D8A0DF',
  type: '#4EC9B0',
  interface: '#B8D7A3',
  method: '#DCDCAA',
  variable: '#9CDCFE',
  member: '#DCDCDC',
  string: '#D69D85',
  number: '#B5CEA8',
  comment: '#57A64A',
  preprocessor: '#9B9B9B',
}

export const isCSharpFile = (path: string) => /\.csx?$/i.test(path)

const CONTROL = new Set(
  'if else switch case default for foreach while do break continue return throw try catch finally goto yield await when'.split(' '),
)

const KEYWORDS = new Set(
  [
    'abstract as base bool byte char checked class const decimal delegate double enum event explicit extern false fixed',
    'float implicit in int interface internal is lock long namespace new null object operator out override params private',
    'protected public readonly ref sbyte sealed short sizeof stackalloc static string struct this true typeof uint ulong',
    'unchecked unsafe ushort using virtual void volatile var async dynamic nameof record init required get set value',
    'where with and or not global partial file scoped let from select orderby group by into join on equals ascending descending',
  ]
    .join(' ')
    .split(' '),
)

/** Where a line starts: inside a block comment or a verbatim string left open by the lines above. */
export type LineState = 'code' | 'comment' | 'verbatim'

const IDENT = /[A-Za-z_][A-Za-z0-9_]*/y
const NUMBER = /(?:0[xX][0-9A-Fa-f_]+|0[bB][01_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?)[uUlLfFdDmM]*/y

/** What an identifier is, from the word itself, the text before it and the text after it. */
const kindOfName = (name: string, before: string, after: string): Kind => {
  if (CONTROL.has(name)) return 'control'
  if (KEYWORDS.has(name)) return 'keyword'
  const next = after.trimStart()
  // A generic call, `Select<T>(`, is a method too.
  if (next.startsWith('(') || /^<[\w\s,.<>?[\]]*>\s*\(/.test(next)) {
    if (/\bnew\s+$/.test(before)) return 'type'
    return 'method'
  }
  const isPascal = /^[A-Z]/.test(name)
  if (before.trimEnd().endsWith('.')) return isPascal ? 'member' : 'variable'
  if (/^I[A-Z][a-z]/.test(name)) return 'interface'
  return isPascal ? 'type' : 'variable'
}

/** One line cut into colored tokens, and the state the next line starts in. */
export const tokensOf = (line: string, state: LineState = 'code'): { tokens: Token[]; next: LineState } => {
  const tokens: Token[] = []
  const push = (text: string, kind: Kind) => {
    if (text === '') return
    const last = tokens[tokens.length - 1]
    if (last !== undefined && last.kind === kind) last.text += text
    else tokens.push({ text, kind })
  }
  let i = 0
  if (state === 'comment') {
    const end = line.indexOf('*/')
    if (end < 0) return { tokens: [{ text: line, kind: 'comment' }], next: 'comment' }
    push(line.slice(0, end + 2), 'comment')
    i = end + 2
  } else if (state === 'verbatim') {
    const end = closeOfVerbatim(line, 0)
    if (end < 0) return { tokens: [{ text: line, kind: 'string' }], next: 'verbatim' }
    push(line.slice(0, end), 'string')
    i = end
  }
  if (state === 'code' && /^\s*#/.test(line)) return { tokens: [{ text: line, kind: 'preprocessor' }], next: 'code' }
  while (i < line.length) {
    const rest = line.slice(i)
    if (rest.startsWith('//')) {
      push(rest, 'comment')
      break
    }
    if (rest.startsWith('/*')) {
      const end = line.indexOf('*/', i + 2)
      if (end < 0) {
        push(rest, 'comment')
        return { tokens, next: 'comment' }
      }
      push(line.slice(i, end + 2), 'comment')
      i = end + 2
      continue
    }
    const quote = /^(\$?@|@\$?|\$+)?("""|"|')/.exec(rest)
    if (quote !== null) {
      const prefix = quote[1] ?? ''
      const mark = quote[2]!
      const from = i + prefix.length + mark.length
      if (mark === '"' && prefix.includes('@')) {
        const end = closeOfVerbatim(line, from)
        if (end < 0) {
          push(rest, 'string')
          return { tokens, next: 'verbatim' }
        }
        push(line.slice(i, end), 'string')
        i = end
      } else {
        const end = closeOf(line, from, mark)
        push(line.slice(i, end), 'string')
        i = end
      }
      continue
    }
    NUMBER.lastIndex = i
    const number = /[0-9]/.test(line[i]!) ? NUMBER.exec(line) : null
    if (number !== null) {
      push(number[0], 'number')
      i += number[0].length
      continue
    }
    IDENT.lastIndex = i
    const isVerbatimName = line[i] === '@' && /[A-Za-z_]/.test(line[i + 1] ?? '')
    if (isVerbatimName) IDENT.lastIndex = i + 1
    const word = /[A-Za-z_@]/.test(line[i]!) ? IDENT.exec(line) : null
    if (word !== null) {
      const start = isVerbatimName ? i + 1 : i
      const end = start + word[0].length
      push(line.slice(i, end), kindOfName(word[0], line.slice(0, i), line.slice(end)))
      i = end
      continue
    }
    push(line[i]!, 'plain')
    i++
  }
  return { tokens, next: 'code' }
}

/** Where a regular string or char that opened before `from` ends: past its closing mark, or the line's end. */
const closeOf = (line: string, from: number, mark: string) => {
  if (mark === '"""') {
    const end = line.indexOf('"""', from)
    return end < 0 ? line.length : end + 3
  }
  for (let i = from; i < line.length; i++) {
    if (line[i] === '\\') i++
    else if (line[i] === mark) return i + 1
  }
  return line.length
}

/** Where a verbatim string ends, `""` being a quote inside it: past its closing quote, or -1 if it goes on. */
const closeOfVerbatim = (line: string, from: number) => {
  for (let i = from; i < line.length; i++) {
    if (line[i] !== '"') continue
    if (line[i + 1] === '"') i++
    else return i + 1
  }
  return -1
}

/** The state each line starts in, the first one in `code`. */
export const statesOf = (lines: string[]): LineState[] => {
  const states: LineState[] = []
  let state: LineState = 'code'
  for (const line of lines) {
    states.push(state)
    state = tokensOf(line, state).next
  }
  return states
}
