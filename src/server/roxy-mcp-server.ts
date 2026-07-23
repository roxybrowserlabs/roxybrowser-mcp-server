import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js'
import { createRoxyClientConfigFromEnv, RoxyOpenAPI, type RoxyOpenAPIOptions } from '../client/index.js'
import { ToolRegistry, type RuntimeContext, type ToolDefinition } from '../runtime/index.js'
import { ROXY_TOOLS_V2 } from '../tools/catalog.js'

export interface RoxyMcpServerOptions {
  roxy?: RoxyOpenAPIOptions
  context?: RuntimeContext
  tools?: ToolDefinition[]
  name?: string
}

export class RoxyMcpServer {
  private readonly server: Server
  private readonly registry: ToolRegistry
  private readonly context: RuntimeContext

  constructor(options: RoxyMcpServerOptions = {}) {
    const envConfig = createRoxyClientConfigFromEnv()
    const client = new RoxyOpenAPI({
      ...envConfig,
      ...options.roxy,
      workspaceId: options.roxy?.workspaceId ?? options.context?.workspaceId,
    })
    this.registry = new ToolRegistry(options.tools ?? ROXY_TOOLS_V2)
    this.context = {
      ...options.context,
      client,
    }
    this.server = new Server(
      {
        name: options.name ?? 'roxybrowser-openapi-mcp',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    )

    this.setupHandlers()
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.registry.listTools(this.context),
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params

      try {
        return await this.registry.callTool(name, args ?? {}, this.context)
      }
      catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: error instanceof Error ? error.message : 'Unknown error',
            },
          ],
        }
      }
    })
  }

  async connect(transport: Transport): Promise<void> {
    await this.server.connect(transport)
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport()
    await this.connect(transport)
  }
}

export function createRoxyMcpServer(options: RoxyMcpServerOptions = {}): RoxyMcpServer {
  return new RoxyMcpServer(options)
}
