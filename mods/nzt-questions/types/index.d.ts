/** One option of a question, as the agent wrote it: its letter if it had one, its name, what it says after the name. */
export type Option = { letter?: string; name: string; explain: string; isRecommended: boolean }

/** A question as the text gave it: its key, its identifier if it had one, its text and its options. */
export type Parsed = { key: string; id?: string; text: string; options: Option[] }

/** What the person answered: an option by its name, or a text of their own, and a note on either. */
export type Answer = { option?: string; text?: string; note?: string }

export type Status = 'pending' | 'answered' | 'skipped' | 'sent'

/**
 * A question the pane holds: what the text gave, its place among the questions of the answer
 * it last came in, where it stands, and whether a rewrite took its answer away.
 */
export type Question = Parsed & { number: number; status: Status; isChanged: boolean; answer: Answer }

/** What the pane shows below the index: the chosen question, the message about to go, or the one that went. */
export type View = 'question' | 'review' | 'sent'

/** Something the last action left to say: a reading that failed, a fill refused, a draft kept. */
export type Notice = { kind: 'readFailed'; message: string } | { kind: 'fillFailed' } | { kind: 'appended' }

declare module 'claude-code' {
  interface PluginState {
    'nzt-questions': {
      questions: Question[]
      /** The key of the question on show. */
      current: string | null
      /** How many questions are not sent: what nzt-state reads for its notice. */
      pending: number
      view: View
      /** The message as it went to the prompt; a later rewrite of a question does not change it. */
      sent: string
      notice: Notice | null
    }
  }
}
