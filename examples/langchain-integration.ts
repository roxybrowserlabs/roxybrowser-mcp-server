/**
 * LangChain Integration Example
 *
 * Demonstrates how to use RoxyBrowser MCP tools directly inside a LangChain agent
 * **without spawning a subprocess** — the MCP server runs in the same process via
 * an in-memory transport channel.
 *
 * Dependencies (install in your own project):
 *   npm install @langchain/mcp-adapters @langchain/core @langchain/langgraph @langchain/anthropic @modelcontextprotocol/sdk
 *
 * Environment variables:
 *   ROXY_API_KEY     - Required. Your RoxyBrowser API key.
 *   ROXY_API_HOST    - Optional. Default: http://127.0.0.1:50000
 *   ANTHROPIC_API_KEY - Required for the example agent below.
 */

import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { loadMcpTools } from '@langchain/mcp-adapters'
import type { StructuredToolInterface } from '@langchain/core/tools'
import { RoxyBrowserMCPServer } from '../src/index.js'

// ─────────────────────────────────────────────────────────────────────────────
// Core helper: returns all Roxy tools as LangChain StructuredTool instances.
// Call once and reuse the returned array across agents / chains.
// ─────────────────────────────────────────────────────────────────────────────
export async function getRoxyLangChainTools(): Promise<StructuredToolInterface[]> {
  // Both ends of the in-memory channel — no sockets, no child process.
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()

  // Start the Roxy MCP server attached to the server-side transport.
  const roxyServer = new RoxyBrowserMCPServer()
  await roxyServer.connect(serverTransport)

  // Connect the MCP client to the other end.
  const mcpClient = new Client(
    { name: 'roxy-langchain-client', version: '1.0.0' },
    { capabilities: { tools: {} } },
  )
  await mcpClient.connect(clientTransport)

  // Convert all MCP tool definitions → LangChain StructuredTool[].
  // loadMcpTools handles JSON-Schema → Zod conversion automatically.
  const tools = await loadMcpTools('roxybrowser', mcpClient)
  return tools
}

// ─────────────────────────────────────────────────────────────────────────────
// Example agent (requires @langchain/langgraph and @langchain/anthropic).
// Run:  npx tsx examples/langchain-integration.ts
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const { ChatAnthropic } = await import('@langchain/anthropic')
  const { createReactAgent } = await import('@langchain/langgraph/prebuilt')
  const { HumanMessage } = await import('@langchain/core/messages')

  const tools = await getRoxyLangChainTools()
  console.log(`Loaded ${tools.length} Roxy tools:`, tools.map(t => t.name).join(', '))

  const agent = createReactAgent({
    llm: new ChatAnthropic({ model: 'claude-opus-4-6' }),
    tools,
  })

  const result = await agent.invoke({
    messages: [new HumanMessage('帮我列出当前所有浏览器，每个显示名称和状态')],
  })

  const last = result.messages.at(-1)
  console.log('\nAgent reply:\n', last?.content)
}

// Only run when executed directly (not when imported as a module).
const isMain = process.argv[1]?.endsWith('langchain-integration.ts')
  || process.argv[1]?.endsWith('langchain-integration.js')
if (isMain) {
  main().catch(console.error)
}
