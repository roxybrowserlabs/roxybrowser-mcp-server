import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const skillDir = resolve('skills/roxybrowser-control')
const skillPath = resolve(skillDir, 'SKILL.md')

async function readSkill() {
  return readFile(skillPath, 'utf8')
}

describe('roxybrowser-control skill', () => {
  test('has valid discovery frontmatter', async () => {
    const text = await readSkill()

    assert.match(text, /^---\nname: roxybrowser-control\n/m)
    assert.match(text, /^description: Use when .*RoxyBrowser.*MCP/m)
    assert.match(text, /^---\n\n# RoxyBrowser Control/m)
  })

  test('references bundled guidance files that exist', async () => {
    const text = await readSkill()
    const refs = [...text.matchAll(/\(references\/([^)]+\.md)\)/g)].map(match => match[1])

    assert.deepEqual(refs.sort(), [
      'browser-advanced-fields.md',
      'browser-guidance.md',
      'fingerprint-fields.md',
      'proxy-guidance.md',
      'tool-reference.md',
      'workflows.md',
    ].sort())

    for (const ref of refs)
      assert.equal(existsSync(resolve(skillDir, 'references', ref)), true, `${ref} should exist`)
  })

  test('captures critical 2.0 operating rules', async () => {
    const allText = [
      await readSkill(),
      await readFile(resolve(skillDir, 'references/proxy-guidance.md'), 'utf8'),
      await readFile(resolve(skillDir, 'references/workflows.md'), 'utf8'),
      await readFile(resolve(skillDir, 'references/tool-reference.md'), 'utf8'),
      await readFile(resolve(skillDir, 'references/fingerprint-fields.md'), 'utf8'),
      await readFile(resolve(skillDir, 'references/browser-advanced-fields.md'), 'utf8'),
    ].join('\n')

    assert.match(allText, /roxy_project_list/)
    assert.match(allText, /roxy_workspace_list/)
    assert.match(allText, /roxy_proxy_detect/)
    assert.match(allText, /historical/i)
    assert.match(allText, /CDP/)
    assert.match(allText, /omit `fingerInfo`/)
    assert.match(allText, /omit `windowPlatformList`/)
    assert.match(allText, /proxyInfo/)
    assert.match(allText, /webRTC/)
    assert.doesNotMatch(allText, /roxy_browser_random_fingerprint/)
  })
})
