import type { RuntimeContext, ToolDefinition } from './types.js'
import { applyContextToArgs, createPublicToolSchema, toPublicToolName, toSafeToolName } from './context.js'

export function defineTool<TArgs extends Record<string, any>>(definition: ToolDefinition<TArgs>): ToolDefinition<TArgs> {
  return definition
}

export class ToolRegistry {
  private readonly tools: Map<string, ToolDefinition>
  private readonly publicNameToToolName: Map<string, string>

  constructor(tools: ToolDefinition[]) {
    this.tools = new Map(tools.map(tool => [tool.name, tool]))
    this.publicNameToToolName = new Map()

    for (const tool of tools) {
      const publicName = toPublicToolName(tool.name)
      const existingName = this.publicNameToToolName.get(publicName)
      if (existingName && existingName !== tool.name)
        throw new Error(`Tool name collision: ${existingName} and ${tool.name} both map to ${publicName}`)

      this.publicNameToToolName.set(publicName, tool.name)
      this.publicNameToToolName.set(toSafeToolName(tool.name), tool.name)
    }
  }

  listTools(context: RuntimeContext = {}) {
    return [...this.tools.values()]
      .filter(tool => tool.isAvailable?.(context) ?? true)
      .map(tool => createPublicToolSchema(tool, context))
  }

  async callTool(name: string, args: Record<string, any> = {}, context: RuntimeContext = {}) {
    const toolName = this.publicNameToToolName.get(name) ?? name
    const tool = this.tools.get(toolName)
    if (!tool || !(tool.isAvailable?.(context) ?? true))
      throw new Error(`Unknown tool: ${name}`)

    const resolvedArgs = applyContextToArgs(tool, args, context)
    return tool.handler(resolvedArgs, context)
  }
}
