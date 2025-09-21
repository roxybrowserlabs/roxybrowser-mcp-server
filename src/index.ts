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
import { BrowserCreator } from './browser/browser-creator.js';
import { TemplateManager } from './browser/template-manager.js';
import { ProxyManager } from './proxy/proxy-manager.js';
import { ErrorAnalyzer } from './utils/error-analyzer.js';
import {
  RoxyClientConfig,
  WorkspaceListToolResponse,
  BrowserListToolParams,
  BrowserListToolResponse,
  BrowserOpenToolParams,
  BrowserOpenToolResponse,
  BrowserCloseToolParams,
  BrowserCloseToolResponse,
  BrowserDeleteToolParams,
  BrowserDeleteToolResponse,
  BrowserCreateSimpleParams,
  BrowserCreateStandardParams,
  BrowserCreateAdvancedParams,
  BrowserCreateTemplateParams,
  BrowserCreateSimpleResponse,
  BrowserCreateStandardResponse,
  BrowserCreateAdvancedResponse,
  BrowserCreateTemplateResponse,
  ConfigError,
  BrowserCreationError,
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
  {
    name: 'roxy_delete_browsers',
    description: 'Delete multiple browsers permanently by their directory IDs',
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
          description: 'Array of browser directory IDs to delete (required)',
        },
      },
      required: ['workspaceId', 'dirIds'],
    },
  },
  {
    name: 'roxy_create_browser_simple',
    description: 'Create a browser with simple configuration - ideal for quick setup with basic proxy',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: {
          type: 'number',
          description: 'Workspace ID (required)',
        },
        windowName: {
          type: 'string',
          description: 'Browser window name (optional)',
        },
        projectId: {
          type: 'number',
          description: 'Project ID (optional)',
        },
        windowRemark: {
          type: 'string',
          description: 'Window remarks/notes (optional)',
        },
        proxyHost: {
          type: 'string',
          description: 'Proxy server host/IP address (optional)',
        },
        proxyPort: {
          type: 'string',
          description: 'Proxy server port (optional)',
        },
        proxyUserName: {
          type: 'string',
          description: 'Proxy username (optional)',
        },
        proxyPassword: {
          type: 'string',
          description: 'Proxy password (optional)',
        },
        proxyType: {
          type: 'string',
          enum: ['HTTP', 'HTTPS', 'SOCKS5'],
          description: 'Proxy type (optional, default: HTTP)',
        },
      },
      required: ['workspaceId'],
    },
  },
  {
    name: 'roxy_create_browser_standard',
    description: 'Create a browser with standard configuration - covers most common use cases',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: {
          type: 'number',
          description: 'Workspace ID (required)',
        },
        windowName: {
          type: 'string',
          description: 'Browser window name (optional)',
        },
        projectId: {
          type: 'number',
          description: 'Project ID (optional)',
        },
        windowRemark: {
          type: 'string',
          description: 'Window remarks/notes (optional)',
        },
        os: {
          type: 'string',
          enum: ['Windows', 'macOS', 'Linux', 'IOS', 'Android'],
          description: 'Operating system (optional, default: Windows)',
        },
        osVersion: {
          type: 'string',
          description: 'OS version (optional, auto-selected based on OS)',
        },
        coreVersion: {
          type: 'string',
          enum: ['138', '137', '136', '135', '133', '130', '125', '117', '109'],
          description: 'Browser core version (optional, default: 125)',
        },
        proxyInfo: {
          type: 'object',
          description: 'Complete proxy configuration object (optional)',
          properties: {
            proxyMethod: { type: 'string', enum: ['custom', 'choose', 'api'] },
            proxyCategory: { type: 'string', enum: ['noproxy', 'HTTP', 'HTTPS', 'SOCKS5', 'SSH'] },
            ipType: { type: 'string', enum: ['IPV4', 'IPV6'] },
            protocol: { type: 'string', enum: ['HTTP', 'HTTPS', 'SOCKS5'] },
            host: { type: 'string' },
            port: { type: 'string' },
            proxyUserName: { type: 'string' },
            proxyPassword: { type: 'string' },
            refreshUrl: { type: 'string' },
            checkChannel: { type: 'string', enum: ['IPRust.io', 'IP-API', 'IP123.in'] },
          },
        },
        openWidth: {
          type: 'string',
          description: 'Browser window width (optional, default: 1000)',
        },
        openHeight: {
          type: 'string',
          description: 'Browser window height (optional, default: 1000)',
        },
        language: {
          type: 'string',
          description: 'Browser language (optional, e.g., en-US)',
        },
        timeZone: {
          type: 'string',
          description: 'Browser timezone (optional, e.g., GMT-5:00 America/New_York)',
        },
        defaultOpenUrl: {
          type: 'array',
          items: { type: 'string' },
          description: 'URLs to open by default (optional)',
        },
      },
      required: ['workspaceId'],
    },
  },
  {
    name: 'roxy_create_browser_advanced',
    description: 'Create a browser with complete configuration control - for expert users',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: {
          type: 'number',
          description: 'Workspace ID (required)',
        },
        windowName: {
          type: 'string',
          description: 'Browser window name (optional)',
        },
        projectId: {
          type: 'number',
          description: 'Project ID (optional)',
        },
        windowRemark: {
          type: 'string',
          description: 'Window remarks (optional)',
        },
        os: {
          type: 'string',
          enum: ['Windows', 'macOS', 'Linux', 'IOS', 'Android'],
          description: 'Operating system (optional)',
        },
        osVersion: {
          type: 'string',
          description: 'OS version (optional)',
        },
        coreVersion: {
          type: 'string',
          enum: ['138', '137', '136', '135', '133', '130', '125', '117', '109'],
          description: 'Browser core version (optional)',
        },
        userAgent: {
          type: 'string',
          description: 'Custom user agent (optional)',
        },
        searchEngine: {
          type: 'string',
          enum: ['Google', 'Microsoft Bing', 'Yahoo', 'Yandex', 'DuckDuckGo'],
          description: 'Default search engine (optional)',
        },
        labelIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'Label IDs to assign (optional)',
        },
        defaultOpenUrl: {
          type: 'array',
          items: { type: 'string' },
          description: 'Default URLs to open (optional)',
        },
        proxyInfo: {
          type: 'object',
          description: 'Proxy configuration (optional)',
        },
        fingerInfo: {
          type: 'object',
          description: 'Complete fingerprint configuration (optional)',
        },
        windowPlatformList: {
          type: 'array',
          items: { type: 'object' },
          description: 'Platform account information (optional)',
        },
      },
      required: ['workspaceId'],
    },
  },
  {
    name: 'roxy_create_browser_from_template',
    description: 'Create browsers using predefined templates - perfect for batch creation and common scenarios',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: {
          type: 'number',
          description: 'Workspace ID (required)',
        },
        templateName: {
          type: 'string',
          enum: ['gmail', 'facebook', 'ecommerce', 'social_media', 'general', 'custom'],
          description: 'Template to use (required)',
        },
        count: {
          type: 'number',
          description: 'Number of browsers to create (optional, default: 1)',
          minimum: 1,
          maximum: 50,
        },
        namePrefix: {
          type: 'string',
          description: 'Prefix for browser names (optional)',
        },
        projectId: {
          type: 'number',
          description: 'Project ID (optional)',
        },
        proxyList: {
          type: 'array',
          items: { type: 'object' },
          description: 'List of proxy configurations to distribute across browsers (optional)',
        },
        customConfig: {
          type: 'object',
          description: 'Custom configuration to override template defaults (optional)',
        },
      },
      required: ['workspaceId', 'templateName'],
    },
  },
  {
    name: 'roxy_list_browser_templates',
    description: 'List available browser templates with descriptions',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'roxy_validate_proxy_config',
    description: 'Validate proxy configuration before using it',
    inputSchema: {
      type: 'object',
      properties: {
        proxyInfo: {
          type: 'object',
          description: 'Proxy configuration to validate (required)',
          properties: {
            proxyMethod: { type: 'string', enum: ['custom', 'choose', 'api'] },
            proxyCategory: { type: 'string', enum: ['noproxy', 'HTTP', 'HTTPS', 'SOCKS5', 'SSH'] },
            ipType: { type: 'string', enum: ['IPV4', 'IPV6'] },
            protocol: { type: 'string', enum: ['HTTP', 'HTTPS', 'SOCKS5'] },
            host: { type: 'string' },
            port: { type: 'string' },
            proxyUserName: { type: 'string' },
            proxyPassword: { type: 'string' },
            refreshUrl: { type: 'string' },
            checkChannel: { type: 'string', enum: ['IPRust.io', 'IP-API', 'IP123.in'] },
          },
        },
      },
      required: ['proxyInfo'],
    },
  },
  {
    name: 'roxy_system_diagnostics',
    description: 'Perform comprehensive system diagnostics and health checks',
    inputSchema: {
      type: 'object',
      properties: {
        includeWorkspaceCheck: {
          type: 'boolean',
          description: 'Include workspace connectivity tests (optional, default: true)',
          default: true,
        },
        includeBrowserCheck: {
          type: 'boolean',
          description: 'Include browser availability checks (optional, default: true)',
          default: true,
        },
        verbose: {
          type: 'boolean',
          description: 'Include detailed diagnostic information (optional, default: false)',
          default: false,
        },
      },
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

          case 'roxy_delete_browsers':
            return await this.handleDeleteBrowsers(args);

          case 'roxy_create_browser_simple':
            return await this.handleCreateBrowserSimple(args);

          case 'roxy_create_browser_standard':
            return await this.handleCreateBrowserStandard(args);

          case 'roxy_create_browser_advanced':
            return await this.handleCreateBrowserAdvanced(args);

          case 'roxy_create_browser_from_template':
            return await this.handleCreateBrowserFromTemplate(args);

          case 'roxy_list_browser_templates':
            return await this.handleListBrowserTemplates();

          case 'roxy_validate_proxy_config':
            return await this.handleValidateProxyConfig(args);

          case 'roxy_system_diagnostics':
            return await this.handleSystemDiagnostics(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        // Use enhanced error analysis
        const formattedError = ErrorAnalyzer.formatErrorForDisplay(error instanceof Error ? error : new Error('Unknown error'));
        
        return {
          content: [
            {
              type: 'text',
              text: formattedError,
            },
          ],
        };
      }
    });
  }

  private async handleCreateBrowserSimple(args: any) {
    const params: BrowserCreateSimpleParams = args;
    
    if (!params.workspaceId) {
      throw new Error('workspaceId is required');
    }

    // Build configuration from simple parameters
    const config = BrowserCreator.buildSimpleConfig(params);
    const finalConfig = BrowserCreator.applyDefaults(config);

    // Validate configuration
    const validation = BrowserCreator.validateConfig(finalConfig);
    if (!validation.valid) {
      throw new BrowserCreationError(`Configuration validation failed: ${validation.errors.join(', ')}`);
    }

    // Create browser
    const result = await this.roxyClient.createBrowser(finalConfig);

    const response: BrowserCreateSimpleResponse = {
      browser: {
        dirId: result.dirId,
        windowName: finalConfig.windowName || 'Simple Browser',
        workspaceId: params.workspaceId,
        projectId: params.projectId,
        proxyConfigured: !!(params.proxyHost && params.proxyPort),
      },
      message: `Browser created successfully with ID: ${result.dirId}`,
    };

    return {
      content: [
        {
          type: 'text',
          text: `✅ **Simple Browser Created**\n\n` +
                `**Browser ID:** \`${response.browser.dirId}\`\n` +
                `**Name:** ${response.browser.windowName}\n` +
                `**Workspace:** ${response.browser.workspaceId}\n` +
                `${response.browser.projectId ? `**Project:** ${response.browser.projectId}\n` : ''}` +
                `**Proxy:** ${response.browser.proxyConfigured ? '✅ Configured' : '❌ Not configured'}\n\n` +
                `*Use this browser ID with \`roxy_open_browsers\` to start the browser and get CDP endpoints for automation.*`,
        },
      ],
    };
  }

  private async handleCreateBrowserStandard(args: any) {
    const params: BrowserCreateStandardParams = args;
    
    if (!params.workspaceId) {
      throw new Error('workspaceId is required');
    }

    // Build configuration from standard parameters
    const config = BrowserCreator.buildStandardConfig(params);
    const finalConfig = BrowserCreator.applyDefaults(config);

    // Validate configuration
    const validation = BrowserCreator.validateConfig(finalConfig);
    if (!validation.valid) {
      throw new BrowserCreationError(`Configuration validation failed: ${validation.errors.join(', ')}`);
    }

    // Create browser
    const result = await this.roxyClient.createBrowser(finalConfig);

    const response: BrowserCreateStandardResponse = {
      browser: {
        dirId: result.dirId,
        windowName: finalConfig.windowName || 'Standard Browser',
        workspaceId: params.workspaceId,
        projectId: params.projectId,
        os: finalConfig.os || 'Windows',
        coreVersion: finalConfig.coreVersion || '125',
        proxyInfo: params.proxyInfo,
        windowSize: `${params.openWidth || '1000'}x${params.openHeight || '1000'}`,
      },
      message: `Standard browser created successfully with ID: ${result.dirId}`,
    };

    return {
      content: [
        {
          type: 'text',
          text: `✅ **Standard Browser Created**\n\n` +
                `**Browser ID:** \`${response.browser.dirId}\`\n` +
                `**Name:** ${response.browser.windowName}\n` +
                `**OS:** ${response.browser.os} ${finalConfig.osVersion || ''}\n` +
                `**Core Version:** ${response.browser.coreVersion}\n` +
                `**Window Size:** ${response.browser.windowSize}\n` +
                `**Workspace:** ${response.browser.workspaceId}\n` +
                `${response.browser.projectId ? `**Project:** ${response.browser.projectId}\n` : ''}` +
                `**Proxy:** ${response.browser.proxyInfo ? '✅ Configured' : '❌ Not configured'}\n\n` +
                `*Browser is ready for automation. Use \`roxy_open_browsers\` to start it.*`,
        },
      ],
    };
  }

  private async handleCreateBrowserAdvanced(args: any) {
    const params: BrowserCreateAdvancedParams = args;
    
    if (!params.workspaceId) {
      throw new Error('workspaceId is required');
    }

    // Build configuration from advanced parameters
    const config = BrowserCreator.buildAdvancedConfig(params);
    const finalConfig = BrowserCreator.applyDefaults(config);

    // Validate configuration
    const validation = BrowserCreator.validateConfig(finalConfig);
    if (!validation.valid) {
      throw new BrowserCreationError(`Configuration validation failed: ${validation.errors.join(', ')}`);
    }

    // Create browser
    const result = await this.roxyClient.createBrowser(finalConfig);

    const response: BrowserCreateAdvancedResponse = {
      browser: {
        dirId: result.dirId,
        config: finalConfig,
      },
      message: `Advanced browser created successfully with ID: ${result.dirId}`,
    };

    // Create detailed status text
    const configSummary = [
      `**Browser ID:** \`${response.browser.dirId}\``,
      `**Name:** ${finalConfig.windowName || 'Advanced Browser'}`,
      `**OS:** ${finalConfig.os || 'Windows'} ${finalConfig.osVersion || ''}`,
      `**Core Version:** ${finalConfig.coreVersion || '125'}`,
      finalConfig.userAgent ? `**User Agent:** ${finalConfig.userAgent.substring(0, 50)}...` : '',
      `**Search Engine:** ${finalConfig.searchEngine || 'Google'}`,
      finalConfig.proxyInfo?.proxyCategory !== 'noproxy' ? `**Proxy:** ✅ ${finalConfig.proxyInfo?.proxyCategory} ${finalConfig.proxyInfo?.host}:${finalConfig.proxyInfo?.port}` : '**Proxy:** ❌ No proxy',
      finalConfig.fingerInfo?.randomFingerprint ? '**Fingerprint:** 🎲 Random' : '**Fingerprint:** 🔒 Fixed',
      finalConfig.defaultOpenUrl?.length ? `**Default URLs:** ${finalConfig.defaultOpenUrl.length} URL(s)` : '',
    ].filter(Boolean).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `✅ **Advanced Browser Created**\n\n${configSummary}\n\n` +
                `*Advanced browser configured with complete control. Use \`roxy_open_browsers\` to start it.*`,
        },
      ],
    };
  }

  private async handleCreateBrowserFromTemplate(args: any) {
    const params: BrowserCreateTemplateParams = args;
    
    if (!params.workspaceId || !params.templateName) {
      throw new Error('workspaceId and templateName are required');
    }

    // Get template configuration
    const templateConfig = TemplateManager.getTemplateConfig(params.templateName, params.customConfig);
    
    // Build configurations for multiple browsers
    const configs = BrowserCreator.buildConfigsFromTemplate(params, templateConfig);

    // Validate all configurations
    const validation = BrowserCreator.validateConfigs(configs);
    if (!validation.valid) {
      const errorDetails = validation.errors.map(err => `Browser ${err.index + 1}: ${err.errors.join(', ')}`).join('\n');
      throw new BrowserCreationError(`Configuration validation failed:\n${errorDetails}`);
    }

    // Create browsers in batch
    const batchResult = await this.roxyClient.createBrowsers(configs);

    const response: BrowserCreateTemplateResponse = {
      browsers: batchResult.results,
      template: params.templateName,
      successCount: batchResult.successCount,
      failureCount: batchResult.failureCount,
      total: batchResult.total,
      message: `Template-based creation completed: ${batchResult.successCount}/${batchResult.total} browsers created successfully`,
    };

    // Create result summary
    const successBrowsers = batchResult.results.filter(r => r.success);
    const failedBrowsers = batchResult.results.filter(r => !r.success);

    let resultText = `✅ **Template Browser Creation Complete**\n\n` +
                     `**Template:** ${params.templateName}\n` +
                     `**Success:** ${response.successCount}/${response.total}\n` +
                     `**Workspace:** ${params.workspaceId}\n` +
                     `${params.projectId ? `**Project:** ${params.projectId}\n` : ''}\n`;

    if (successBrowsers.length > 0) {
      resultText += `**✅ Successfully Created (${successBrowsers.length}):**\n`;
      successBrowsers.forEach((browser, index) => {
        resultText += `  ${index + 1}. \`${browser.dirId}\` - ${browser.windowName}\n`;
      });
    }

    if (failedBrowsers.length > 0) {
      resultText += `\n**❌ Failed (${failedBrowsers.length}):**\n`;
      failedBrowsers.forEach((browser, index) => {
        resultText += `  ${index + 1}. ${browser.windowName} - ${browser.error}\n`;
      });
    }

    resultText += `\n*Use \`roxy_open_browsers\` with the successful browser IDs to start them for automation.*`;

    return {
      content: [
        {
          type: 'text',
          text: resultText,
        },
      ],
    };
  }

  private async handleListBrowserTemplates() {
    const templates = TemplateManager.getAvailableTemplates();

    const templateText = templates.map(template => 
      `**${template.name}**\n  ${template.description}`
    ).join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `📋 **Available Browser Templates**\n\n${templateText}\n\n` +
                `*Use these template names with \`roxy_create_browser_from_template\` for optimized browser configurations.*`,
        },
      ],
    };
  }

  private async handleValidateProxyConfig(args: any) {
    const { proxyInfo } = args;
    
    if (!proxyInfo) {
      throw new Error('proxyInfo is required');
    }

    const validation = ProxyManager.validateProxy(proxyInfo);
    
    let resultText = '';
    
    if (validation.valid) {
      resultText = `✅ **Proxy Configuration Valid**\n\n` +
                   `**Type:** ${proxyInfo.proxyCategory || 'Not specified'}\n` +
                   `**Host:** ${proxyInfo.host || 'Not specified'}\n` +
                   `**Port:** ${proxyInfo.port || 'Not specified'}\n` +
                   `**Authentication:** ${proxyInfo.proxyUserName ? '✅ Yes' : '❌ No'}\n` +
                   `**IP Type:** ${proxyInfo.ipType || 'IPV4'}`;
    } else {
      resultText = `❌ **Proxy Configuration Invalid**\n\n` +
                   `**Errors:**\n` +
                   validation.errors.map(error => `  • ${error}`).join('\n');
    }

    if (validation.warnings.length > 0) {
      resultText += `\n\n**⚠️ Warnings:**\n` +
                    validation.warnings.map(warning => `  • ${warning}`).join('\n');
    }

    return {
      content: [
        {
          type: 'text',
          text: resultText,
        },
      ],
    };
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

  private async handleDeleteBrowsers(args: any) {
    const params: BrowserDeleteToolParams = args;
    
    if (!params.workspaceId || !params.dirIds || params.dirIds.length === 0) {
      throw new Error('workspaceId and dirIds are required');
    }

    try {
      await this.roxyClient.deleteBrowsers(params.workspaceId, params.dirIds);

      const response: BrowserDeleteToolResponse = {
        results: params.dirIds.map(dirId => ({
          dirId,
          success: true,
        })),
        successCount: params.dirIds.length,
        failureCount: 0,
        message: `Successfully deleted ${params.dirIds.length} browser(s)`,
      };

      return {
        content: [
          {
            type: 'text',
            text: `✅ **Browsers Deleted Successfully**\n\n` +
                  `**Count:** ${response.successCount} browser(s)\n` +
                  `**Workspace:** ${params.workspaceId}\n\n` +
                  `**Deleted Browsers:**\n` +
                  params.dirIds.map((dirId, index) => `  ${index + 1}. \`${dirId}\``).join('\n') +
                  `\n\n⚠️ **Warning:** Deleted browsers cannot be recovered. All browser data, profiles, and configurations have been permanently removed.`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Browser Deletion Failed**\n\n` +
                  `**Error:** ${errorMessage}\n` +
                  `**Workspace:** ${params.workspaceId}\n` +
                  `**Failed Browsers:** ${params.dirIds.length}\n\n` +
                  `**Browser IDs:**\n` +
                  params.dirIds.map((dirId, index) => `  ${index + 1}. \`${dirId}\``).join('\n'),
          },
        ],
      };
    }
  }

  private async handleSystemDiagnostics(args: any) {
    const { includeWorkspaceCheck = true, includeBrowserCheck = true, verbose = false } = args || {};
    
    // Perform comprehensive diagnostics
    const diagnostics = await this.roxyClient.performDiagnostics();
    
    let diagnosticText = `## 🔍 系统诊断报告 / System Diagnostics Report\n\n`;
    
    // Basic connectivity
    diagnosticText += `### 🌐 连接状态 / Connectivity Status\n`;
    diagnosticText += `- **API连接 / API Connection**: ${diagnostics.connected ? '✅ 已连接' : '❌ 连接失败'}\n`;
    diagnosticText += `- **认证状态 / Authentication**: ${diagnostics.authentication ? '✅ 成功' : '❌ 失败'}\n`;
    diagnosticText += `- **工作区访问 / Workspace Access**: ${diagnostics.workspaceAccess ? '✅ 正常' : '⚠️ 受限'}\n\n`;
    
    // Additional workspace checks
    if (includeWorkspaceCheck && diagnostics.connected && diagnostics.authentication) {
      try {
        const workspaces = await this.roxyClient.getWorkspaces(1, 5);
        diagnosticText += `### 📁 工作区信息 / Workspace Information\n`;
        diagnosticText += `- **可用工作区 / Available Workspaces**: ${workspaces.total}\n`;
        
        if (workspaces.rows.length > 0) {
          diagnosticText += `- **工作区详情 / Workspace Details**:\n`;
          workspaces.rows.slice(0, 3).forEach(ws => {
            const projectCount = ws.project_details.length;
            diagnosticText += `  - ${ws.workspaceName} (ID: ${ws.id}) - ${projectCount} projects\n`;
          });
          if (workspaces.total > 3) {
            diagnosticText += `  - ... and ${workspaces.total - 3} more\n`;
          }
        }
        diagnosticText += '\n';
      } catch (error) {
        diagnosticText += `### 📁 工作区信息 / Workspace Information\n`;
        diagnosticText += `- **状态**: ❌ 无法获取工作区信息\n`;
        diagnosticText += `- **错误**: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`;
      }
    }

    // Browser availability checks
    if (includeBrowserCheck && diagnostics.connected && diagnostics.authentication && diagnostics.workspaceAccess) {
      try {
        // Get first workspace and check browsers
        const workspaces = await this.roxyClient.getWorkspaces(1, 1);
        if (workspaces.rows.length > 0) {
          const firstWorkspace = workspaces.rows[0];
          const browsers = await this.roxyClient.getBrowsers({
            workspaceId: firstWorkspace.id,
            page_index: 1,
            page_size: 5,
          });
          
          diagnosticText += `### 🖥️ 浏览器状态 / Browser Status\n`;
          diagnosticText += `- **检查工作区 / Checked Workspace**: ${firstWorkspace.workspaceName} (ID: ${firstWorkspace.id})\n`;
          diagnosticText += `- **可用浏览器 / Available Browsers**: ${browsers.total}\n`;
          
          if (browsers.rows.length > 0) {
            diagnosticText += `- **浏览器示例 / Browser Examples**:\n`;
            browsers.rows.slice(0, 3).forEach(browser => {
              diagnosticText += `  - ${browser.windowName || 'Unnamed'} (${browser.os}) - Status: ${browser.status}\n`;
            });
          }
          diagnosticText += '\n';
        }
      } catch (error) {
        diagnosticText += `### 🖥️ 浏览器状态 / Browser Status\n`;
        diagnosticText += `- **状态**: ⚠️ 无法检查浏览器状态\n`;
        diagnosticText += `- **原因**: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`;
      }
    }

    // Error details
    if (diagnostics.errors.length > 0) {
      diagnosticText += `### ❌ 检测到的问题 / Detected Issues\n`;
      diagnostics.errors.forEach((error, index) => {
        diagnosticText += `${index + 1}. ${error}\n`;
      });
      diagnosticText += '\n';
    }

    // Recommendations
    if (diagnostics.recommendations.length > 0) {
      diagnosticText += `### 💡 建议操作 / Recommendations\n`;
      diagnostics.recommendations.slice(0, 8).forEach((rec, index) => {
        diagnosticText += `${index + 1}. ${rec}\n`;
      });
      if (diagnostics.recommendations.length > 8) {
        diagnosticText += `... and ${diagnostics.recommendations.length - 8} more\n`;
      }
      diagnosticText += '\n';
    }

    // Verbose information
    if (verbose) {
      diagnosticText += `### 🔧 详细信息 / Detailed Information\n`;
      diagnosticText += `- **API主机 / API Host**: ${this.roxyClient.config.apiHost}\n`;
      diagnosticText += `- **超时设置 / Timeout**: ${this.roxyClient.config.timeout}ms\n`;
      diagnosticText += `- **诊断时间 / Diagnosis Time**: ${new Date().toISOString()}\n\n`;
    }

    // Overall status
    const overallStatus = diagnostics.connected && diagnostics.authentication;
    diagnosticText += `### 📋 总体状态 / Overall Status\n`;
    diagnosticText += `**${overallStatus ? '✅ 系统正常运行' : '❌ 系统存在问题'}** / `;
    diagnosticText += `**${overallStatus ? 'System Operating Normally' : 'System Issues Detected'}**\n\n`;
    
    if (overallStatus) {
      diagnosticText += `*系统已准备就绪，可以进行浏览器自动化操作。*\n`;
      diagnosticText += `*System ready for browser automation operations.*`;
    } else {
      diagnosticText += `*请解决上述问题后重新运行诊断。*\n`;
      diagnosticText += `*Please resolve the issues above and run diagnostics again.*`;
    }

    return {
      content: [
        {
          type: 'text',
          text: diagnosticText,
        },
      ],
    };
  }

  async run() {
    // Enhanced connection testing with diagnostics
    console.error('🔗 Performing RoxyBrowser API diagnostics...');
    const diagnostics = await this.roxyClient.performDiagnostics();
    
    if (!diagnostics.connected) {
      console.error('❌ Failed to connect to RoxyBrowser API');
      console.error('\n📋 Diagnostic Results:');
      diagnostics.errors.forEach(error => console.error(`   ❌ ${error}`));
      
      if (diagnostics.recommendations.length > 0) {
        console.error('\n💡 Recommendations:');
        diagnostics.recommendations.slice(0, 5).forEach((rec, index) => {
          console.error(`   ${index + 1}. ${rec}`);
        });
      }
      process.exit(1);
    }

    if (!diagnostics.authentication) {
      console.error('❌ Authentication failed');
      console.error('\n📋 Diagnostic Results:');
      diagnostics.errors.forEach(error => console.error(`   ❌ ${error}`));
      
      if (diagnostics.recommendations.length > 0) {
        console.error('\n💡 Recommendations:');
        diagnostics.recommendations.slice(0, 5).forEach((rec, index) => {
          console.error(`   ${index + 1}. ${rec}`);
        });
      }
      process.exit(1);
    }

    console.error('✅ API Diagnostics Passed:');
    console.error('   ✓ Connection established');
    console.error('   ✓ Authentication successful');
    console.error(`   ✓ Workspace access: ${diagnostics.workspaceAccess ? 'Yes' : 'Limited'}`);
    
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

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});