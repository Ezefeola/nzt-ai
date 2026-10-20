import type { Question } from '../types'

/** One line of the message: the question's identifier or number, what was answered, and the note. */
export function lineOf(question: Question, noteWord: string): string {
  const label = question.id ?? String(question.number)
  const option = question.options.find(one => one.name === question.answer.option)
  const answer =
    option === undefined
      ? (question.answer.text ?? '').trim()
      : `${option.letter === undefined ? '' : `${option.letter} — `}${option.name}`
  const note = (question.answer.note ?? '').trim()
  return `${label}: ${answer}${note === '' ? '' : ` · ${noteWord}: ${note}`}`
}

/** The message for the answered questions, one line each, in the order they are held. */
export const messageOf = (questions: Question[], noteWord: string) =>
  questions
    .filter(question => question.status === 'answered')
    .map(question => lineOf(question, noteWord))
    .join('\n')

/** What goes after the draft: the message on a line of its own when the draft does not end in one. */
export const afterDraft = (message: string, draft: string) =>
  draft === '' || draft.endsWith('\n') ? message : `\n${message}`
