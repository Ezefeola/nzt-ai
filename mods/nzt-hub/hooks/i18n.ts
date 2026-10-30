import type { Kind, ModId } from './catalog'

/** The languages the pane speaks. */
export type Lang = 'es' | 'en'

/** The mod's `language` option; anything else, unset included, is the default. */
export const langOf = (value: unknown): Lang => (value === 'en' ? 'en' : 'es')

type Mod = { title: string; desc: string }

export const TEXTS = {
  es: {
    title: 'Mods',
    commandDescription: 'Abre o cierra el panel con los mods de NZT: para qué es cada uno y un botón que lo abre',
    paneOpened: 'Panel de mods abierto.',
    paneClosed: 'Panel de mods cerrado.',
    paneWaiting: (reason: string) => `El panel de mods está esperando: ${reason}`,
    paneInlineNoFullscreen:
      'Panel de mods abierto sobre el prompt: Claude Code lo pone al costado de la conversación solo en pantalla completa.',
    paneInlineNarrow: (columns: number, floor: number) =>
      `Panel de mods abierto sobre el prompt: la terminal tiene ${columns} columnas y al costado hacen falta ${floor}.`,
    subtitle: 'los mods de Claude Code',
    installed: (n: number, total: number) => `${n} de ${total} instalados`,
    searching: 'Buscando los mods…',
    open: 'Abrir ›',
    copy: 'Copiar instalación',
    copyShort: 'Copiar',
    notInstalled: 'no instalado',
    waiting: 'se abre al terminar el turno',
    waitingShort: 'al terminar el turno',
    copied: '✓ Copiado · pegalo en el prompt y apretá Enter.',
    copyFailed: 'No se pudo copiar: esta terminal no deja. Seleccionalo:',
    openFailed: (message: string) => `No se pudo abrir: ${message}`,
    below: (n: number) => `↓ ${n} más`,
    close: 'Cerrar',
    groups: { nzt: 'CON EL MÉTODO NZT', generic: 'PARA CUALQUIER PROYECTO' } satisfies Record<Kind, string>,
    mods: {
      'nzt-state': { title: 'Estado', desc: 'El plan y el estado de la corrida, leídos de Plan/state.json.' },
      'nzt-changes': { title: 'Cambios', desc: 'Lo que Claude editó en el último turno o contra HEAD, un diff por vez.' },
      'nzt-files': { title: 'Archivos', desc: 'El proyecto como el explorador de VS Code, solo para leer.' },
      'nzt-look': { title: 'Aspecto', desc: 'Temas, banda de uso con las marcas 30/40 de NZT y la conversación redibujada.' },
    } satisfies Record<ModId, Mod>,
  },
  en: {
    title: 'Mods',
    commandDescription: "Opens or closes the pane with NZT's mods: what each is for and a button that opens it",
    paneOpened: 'Mods pane opened.',
    paneClosed: 'Mods pane closed.',
    paneWaiting: (reason: string) => `The mods pane is waiting: ${reason}`,
    paneInlineNoFullscreen:
      'Mods pane opened above the prompt: Claude Code docks it beside the conversation only in fullscreen.',
    paneInlineNarrow: (columns: number, floor: number) =>
      `Mods pane opened above the prompt: the terminal has ${columns} columns and docking needs ${floor}.`,
    subtitle: "Claude Code's mods",
    installed: (n: number, total: number) => `${n} of ${total} installed`,
    searching: 'Looking for the mods…',
    open: 'Open ›',
    copy: 'Copy install',
    copyShort: 'Copy',
    notInstalled: 'not installed',
    waiting: 'opens when the turn ends',
    waitingShort: 'when the turn ends',
    copied: '✓ Copied · paste it in the prompt and press Enter.',
    copyFailed: 'Could not copy: this terminal does not allow it. Select it:',
    openFailed: (message: string) => `Could not open: ${message}`,
    below: (n: number) => `↓ ${n} more`,
    close: 'Close',
    groups: { nzt: 'WITH THE NZT METHOD', generic: 'FOR ANY PROJECT' } satisfies Record<Kind, string>,
    mods: {
      'nzt-state': { title: 'State', desc: "The run's plan and state, read from Plan/state.json." },
      'nzt-changes': { title: 'Changes', desc: "What Claude edited in the last turn or against HEAD, one diff at a time." },
      'nzt-files': { title: 'Files', desc: "The project like VS Code's explorer, read only." },
      'nzt-look': { title: 'Look', desc: "Themes, a usage band with NZT's 30/40 marks and a redrawn conversation." },
    } satisfies Record<ModId, Mod>,
  },
} as const

export type Texts = (typeof TEXTS)[Lang]
