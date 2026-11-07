import { kindOf } from './kinds'

// The app draws an Svg as an image, out of its theme: a mid gray reads on a light and a dark one.
const STROKE = '#8b949e'

const svg = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="${STROKE}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`

/** The outline icons the app's own explorer draws: a page, code, a picture, the search's lens. */
export const APP_ICONS = {
  doc: svg('<path d="M4 1.5h5.5l3 3v10h-8.5z"/><path d="M9.5 1.5v3h3"/>'),
  code: svg('<path d="M6 4.5 2.5 8 6 11.5"/><path d="M10 4.5 13.5 8 10 11.5"/>'),
  image: svg('<rect x="2" y="3" width="12" height="10" rx="1"/><circle cx="6" cy="6.5" r="1"/><path d="m2.5 12 4-4 3 3 2-2 2.5 2.5"/>'),
  search: svg('<circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3.5 3.5"/>'),
} as const

const CODE = new Set(['JSON', 'YAML', 'TypeScript', 'JavaScript', 'C#', 'HTML', 'CSS', 'Python', 'Shell', 'PowerShell', 'XML', 'SQL'])

/** Which icon a file takes in the app: code for a language, a picture for an image, else a page. */
export const appIconOf = (path: string): keyof typeof APP_ICONS => {
  const kind = kindOf(path)
  if (kind?.kind === 'image') return 'image'
  return kind?.kind === 'named' && CODE.has(kind.name) ? 'code' : 'doc'
}
