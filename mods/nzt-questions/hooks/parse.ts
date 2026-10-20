import type { Answer, Option, Parsed, Question, Status } from '../types'

const FENCE = /^\s*(```|~~~)/
const QUOTE = /^\s*>/
const TABLE = /^\s*\|/
const HEADING = /^\s*#{1,6}\s+/
const BULLET = /^\s*[-*+]\s+/
const NUMBERED = /^\s*(\d{1,3}|[A-Za-z])[.)]\s+/
// An identifier has letters before its number (QT-03, Q-1), or is a hash and a number (#4).
const IDENT = /^([A-Za-z]+-\d+|#\d+)\s*(?:[·:.)]\s*)?/
const LETTER = /^([A-Z]|\d{1,2})\s*[·.):]\s+/
// The mark of the recommended option in either language, with the brackets and emphasis around it.
const RECOMMENDED = /\s*[*_]*\(?\s*★?\s*(?:recomendad[ao]|recommended)\s*\)?[*_]*/gi

const unmark = (text: string) =>
  text
    .replace(/\*\*|__/g, '')
    .replace(/^[*_\s]+|[*_\s]+$/g, '')
    .trim()

const endsInQuestion = (line: string) => line.replace(/[\s*_`]+$/, '').endsWith('?')

const indentOf = (line: string) => line.length - line.trimStart().length

const itemOf = (line: string) => line.replace(BULLET, '').replace(NUMBERED, '')

/** The key a question is known by: its identifier, or its text with the markup and case out. */
export const keyOf = (id: string | undefined, text: string) =>
  id ??
  text
    .toLowerCase()
    .replace(/[¿?¡!.,;:"'`*_()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

function headOf(line: string): { id?: string; text: string } {
  const bare = unmark(line.replace(HEADING, '').replace(BULLET, '').replace(NUMBERED, ''))
  const ident = IDENT.exec(bare)
  if (ident === null) return { text: bare }
  return { id: ident[1], text: bare.slice(ident[0].length).trim() }
}

function optionOf(item: string): Option {
  const isRecommended = item.search(RECOMMENDED) >= 0
  const raw = item.replace(RECOMMENDED, '').trim()

  let head: string
  let explain: string
  const bold = /^\*\*(.+?)\*\*(.*)$/.exec(raw)
  if (bold !== null) {
    head = bold[1]!
    explain = bold[2]!
  } else {
    const letter = LETTER.exec(raw)
    const rest = letter === null ? raw : raw.slice(letter[0].length)
    const cut = rest.indexOf(' — ') >= 0 ? rest.indexOf(' — ') : rest.indexOf(': ')
    head = (letter === null ? '' : letter[0]) + (cut < 0 ? rest : rest.slice(0, cut))
    explain = cut < 0 ? '' : rest.slice(cut)
  }

  const letter = LETTER.exec(head.trim())
  const name = unmark(letter === null ? head : head.trim().slice(letter[0].length))
  const option: Option = {
    name,
    explain: unmark(explain.trim().replace(/^(—|-|:)\s*/, '')),
    isRecommended,
  }
  return letter === null ? option : { letter: letter[1]!, ...option }
}

/**
 * The questions of an answer: each line ending in `?` outside code blocks, quotes and tables,
 * and as its options the list right below it, one blank line allowed in between. A bullet
 * ending in `?` inside that list is an option; a numbered one starts the next question.
 */
export function parse(answer: string): Parsed[] {
  const lines = answer.split(/\r?\n/)
  const found = new Map<string, Parsed>()
  let isInFence = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (FENCE.test(line)) {
      isInFence = !isInFence
      continue
    }
    if (isInFence || QUOTE.test(line) || TABLE.test(line) || !endsInQuestion(line)) continue

    const { id, text } = headOf(line)
    if (text === '') continue
    const options: Option[] = []
    let j = i + 1
    if (lines[j]?.trim() === '') j++
    while (j < lines.length) {
      const next = lines[j]!
      if (next.trim() === '' || FENCE.test(next)) break
      const isNumbered = NUMBERED.test(next) && !BULLET.test(next)
      if (BULLET.test(next) || (isNumbered && !endsInQuestion(next))) {
        options.push(optionOf(itemOf(next)))
      } else if (options.length > 0 && indentOf(next) > 0) {
        const last = options[options.length - 1]!
        options[options.length - 1] = { ...last, explain: `${last.explain} ${unmark(next)}`.trim() }
      } else break
      j++
    }
    if (options.length > 0) i = j - 1

    const key = keyOf(id, text)
    found.delete(key)
    found.set(key, id === undefined ? { key, text, options } : { key, id, text, options })
  }
  return [...found.values()]
}

export const isAnswered = (answer: Answer) => answer.option !== undefined || (answer.text ?? '').trim() !== ''

/** How many questions have not gone to the prompt. */
export const pendingOf = (questions: Question[]) => questions.filter(question => question.status !== 'sent').length

/**
 * The questions held, with an answer's questions folded in by key. A new key comes in pending.
 * A known one takes the new text and options and keeps its answer while the chosen option
 * still exists by name; otherwise the answer goes and the question is pending again, marked
 * as changed. One already sent and asked again comes back with its answer, ready to resend.
 */
export function merge(held: Question[], parsed: Parsed[]): { questions: Question[]; added: string[] } {
  const questions = [...held]
  const added: string[] = []

  parsed.forEach((question, index) => {
    const number = index + 1
    const at = questions.findIndex(one => one.key === question.key)
    if (at < 0) {
      questions.push({ ...question, number, status: 'pending', isChanged: false, answer: {} })
      added.push(question.key)
      return
    }
    const was = questions[at]!
    const isKept =
      was.answer.option === undefined || question.options.some(option => option.name === was.answer.option)
    const answer = isKept ? was.answer : {}
    let status: Status = was.status
    if (!isKept) status = 'pending'
    else if (was.status === 'sent') status = isAnswered(answer) ? 'answered' : 'pending'
    questions[at] = { ...question, number, status, isChanged: isKept ? was.isChanged : true, answer }
  })
  return { questions, added }
}
