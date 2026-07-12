import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  ToolRegistry,
  applyContextToArgs,
  createPublicToolSchema,
  defineTool,
} from '../lib/index.js'

describe('runtime context handling', () => {
  const workspaceTool = defineTool({
    name: 'browser.list',
    description: 'List browsers',
    scope: 'workspace',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: { type: 'number', description: 'Workspace ID' },
        pageIndex: { type: 'number', default: 1 },
      },
      required: ['workspaceId'],
    },
    handler: async args => ({
      content: [{ type: 'text', text: JSON.stringify(args) }],
    }),
  })

  test('hides bound workspaceId from public schema', () => {
    const schema = createPublicToolSchema(workspaceTool, { workspaceId: 7 })

    assert.equal(schema.name, 'browser.list')
    assert.deepEqual(Object.keys(schema.inputSchema.properties), ['pageIndex'])
    assert.deepEqual(schema.inputSchema.required, undefined)
  })

  test('injects bound workspaceId into tool arguments', () => {
    const args = applyContextToArgs(workspaceTool, { pageIndex: 2 }, { workspaceId: 7 })

    assert.deepEqual(args, { pageIndex: 2, workspaceId: 7 })
  })

  test('rejects conflicting bound workspaceId', () => {
    assert.throws(
      () => applyContextToArgs(workspaceTool, { workspaceId: 9 }, { workspaceId: 7 }),
      /workspaceId is bound to 7/,
    )
  })
})

describe('ToolRegistry', () => {
  test('lists public schemas and dispatches with context', async () => {
    const registry = new ToolRegistry([
      defineTool({
        name: 'proxy.list',
        description: 'List proxies',
        scope: 'workspace',
        inputSchema: {
          type: 'object',
          properties: {
            workspaceId: { type: 'number' },
          },
          required: ['workspaceId'],
        },
        handler: async args => ({
          content: [{ type: 'text', text: `workspace=${args.workspaceId}` }],
        }),
      }),
    ])

    const tools = registry.listTools({ workspaceId: 42 })
    assert.equal(tools.length, 1)
    assert.equal(tools[0].name, 'proxy.list')
    assert.equal(tools[0].inputSchema.properties.workspaceId, undefined)

    const result = await registry.callTool('proxy.list', {}, { workspaceId: 42 })
    assert.equal(result.content[0].text, 'workspace=42')
  })

  test('throws a readable error for unknown tools', async () => {
    const registry = new ToolRegistry([])

    await assert.rejects(
      registry.callTool('missing.tool', {}, {}),
      /Unknown tool: missing.tool/,
    )
  })
})
