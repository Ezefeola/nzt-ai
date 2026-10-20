import type { CodeColors, Palette } from '../types'

export type TokenKind = 'keyword' | 'string' | 'number' | 'comment' | 'type' | 'function' | 'property' | 'variable' | 'deleted' | 'plain'

export type Token = { kind: TokenKind; text: string }

type Rule = { kind: TokenKind; pattern: RegExp }

type Grammar = { rules: Rule[]; keywords: ReadonlySet<string>; types?: ReadonlySet<string> }

const words = (list: string) => new Set(list.split(/\s+/).filter(Boolean))

const C_STRINGS: Rule[] = [
  { kind: 'string', pattern: /"(?:[^"\\\n]|\\.)*"?/y },
  { kind: 'string', pattern: /'(?:[^'\\\n]|\\.)*'?/y },
]
const C_COMMENTS: Rule[] = [
  { kind: 'comment', pattern: /\/\/[^\n]*/y },
  { kind: 'comment', pattern: /\/\*[\s\S]*?(?:\*\/|$)/y },
]
const NUMBER: Rule = { kind: 'number', pattern: /\b(?:0x[\da-f_]+|0b[01_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:e[+-]?\d+)?)[a-z]*\b/iy }
const FUNCTION: Rule = { kind: 'function', pattern: /[A-Za-z_$][\w$]*(?=\s*\()/y }
const IDENT: Rule = { kind: 'plain', pattern: /[A-Za-z_$][\w$]*/y }

const JS = words(
  'abstract as async await break case catch class const continue debugger declare default delete do else enum export extends false finally for from function get if implements import in instanceof interface is keyof let namespace new null of private protected public readonly return satisfies set static super switch this throw true try type typeof undefined var void while with yield',
)
const JAVA_LIKE = words(
  'abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new null package private protected public return short static strictfp super switch synchronized this throw throws transient true false try void volatile while var val fun object when is in out override data sealed internal lateinit companion init get set async await base bool decimal delegate event explicit extern fixed foreach implicit lock namespace operator params readonly ref sbyte sizeof stackalloc string struct uint ulong unchecked unsafe ushort using virtual record required init with yield nameof dynamic',
)
const C_LIKE = words(
  'auto break case char const continue default do double else enum extern float for goto if inline int long register restrict return short signed sizeof static struct switch typedef union unsigned void volatile while bool true false nullptr class namespace template typename public private protected virtual override new delete this using constexpr noexcept include define',
)
const GO = words('break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var true false nil iota')
const RUST = words(
  'as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while Some None Ok Err',
)
const PY = words(
  'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case self print',
)
const SH = words(
  'if then else elif fi for while until do done case esac in function return local export readonly unset shift exit echo cd source alias set declare true false function param foreach where select',
)
const SQL = words(
  'select from where and or not insert into values update set delete create table alter drop index view join left right inner outer full on as group by order having limit offset union all distinct case when then else end is null like in between exists primary key foreign references default constraint begin commit rollback with returning',
)

const cFamily = (keywords: ReadonlySet<string>): Grammar => ({
  keywords,
  rules: [...C_COMMENTS, ...C_STRINGS, { kind: 'string', pattern: /`(?:[^`\\]|\\.)*`?/y }, NUMBER, FUNCTION, IDENT],
})

const GRAMMARS: Record<string, Grammar> = {
  js: cFamily(JS),
  java: cFamily(JAVA_LIKE),
  c: cFamily(C_LIKE),
  go: cFamily(GO),
  rust: { keywords: RUST, rules: [...C_COMMENTS, { kind: 'string', pattern: /"(?:[^"\\]|\\.)*"?/y }, NUMBER, FUNCTION, IDENT] },
  py: {
    keywords: PY,
    rules: [
      { kind: 'comment', pattern: /#[^\n]*/y },
      { kind: 'string', pattern: /[rbfu]{0,2}(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$))/iy },
      { kind: 'string', pattern: /[rbfu]{0,2}(?:"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)/iy },
      { kind: 'type', pattern: /@[\w.]+/y },
      NUMBER,
      FUNCTION,
      IDENT,
    ],
  },
  sh: {
    keywords: SH,
    rules: [
      { kind: 'comment', pattern: /#[^\n]*/y },
      ...C_STRINGS,
      { kind: 'variable', pattern: /\$(?:\{[^}]*\}|[\w@*#?$!-]+)/y },
      { kind: 'property', pattern: /(?<=\s)--?[\w-]+/y },
      NUMBER,
      { kind: 'plain', pattern: /[A-Za-z_][\w-]*/y },
    ],
  },
  json: {
    keywords: words('true false null'),
    rules: [
      { kind: 'property', pattern: /"(?:[^"\\\n]|\\.)*"(?=\s*:)/y },
      { kind: 'string', pattern: /"(?:[^"\\\n]|\\.)*"?/y },
      NUMBER,
      IDENT,
    ],
  },
  yaml: {
    keywords: words('true false null yes no on off'),
    rules: [
      { kind: 'comment', pattern: /#[^\n]*/y },
      { kind: 'property', pattern: /[\w.-]+(?=\s*:(?:\s|$))/y },
      ...C_STRINGS,
      NUMBER,
      IDENT,
    ],
  },
  toml: {
    keywords: words('true false'),
    rules: [
      { kind: 'comment', pattern: /#[^\n]*/y },
      { kind: 'type', pattern: /\[[^\]\n]*\]/y },
      { kind: 'property', pattern: /[\w.-]+(?=\s*=)/y },
      ...C_STRINGS,
      NUMBER,
      IDENT,
    ],
  },
  sql: {
    keywords: SQL,
    rules: [
      { kind: 'comment', pattern: /--[^\n]*/y },
      { kind: 'comment', pattern: /\/\*[\s\S]*?(?:\*\/|$)/y },
      { kind: 'string', pattern: /'(?:[^']|'')*'?/y },
      NUMBER,
      FUNCTION,
      IDENT,
    ],
  },
  css: {
    keywords: words('important'),
    rules: [
      { kind: 'comment', pattern: /\/\*[\s\S]*?(?:\*\/|$)/y },
      ...C_STRINGS,
      { kind: 'property', pattern: /[\w-]+(?=\s*:[^:])/y },
      { kind: 'type', pattern: /[.#][\w-]+/y },
      { kind: 'number', pattern: /#[\da-f]{3,8}\b|\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms)?/iy },
      IDENT,
    ],
  },
  html: {
    keywords: words(''),
    rules: [
      { kind: 'comment', pattern: /<!--[\s\S]*?(?:-->|$)/y },
      { kind: 'keyword', pattern: /<\/?[\w-]+|\/?>/y },
      { kind: 'property', pattern: /[\w-]+(?==)/y },
      ...C_STRINGS,
    ],
  },
  diff: {
    keywords: words(''),
    rules: [
      { kind: 'string', pattern: /^\+[^\n]*/my },
      { kind: 'deleted', pattern: /^-[^\n]*/my },
      { kind: 'type', pattern: /^@@[^\n]*/my },
    ],
  },
}

const ALIASES: Record<string, string> = {
  js: 'js', javascript: 'js', jsx: 'js', mjs: 'js', cjs: 'js', ts: 'js', typescript: 'js', tsx: 'js', mts: 'js',
  java: 'java', kotlin: 'java', kt: 'java', cs: 'java', csharp: 'java', 'c#': 'java', scala: 'java', swift: 'java', dart: 'java', php: 'java',
  c: 'c', h: 'c', cpp: 'c', 'c++': 'c', cc: 'c', hpp: 'c', objc: 'c',
  go: 'go', golang: 'go',
  rust: 'rust', rs: 'rust',
  py: 'py', python: 'py', python3: 'py',
  sh: 'sh', bash: 'sh', zsh: 'sh', shell: 'sh', console: 'sh', powershell: 'sh', ps1: 'sh', pwsh: 'sh', fish: 'sh',
  json: 'json', jsonc: 'json', json5: 'json',
  yaml: 'yaml', yml: 'yaml',
  toml: 'toml', ini: 'toml',
  sql: 'sql', postgres: 'sql', mysql: 'sql', sqlite: 'sql',
  css: 'css', scss: 'css', less: 'css',
  html: 'html', xml: 'html', svg: 'html', vue: 'html', xaml: 'html', csproj: 'html',
  diff: 'diff', patch: 'diff',
}

/** The languages a shell block is written in: on the desktop they keep Claude Code's Run button. */
export const isShellLanguage = (language: string): boolean => ALIASES[language] === 'sh'

export const knows = (language: string): boolean => ALIASES[language.toLowerCase()] !== undefined

/** Each line of `code` as tokens; null for a language the highlighter does not know. */
export const highlight = (code: string, language: string): Token[][] | null => {
  const grammar = GRAMMARS[ALIASES[language.toLowerCase()] ?? '']
  if (grammar === undefined) return null
  const tokens: Token[] = []
  let at = 0
  const push = (kind: TokenKind, text: string) => {
    const last = tokens.at(-1)
    if (last !== undefined && last.kind === kind) last.text += text
    else tokens.push({ kind, text })
  }
  while (at < code.length) {
    let matched = false
    for (const rule of grammar.rules) {
      rule.pattern.lastIndex = at
      const match = rule.pattern.exec(code)
      if (match === null || match[0] === '') continue
      const text = match[0]
      const kind =
        rule.kind === 'plain' && grammar.keywords.has(text)
          ? 'keyword'
          : rule.kind === 'plain' && /^[A-Z][A-Za-z0-9]*[a-z][A-Za-z0-9]*$/.test(text)
            ? 'type'
            : rule.kind
      push(kind, text)
      at += text.length
      matched = true
      break
    }
    if (!matched) push('plain', code[at++]!)
  }
  // Tokens split at line ends, so each line draws on its own.
  const lines: Token[][] = [[]]
  for (const token of tokens) {
    token.text.split('\n').forEach((part, i) => {
      if (i > 0) lines.push([])
      if (part !== '') lines.at(-1)!.push({ kind: token.kind, text: part })
    })
  }
  return lines
}

/** The theme's color for a kind of token. */
export const tokenColor = (palette: Palette, kind: TokenKind, code: CodeColors | null = null): string | undefined =>
  (code !== null && kind !== 'variable' && kind !== 'deleted' ? code[kind] : undefined) ??
  ({
    keyword: palette.user,
    string: palette.ok,
    number: palette.warn,
    comment: palette.muted,
    type: palette.read,
    function: palette.web,
    property: palette.search,
    variable: palette.run,
    deleted: palette.err,
    plain: undefined,
  })[kind]
