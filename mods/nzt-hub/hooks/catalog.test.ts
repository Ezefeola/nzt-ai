import { expect, test } from 'claude-code/testing'

import { CATALOG, groupsOf, installCommand, installedFileOf, isInstalled, versionsOf } from './catalog'

test('the catalog lists the five NZT mods in order, and not the hub', async () => {
  expect(CATALOG.map(mod => mod.id)).toEqual(['nzt-state', 'nzt-context', 'nzt-changes', 'nzt-files', 'nzt-questions'])
})

test('the mods of the method come first, then the generic ones, each group in the catalog order', async () => {
  const groups = groupsOf(CATALOG.map(mod => ({ id: mod.id })))
  expect(groups.map(group => [group.kind, group.mods.map(mod => mod.id)])).toEqual([
    ['nzt', ['nzt-state']],
    ['generic', ['nzt-context', 'nzt-changes', 'nzt-files', 'nzt-questions']],
  ])
})

test('a group with no mods is left out', async () => {
  expect(groupsOf([{ id: 'nzt-files' }]).map(group => group.kind)).toEqual(['generic'])
})

test('the install command names the mod and this repository as its marketplace', async () => {
  expect(installCommand('nzt-files')).toBe('/plugin install nzt-files --marketplace Ezefeola/nzt-ai')
})

test('a mod is installed when its command is there, or its options are, for a mod with no command', async () => {
  expect(isInstalled('nzt-files', [{ name: 'nzt-files', plugin: 'nzt-files' }], [])).toBe(true)
  expect(isInstalled('nzt-context', [{ name: 'compact' }], ['theme', 'nzt-context.language'])).toBe(true)
  expect(isInstalled('nzt-changes', [{ name: 'nzt-files' }], ['nzt-files.language'])).toBe(false)
})

test('the installed list is looked for in the .claude folder the plugin lives under', async () => {
  expect(installedFileOf('C:\\Users\\me\\.claude\\plugins\\cache\\nzt\\nzt-hub\\0.1.0')).toBe(
    'C:/Users/me/.claude/plugins/installed_plugins.json',
  )
  expect(installedFileOf('/home/me/.claude/dev-mods/abc/nzt-hub')).toBe('/home/me/.claude/plugins/installed_plugins.json')
  expect(installedFileOf('/opt/mods/nzt-hub')).toBeUndefined()
})

test('versions come from the installed list by plugin name, and a list it cannot read gives none', async () => {
  const text = JSON.stringify({
    version: 2,
    plugins: {
      'nzt-state@nzt': [{ scope: 'user', version: '0.3.0' }],
      'nzt-context@nzt': [{ scope: 'project' }, { scope: 'user', version: '0.2.0' }],
      'other@x': 'not a list',
    },
  })
  expect(versionsOf(text)).toEqual({ 'nzt-state': '0.3.0', 'nzt-context': '0.2.0' })
  expect(versionsOf('{ broken')).toEqual({})
  expect(versionsOf('{"plugins": null}')).toEqual({})
})
