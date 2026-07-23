import { RoxyOpenAPI } from '../client/index.js'
import { defineTool, type ContextBinding, type ToolDefinition, type ToolScope } from '../runtime/index.js'
import { runWithRoxyOpenAPI } from '../utils/index.js'

interface LegacyTool {
  description: string
  schema: {
    inputSchema: Record<string, any>
  }
  handle: (args: any) => Promise<any>
}

export interface LegacyToolAdapterOptions {
  name: string
  scope: ToolScope
  legacyTool: LegacyTool
  description?: string
  inputSchema?: Record<string, any>
  annotations?: ToolDefinition['annotations']
  contextBindings?: ContextBinding[]
  isAvailable?: ToolDefinition['isAvailable']
}

export function adaptLegacyTool(options: LegacyToolAdapterOptions): ToolDefinition {
  return defineTool({
    name: options.name,
    description: options.description ?? options.legacyTool.description,
    scope: options.scope,
    inputSchema: options.inputSchema ?? options.legacyTool.schema.inputSchema,
    annotations: options.annotations,
    contextBindings: options.contextBindings,
    isAvailable: options.isAvailable,
    handler: async (args, context) => {
      const client = context.client
      if (client instanceof RoxyOpenAPI)
        return runWithRoxyOpenAPI(client, () => options.legacyTool.handle(args))

      return options.legacyTool.handle(args)
    },
  })
}
