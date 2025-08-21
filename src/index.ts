#!/usr/bin/env node

/**
 * RoxyBrowser MCP Server
 * 
 * Model Context Protocol server for RoxyBrowser automation
 * Provides tools to manage browser instances and get CDP endpoints
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { RoxyClient } from './roxy-client.js';
import {
  RoxyClientConfig,
  WorkspaceListToolResponse,
  BrowserListToolParams,
  BrowserListToolResponse,
  BrowserOpenToolParams,
  BrowserOpenToolResponse,
  BrowserCloseToolParams,
  BrowserCloseToolResponse,
  ConfigError,
} from './types.js';

// ========== Configuration ==========

function getConfig(): RoxyClientConfig {
  const apiHost = process.env.ROXY_API_HOST || 'http://127.0.0.1:50000';
  const apiKey = process.env.ROXY_API_KEY || '';
  const timeout = process.env.ROXY_TIMEOUT ? parseInt(process.env.ROXY_TIMEOUT) : 30000;

  if (!apiKey) {
    throw new ConfigError(
      'ROXY_API_KEY environment variable is required. ' +
      'Get your API key from RoxyBrowser: API -> API配置 -> API Key'
    );
  }

  return { apiHost, apiKey, timeout };
}

// ========== Tool Definitions ==========

const TOOLS = [
  {
    name: 'roxy_list_workspaces',
    description: 'Get list of all workspaces and their projects from RoxyBrowser',
    inputSchema: {
      type: 'object',
      properties: {
        pageIndex: {
          type: 'number',
          description: 'Page index for pagination (default: 1)',
          default: 1,
        },
        pageSize: {
          type: 'number',
          description: 'Number of items per page (default: 15)',
          default: 15,
        },
      },
    },
  },
  {
    name: 'roxy_list_browsers',
    description: 'Get list of browsers in specified workspace/project',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: {
          type: 'number',
          description: 'Workspace ID (required)',
        },
        projectIds: {
          type: 'string',
          description: 'Comma-separated project IDs (optional)',
        },
        windowName: {
          type: 'string',
          description: 'Filter by browser window name (optional)',
        },
        pageIndex: {
          type: 'number',
          description: 'Page index for pagination (default: 1)',
          default: 1,
        },
        pageSize: {
          type: 'number',
          description: 'Number of items per page (default: 15)',
          default: 15,
        },
      },
      required: ['workspaceId'],
    },
  },
  {
    name: 'roxy_open_browsers',
    description: 'Open multiple browsers and return their CDP WebSocket endpoints for automation',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: {
          type: 'number',
          description: 'Workspace ID (required)',
        },
        dirIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of browser directory IDs to open (required)',
        },
        args: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional browser startup arguments',
        },
      },
      required: ['workspaceId', 'dirIds'],
    },
  },
  {
    name: 'roxy_close_browsers',
    description: 'Close multiple browsers by their directory IDs',
    inputSchema: {
      type: 'object',
      properties: {
        dirIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of browser directory IDs to close (required)',
        },
      },
      required: ['dirIds'],
    },
  },
];

// ========== MCP Server ==========

class RoxyBrowserMCPServer {
  private server: Server;
  private roxyClient: RoxyClient;

  constructor() {
    this.server = new Server(
      {
        name: 'roxy-browser-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize RoxyBrowser client
    const config = getConfig();
    this.roxyClient = new RoxyClient(config);

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS,
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'roxy_list_workspaces':
            return await this.handleListWorkspaces(args);

          case 'roxy_list_browsers':
            return await this.handleListBrowsers(args);

          case 'roxy_open_browsers':
            return await this.handleOpenBrowsers(args);

          case 'roxy_close_browsers':
            return await this.handleCloseBrowsers(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
        };
      }
    });
  }

  private async handleListWorkspaces(args: any) {
    const { pageIndex = 1, pageSize = 15 } = args || {};
    
    const data = await this.roxyClient.getWorkspaces(pageIndex, pageSize);

    return {
      content: [
        {
          type: 'text',
          text: `Found ${data.total} workspaces:\n\n` +
                data.rows.map(ws => 
                  `**${ws.workspaceName}** (ID: ${ws.id})\n` +
                  ws.project_details.map(proj => 
                    `  - ${proj.projectName} (ID: ${proj.projectId})`
                  ).join('\n')
                ).join('\n\n'),
        },
      ],
    };
  }

  private async handleListBrowsers(args: any) {
    const params: BrowserListToolParams = args;
    
    if (!params.workspaceId) {
      throw new Error('workspaceId is required');
    }

    const data = await this.roxyClient.getBrowsers({
      workspaceId: params.workspaceId,
      projectIds: params.projectIds,
      windowName: params.windowName,
      page_index: params.pageIndex || 1,
      page_size: params.pageSize || 15,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Found ${data.total} browsers in workspace ${params.workspaceId}:\n\n` +
                data.rows.map(browser => 
                  `**${browser.windowName || 'Unnamed'}** (ID: ${browser.dirId})\n` +
                  `  - Project: ${browser.projectId}\n` +
                  `  - Sort: ${browser.sortNum}\n` +
                  `  - OS: ${browser.os}\n` +
                  `  - Status: ${browser.status}`
                ).join('\n\n'),
        },
      ],
    };
  }

  private async handleOpenBrowsers(args: any) {
    const params: BrowserOpenToolParams = args;
    
    if (!params.workspaceId || !params.dirIds || params.dirIds.length === 0) {
      throw new Error('workspaceId and dirIds are required');
    }

    const results = await this.roxyClient.openBrowsers(
      params.workspaceId,
      params.dirIds,
      params.args
    );

    return {
      content: [
        {
          type: 'text',
          text: `Successfully opened ${results.length} browsers:\n\n` +
                results.map(result => 
                  `**Browser ${result.dirId || 'Unknown'}** (PID: ${result.pid})\n` +
                  `  - CDP WebSocket: \`${result.ws}\`\n` +
                  `  - HTTP Endpoint: \`${result.http}\`\n` +
                  `  - Core Version: ${result.coreVersion}`
                ).join('\n\n') +
                '\n\n**Use these WebSocket URLs with playwright-mcp:**\n' +
                '```bash\n' +
                results.map(result => 
                  `npx @playwright/mcp@latest --cdp-endpoint "${result.ws}"`
                ).join('\n') +
                '\n```',
        },
      ],
    };
  }

  private async handleCloseBrowsers(args: any) {
    const params: BrowserCloseToolParams = args;
    
    if (!params.dirIds || params.dirIds.length === 0) {
      throw new Error('dirIds are required');
    }

    const results = await this.roxyClient.closeBrowsers(params.dirIds);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    const successText = successCount > 0 
      ? `✅ Successfully closed ${successCount} browsers`
      : '';
    
    const failureText = failureCount > 0
      ? `❌ Failed to close ${failureCount} browsers:\n` +
        results.filter(r => !r.success).map(r => 
          `  - ${r.dirId}: ${r.error}`
        ).join('\n')
      : '';

    return {
      content: [
        {
          type: 'text',
          text: [successText, failureText].filter(Boolean).join('\n\n'),
        },
      ],
    };
  }

  async run() {
    // Test connection before starting
    console.error('🔗 Testing RoxyBrowser API connection...');
    const isConnected = await this.roxyClient.testConnection();
    
    if (!isConnected) {
      console.error('❌ Failed to connect to RoxyBrowser API');
      console.error('   Please check:');
      console.error('   1. RoxyBrowser is running');
      console.error('   2. API is enabled in RoxyBrowser settings');
      console.error('   3. ROXY_API_KEY environment variable is set');
      console.error('   4. API host is correct (default: http://127.0.0.1:50000)');
      process.exit(1);
    }

    console.error('✅ Connected to RoxyBrowser API');
    console.error('🚀 Starting RoxyBrowser MCP Server...');

    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.error('✅ RoxyBrowser MCP Server is running');
  }
}

// ========== Main ==========

async function main() {
  try {
    const server = new RoxyBrowserMCPServer();
    await server.run();
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error(`❌ Configuration Error: ${error.message}`);
      process.exit(1);
    }

    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('\n👋 Shutting down RoxyBrowser MCP Server...');
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}