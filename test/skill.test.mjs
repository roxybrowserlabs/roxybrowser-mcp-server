import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const skillDir = resolve('skills/roxybrowser-mcp')
const skillPath = resolve(skillDir, 'SKILL.md')

async function readSkill() {
  return readFile(skillPath, 'utf8')
}

describe('roxybrowser-mcp skill', () => {
  test('has valid discovery frontmatter', async () => {
    const text = await readSkill()

    assert.match(text, /^---\nname: roxybrowser-mcp\n/m)
    assert.match(text, /^description: Use when .*RoxyBrowser.*MCP/m)
    assert.match(text, /^---\n\n# RoxyBrowser MCP/m)
  })

  test('references bundled guidance files that exist', async () => {
    const text = await readSkill()
    const refs = [...text.matchAll(/\(references\/([^)]+\.md)\)/g)].map(match => match[1])

    assert.deepEqual(refs.sort(), [
      'browser-guidance.md',
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
    ].join('\n')

    assert.match(allText, /project\.list/)
    assert.match(allText, /workspace\.list/)
    assert.match(allText, /proxy\.detect/)
    assert.match(allText, /historical/i)
    assert.match(allText, /CDP/)
    assert.doesNotMatch(allText, /browser\.random_fingerprint/)
  })
})
