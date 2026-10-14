import type { Phase, Status } from '../types'
import type { Lang } from './i18n'

/**
 * NZT's phases in the order skills/nzt/SKILL.md §4 lists them, each with its label
 * per language and the spellings a state.json may use for it.
 */
export const PHASES = [
  { id: 'analysis', color: '#9B7BEA', label: { es: 'Análisis', en: 'Analysis' }, names: ['analysis', 'discovery', 'análisis', 'analisis'] },
  { id: 'architecture', color: '#4C8DF6', label: { es: 'Arquitectura', en: 'Architecture' }, names: ['architecture', 'arquitectura'] },
  { id: 'ux', color: '#EC5FA6', label: { es: 'UX', en: 'UX' }, names: ['ux', 'design', 'diseño'] },
  { id: 'build', color: '#F59E0B', label: { es: 'Build', en: 'Build' }, names: ['build', 'construcción', 'construccion'] },
  { id: 'verify', color: '#2BC4B0', label: { es: 'Verificación', en: 'Verify' }, names: ['verify', 'qa', 'verificación', 'verificacion'] },
  { id: 'ship', color: '#E5B53B', label: { es: 'Release', en: 'Ship' }, names: ['ship', 'release', 'deploy'] },
] as const

export type PhaseId = (typeof PHASES)[number]['id']

/** The color of a phase NZT does not know. */
export const NEUTRAL = '#9CA3AF'

/** `phase` is the name the file gives the phase (an older state: its id), for its color and hat. */
export type Step = { phase: string; label: string; status: Status; rawStatus?: string }

const indexOf = (phase: string) => {
  const name = phase.trim().toLowerCase()
  return PHASES.findIndex(one => (one.names as readonly string[]).includes(name))
}

/** The id of a phase NZT knows, by any of its spellings; undefined for any other. */
export const idOf = (phase: string): PhaseId | undefined => PHASES[indexOf(phase)]?.id

export const colorOf = (phase: string) => PHASES[indexOf(phase)]?.color ?? NEUTRAL

/** A phase NZT knows gets its label; any other is shown as the file writes it. */
export const labelOf = (phase: string, lang: Lang = 'es') =>
  PHASES[indexOf(phase)]?.label[lang] ?? phase

/**
 * The steps the timeline draws. A state with `phases` is drawn as it says.
 * An older one with a single `phase` gets all six, the ones before it done;
 * `isComplete` closes every step there, since nothing else would.
 */
export const timelineOf = (
  phases: Phase[] | null,
  legacyPhase: string | null,
  isComplete: boolean,
  lang: Lang = 'es',
): Step[] => {
  if (phases !== null) {
    return phases.map(one => ({
      phase: one.name,
      label: labelOf(one.name, lang),
      status: one.status,
      rawStatus: one.rawStatus,
    }))
  }

  const current = legacyPhase === null ? -1 : indexOf(legacyPhase)
  return PHASES.map((one, index) => ({
    phase: one.id,
    label: one.label[lang],
    status: isComplete || index < current ? 'done' : index === current ? 'doing' : 'todo',
  }))
}
