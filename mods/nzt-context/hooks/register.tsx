import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Level, LiveProps, Reading } from '../types'
import { drawBand, drawNoReading, pillOf, still } from './draw'
import { abbreviate, crossingLineOf, isAbove, layoutOf, levelOf, modelLineOf, readingOf } from './gauge'
import { langOf, TEXTS } from './i18n'

const reading = atom({ plugin: 'nzt-context', key: 'reading' } as const, { kind: 'none' } as Reading)

const told = atom({ plugin: 'nzt-context', key: 'told' } as const, null as Level | null)

const liveFailed = atom({ plugin: 'nzt-context', key: 'liveFailed' } as const, false)

const refresh = async ($: EngineInterface): Promise<Reading> => {
  const { context } = await $.session.usage()
  const now = readingOf(context)
  await update($, reading, () => now)
  return now
}

export const register: Register = (on, options) => {
  const t = TEXTS[langOf(options.language)]
  const isAnimated = options.animations !== 'off'

  on('session.start', async ($, e, next) => {
    const started = await next(e)
    await refresh($).catch(() => undefined)
    return started
  })

  // Pushed by the engine after each main-thread turn.
  on('session.measure', async ($, e, next) => {
    await update($, reading, () => readingOf(e.context))
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    const now = await refresh($).catch(() => ({ kind: 'none' }) as Reading)
    if (now.kind === 'ok') await update($, told, () => levelOf(now.percent))
    return next({ ...e, context: [...(e.context ?? []), modelLineOf(now)] })
  })

  // A tool call follows a model response, so this is the fill of a step still inside the turn.
  // A batch can run several units in one turn: a mark crossed there reaches the model with the
  // next tool result, or its end-of-unit report would quote the figure the turn started with.
  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId !== undefined || ran.deny !== undefined) return ran
    const now = await refresh($).catch(() => ({ kind: 'none' }) as Reading)
    if (now.kind !== 'ok') return ran
    const level = levelOf(now.percent)
    if (level === 'low' || !isAbove(level, await read($, told))) return ran
    await update($, told, () => level)
    return { ...ran, context: [...(ran.context ?? []), crossingLineOf(now)] }
  })

  on('session.compact', async ($, e, next) => {
    const compacted = await next(e)
    // The fill drops, so a mark crossed before compacting has to be able to warn again.
    const now = await refresh($).catch(() => ({ kind: 'none' }) as Reading)
    await update($, told, () => (now.kind === 'ok' ? levelOf(now.percent) : null))
    return compacted
  })

  // After a /clear the process goes on with an empty conversation and no session.start.
  on('session.end', async ($, e, next) => {
    if (e.reason === 'clear') {
      await update($, reading, () => ({ kind: 'none' }) as Reading)
      await update($, told, () => null)
    }
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)

    const elements = $.ui.resolve(e)
    const now = await read($, reading)
    const columns = e.props.bodyColumns

    if (now.kind === 'none') {
      const width = Math.max(10, columns - t.label.length - 1 - t.noReading.length - 2)
      return drawNoReading(elements, t.label, t.noReading, width)
    }

    const tokens = `${abbreviate(now.tokens)}/${abbreviate(now.window)}`
    const fit = layoutOf(columns, { label: t.label, percent: pillOf(now.percent), tokens })
    const figure = {
      label: fit.label ? t.label : null,
      percent: now.percent,
      tokens: fit.tokens ? tokens : null,
      width: fit.width,
    }

    if (!isAnimated || (await read($, liveFailed)) || !('Client' in elements)) {
      return drawBand(elements, still(figure))
    }
    const { Client } = elements
    const props: LiveProps = { ...figure, working: e.props.isWorking }
    return <Client key="bar" module="./live.tsx" props={props} />
  })

  on('ui.fault', async ($, e, next) => {
    if (e.module.endsWith('live.tsx')) await update($, liveFailed, () => true)
    return next(e)
  })
}
