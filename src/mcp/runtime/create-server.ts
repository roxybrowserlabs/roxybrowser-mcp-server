import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js'
import type { CreateMcpServerOptions, McpContext, McpTool } from './types.js'

export class RoxyPresetMcpServer {
  private readonly server: Server
  private readonly tools: Map<string, McpTool>
  private readonly context: McpContext

  constructor(options: CreateMcpServerOptions, context: McpContext) {
    this.context = context
    this.tools = new Map(options.tools.map(tool => [tool.name, tool]))
    this.server = new Server(
      {
        name: options.name,
        version: options.version ?? '3.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    )
    this.setupHandlers()
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [...this.tools.values()].map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const tool = this.tools.get(request.params.name)
      if (!tool) {
        return textResult(`Unknown tool: ${request.params.name}`)
      }

      try {
        const text = await tool.handler(request.params.arguments ?? {}, this.context)
        return textResult(text)
      }
      catch (error) {
        return textResult(error instanceof Error ? error.message : 'Unknown error')
      }
    })
  }

  connect(transport: Transport): Promise<void> {
    return this.server.connect(transport)
  }

  run(): Promise<void> {
    return this.connect(new StdioServerTransport())
  }
}

function textResult(text: string) {
  return {
    content: [
      {
        type: 'text',
        text,
      },
    ],
  }
}
