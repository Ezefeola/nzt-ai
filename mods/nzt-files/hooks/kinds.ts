/**
 * What a file is, by its extension: a named kind, an image of some format, plain text, or
 * nothing for a file with no extension. The same table as nzt-changes, so both panes name a
 * file alike.
 */
export type Kind = { kind: 'named'; name: string } | { kind: 'image'; format: string } | { kind: 'text' }

const NAMED: Record<string, string> = {
  md: 'Markdown',
  markdown: 'Markdown',
  json: 'JSON',
  jsonc: 'JSON',
  yml: 'YAML',
  yaml: 'YAML',
  ts: 'TypeScript',
  tsx: 'TypeScript',
  mts: 'TypeScript',
  cts: 'TypeScript',
  js: 'JavaScript',
  jsx: 'JavaScript',
  mjs: 'JavaScript',
  cjs: 'JavaScript',
  cs: 'C#',
  html: 'HTML',
  htm: 'HTML',
  css: 'CSS',
  py: 'Python',
  sh: 'Shell',
  ps1: 'PowerShell',
  xml: 'XML',
  sql: 'SQL',
}

const IMAGES = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'svg'])

export const kindOf = (path: string): Kind | undefined => {
  const name = path.slice(path.lastIndexOf('/') + 1)
  const dot = name.lastIndexOf('.')
  // A name that only starts with a dot (.gitignore) has no extension.
  if (dot <= 0 || dot === name.length - 1) return undefined
  const extension = name.slice(dot + 1).toLowerCase()
  const named = NAMED[extension]
  if (named !== undefined) return { kind: 'named', name: named }
  if (IMAGES.has(extension)) return { kind: 'image', format: extension === 'jpeg' ? 'JPG' : extension.toUpperCase() }
  if (extension === 'txt') return { kind: 'text' }
  return { kind: 'named', name: extension.toUpperCase() }
}

/** An image the viewer does not read: its bytes are not text. SVG is text, and is read. */
export const isPictureFile = (path: string) => {
  const kind = kindOf(path)
  return kind?.kind === 'image' && kind.format !== 'SVG'
}
