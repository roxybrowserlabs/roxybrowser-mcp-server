import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js'

export type ToolScope = 'global' | 'workspace' | 'project'

export interface RuntimeContext {
  workspaceId?: number
  projectId?: number
  [key: string]: unknown
}

export interface ContextBinding {
  name: 'workspaceId' | 'projectId'
  location?: 'root' | 'arrayItems'
  arrayProperty?: string
}

export interface ToolDefinition<TArgs extends Record<string, any> = Record<string, any>> {
  name: string
  description: string
  scope: ToolScope
  inputSchema: Record<string, any>
  annotations?: ToolAnnotations
  contextBindings?: ContextBinding[]
  isAvailable?: (context: RuntimeContext) => boolean
  handler: (args: TArgs, context: RuntimeContext) => Promise<any>
}

export interface PublicToolSchema {
  name: string
  description: string
  inputSchema: Record<string, any>
  annotations?: ToolAnnotations
}
