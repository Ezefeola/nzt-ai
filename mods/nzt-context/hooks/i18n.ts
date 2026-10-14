/** The languages the band speaks; the line the model reads is always English. */
export type Lang = 'es' | 'en'

/** The mod's `language` option; anything else, unset included, is the default. */
export const langOf = (value: unknown): Lang => (value === 'en' ? 'en' : 'es')

export const TEXTS = {
  es: { label: 'contexto', noReading: 'sin lectura todavía' },
  en: { label: 'context', noReading: 'no reading yet' },
} as const satisfies Record<Lang, { label: string; noReading: string }>
