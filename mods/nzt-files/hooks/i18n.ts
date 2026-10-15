/** The languages the pane speaks; names and contents of files are shown as they are. */
export type Lang = 'es' | 'en'

/** The mod's `language` option; anything else, unset included, is the default. */
export const langOf = (value: unknown): Lang => (value === 'en' ? 'en' : 'es')

/** A size in bytes as a person reads it, with the language's decimal mark. */
const sizeIn = (decimal: string) => (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} KB`
  return `${(kb / 1024).toFixed(1).replace('.', decimal)} MB`
}

const thousands = (sep: string) => (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep)

const es = thousands('.')
const en = thousands(',')

export const TEXTS = {
  es: {
    title: 'Archivos',
    commandDescription: 'Abre o cierra el explorador del proyecto: carpetas, marcas de git y el archivo elegido',
    paneOpened: 'Explorador abierto.',
    paneClosed: 'Explorador cerrado.',
    paneWaiting: (reason: string) => `El explorador está esperando: ${reason}`,
    paneInlineNoFullscreen:
      'Explorador abierto sobre el prompt: Claude Code lo pone al costado de la conversación solo en pantalla completa.',
    paneInlineNarrow: (columns: number, floor: number) =>
      `Explorador abierto sobre el prompt: la terminal tiene ${columns} columnas y al costado hacen falta ${floor}.`,
    changed: (n: number) => `${n} ${n === 1 ? 'cambiado' : 'cambiados'}`,
    noGit: 'sin git',
    close: 'Cerrar',
    pick: 'Elegí un archivo del árbol.',
    reading: 'Leyendo el proyecto…',
    loading: 'Leyendo el archivo…',
    marks: { M: 'M modificado', U: 'U nuevo', A: 'A nuevo', D: 'D borrado' },
    image: (format: string) => `imagen ${format}`,
    text: 'texto',
    size: sizeIn(','),
    lineCount: (n: number) => `${es(n)} ${n === 1 ? 'línea' : 'líneas'}`,
    shownOf: (n: number) => ` · se ven ${es(n)}`,
    lines: (from: number, to: number, total: number, isCut: boolean) =>
      `líneas ${es(from)}–${es(to)} de ${es(total)}${isCut ? ' · sigue' : ''}`,
    allLines: (total: number) => `${es(total)} ${total === 1 ? 'línea' : 'líneas'}`,
    empty: 'El archivo está vacío.',
    binary: 'Archivo binario: no se muestra su contenido.',
    tooBig: 'Es más grande de lo que Claude Code deja leer a un mod (4 MiB).',
    deleted: 'Se borró desde el último commit.',
    deletedHint: 'Su diff está en /nzt-changes.',
    gone: 'Este archivo ya no existe.',
    unreadable: 'No se pudo leer el archivo.',
    folderUnreadable: (message: string) => `no se pudo leer: ${message}`,
    above: (n: number) => `↑ ${n} más`,
    below: (n: number) => `↓ ${n} más`,
  },
  en: {
    title: 'Files',
    commandDescription: "Opens or closes the project's explorer: folders, git marks and the chosen file",
    paneOpened: 'Explorer opened.',
    paneClosed: 'Explorer closed.',
    paneWaiting: (reason: string) => `The explorer is waiting: ${reason}`,
    paneInlineNoFullscreen:
      'Explorer opened above the prompt: Claude Code docks it beside the conversation only in fullscreen.',
    paneInlineNarrow: (columns: number, floor: number) =>
      `Explorer opened above the prompt: the terminal has ${columns} columns and docking needs ${floor}.`,
    changed: (n: number) => `${n} changed`,
    noGit: 'no git',
    close: 'Close',
    pick: 'Pick a file from the tree.',
    reading: 'Reading the project…',
    loading: 'Reading the file…',
    marks: { M: 'M modified', U: 'U untracked', A: 'A added', D: 'D deleted' },
    image: (format: string) => `${format} image`,
    text: 'text',
    size: sizeIn('.'),
    lineCount: (n: number) => `${en(n)} ${n === 1 ? 'line' : 'lines'}`,
    shownOf: (n: number) => ` · ${en(n)} shown`,
    lines: (from: number, to: number, total: number, isCut: boolean) =>
      `lines ${en(from)}–${en(to)} of ${en(total)}${isCut ? ' · more' : ''}`,
    allLines: (total: number) => `${en(total)} ${total === 1 ? 'line' : 'lines'}`,
    empty: 'The file is empty.',
    binary: 'Binary file: its content is not shown.',
    tooBig: 'It is larger than Claude Code lets a mod read (4 MiB).',
    deleted: 'Deleted since the last commit.',
    deletedHint: 'Its diff is in /nzt-changes.',
    gone: 'This file no longer exists.',
    unreadable: 'The file could not be read.',
    folderUnreadable: (message: string) => `could not be read: ${message}`,
    above: (n: number) => `↑ ${n} more`,
    below: (n: number) => `↓ ${n} more`,
  },
} as const

export type Texts = (typeof TEXTS)[Lang]
