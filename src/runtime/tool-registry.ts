import type { RuntimeContext, ToolDefinition } from './types.js'
import { applyContextToArgs, createPublicToolSchema } from './context.js'

export function defineTool<TArgs extends Record<string, any>>(definition: ToolDefinition<TArgs>): ToolDefinition<TArgs> {
  return definition
}

export class ToolRegistry {
  private readonly tools: Map<string, ToolDefinition>

  constructor(tools: ToolDefinition[]) {
    this.tools = new Map(tools.map(tool => [tool.name, tool]))
  }

  listTools(context: RuntimeContext = {}) {
    return [...this.tools.values()]
      .filter(tool => tool.isAvailable?.(context) ?? true)
      .map(tool => createPublicToolSchema(tool, context))
  }

  async callTool(name: string, args: Record<string, any> = {}, context: RuntimeContext = {}) {
    const tool = this.tools.get(name)
    if (!tool || !(tool.isAvailable?.(context) ?? true))
      throw new Error(`Unknown tool: ${name}`)

    const resolvedArgs = applyContextToArgs(tool, args, context)
    return tool.handler(resolvedArgs, context)
  }
}
