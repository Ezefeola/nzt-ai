import { expect, test } from 'claude-code/testing'

import { kindOf } from './kinds'

test('a known extension is named by its kind, whatever its case', async () => {
  expect(kindOf('specs/mods/nzt-changes.MD')).toEqual({ kind: 'named', name: 'Markdown' })
  expect(kindOf('Plan/state.json')).toEqual({ kind: 'named', name: 'JSON' })
})

test('an image says its format', async () => {
  expect(kindOf('presentation/logo.jpeg')).toEqual({ kind: 'image', format: 'JPG' })
})

test('an unknown extension is shown in capitals', async () => {
  expect(kindOf('config/app.toml')).toEqual({ kind: 'named', name: 'TOML' })
})

test('plain text is text', async () => {
  expect(kindOf('notes.txt')).toEqual({ kind: 'text' })
})

test('a file with no extension has no kind, a dotfile included', async () => {
  expect(kindOf('LICENSE')).toBeUndefined()
  expect(kindOf('.gitignore')).toBeUndefined()
})
