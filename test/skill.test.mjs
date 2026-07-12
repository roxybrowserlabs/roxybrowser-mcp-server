import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const skillDir = resolve('skills/roxybrowser-control')
const skillPath = resolve(skillDir, 'SKILL.md')
const typesPath = resolve('src/types.ts')
const fingerInfoAttachmentPath = resolve('/Users/macos/.codex/attachments/276df028-1127-4d30-aea1-f04a7ea88e46/pasted-text.txt')
const fingerprintAppendixAttachmentPath = resolve('/Users/macos/.codex/attachments/7b7e6bf3-058c-401b-9315-ffbf7746a182/pasted-text.txt')

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
      'fingerprint-interface-languages.md',
      'fingerprint-languages.md',
      'fingerprint-resolutions.md',
      'fingerprint-timezones.md',
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
      await readFile(resolve(skillDir, 'references/fingerprint-languages.md'), 'utf8'),
      await readFile(resolve(skillDir, 'references/fingerprint-interface-languages.md'), 'utf8'),
      await readFile(resolve(skillDir, 'references/fingerprint-resolutions.md'), 'utf8'),
      await readFile(resolve(skillDir, 'references/fingerprint-timezones.md'), 'utf8'),
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
    assert.match(allText, /GMT\+08:00 Asia\/Shanghai/)
    assert.match(allText, /isTimeZone.*false.*Custom/i)
    assert.doesNotMatch(allText, /roxy_browser_random_fingerprint/)
  })

  test('documents every attached fingerInfo field', async () => {
    const attachment = await readFile(fingerInfoAttachmentPath, 'utf8')
    const fingerprintReference = await readFile(resolve(skillDir, 'references/fingerprint-fields.md'), 'utf8')
    const attachedFields = [...attachment.matchAll(/"([A-Za-z][A-Za-z0-9]*)"\s*:/g)]
      .map(match => match[1])
      .filter(name => name !== 'fingerInfo')

    assert.equal(attachedFields.length, 81)

    for (const field of attachedFields)
      assert.match(fingerprintReference, new RegExp(`\\| \`${field}\` \\|`), `${field} should be documented`)
  })

  test('documents every attached fingerprint appendix value', async () => {
    const attachment = await readFile(fingerprintAppendixAttachmentPath, 'utf8')
    const resolutionReference = await readFile(resolve(skillDir, 'references/fingerprint-resolutions.md'), 'utf8')
    const languageReference = await readFile(resolve(skillDir, 'references/fingerprint-languages.md'), 'utf8')
    const interfaceLanguageReference = await readFile(resolve(skillDir, 'references/fingerprint-interface-languages.md'), 'utf8')
    const timezoneReference = await readFile(resolve(skillDir, 'references/fingerprint-timezones.md'), 'utf8')
    const lines = attachment.split(/\r?\n/).map(line => line.trim())
    const markerIndex = name => lines.findIndex(line => line === name)
    const section = (startName, endName) => {
      const start = markerIndex(startName)
      const end = endName ? markerIndex(endName) : lines.length
      return lines.slice(start + 1, end).filter(Boolean)
    }

    const resolutionValues = section('Appendix-Resolution List', 'Appendix-Language List')
      .filter(line => /^\d+x\d+$/.test(line))
    const languageValues = section('Appendix-Language List', 'Appendix-Interface Language List')
      .filter(line => !line.startsWith('Appendix'))
    const interfaceLanguageValues = section('Appendix-Interface Language List', 'Appendix-Timezone List')
      .filter(line => !line.startsWith('Appendix'))
    const timezoneValues = section('Appendix-Timezone List')
      .filter(line => /^GMT[+-]\d\d:\d\d\s+/.test(line))

    assert.equal(resolutionValues.length, 30)
    assert.equal(languageValues.length, 183)
    assert.equal(interfaceLanguageValues.length, 183)
    assert.equal(timezoneValues.length, 478)

    for (const value of resolutionValues)
      assert.match(resolutionReference, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${value} should be documented`)

    for (const value of languageValues) {
      assert.match(languageReference, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${value} should be documented`)
      assert.doesNotMatch(resolutionReference, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${value} should live in fingerprint-languages.md`)
    }

    for (const value of interfaceLanguageValues) {
      assert.match(interfaceLanguageReference, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${value} should be documented`)
      assert.doesNotMatch(resolutionReference, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${value} should live in fingerprint-interface-languages.md`)
    }

    for (const value of timezoneValues) {
      assert.match(timezoneReference, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${value} should be documented`)
      assert.doesNotMatch(resolutionReference, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${value} should live in fingerprint-timezones.md`)
    }
  })

  test('keeps FingerInfo type aligned with documented appendix fields', async () => {
    const text = await readFile(typesPath, 'utf8')

    assert.match(text, /interface FingerInfo/)
    assert.match(text, /forbiddenPictureSize\?: number/)
    assert.match(text, /openBattery\?: boolean/)
    assert.match(text, /networkType\?: .*wifi.*cellular.*ethernet/)
    assert.match(text, /blockDomainList\?: string/)
    assert.match(text, /allowDomainList\?: string/)
  })
})
