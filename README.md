# RoxyBrowser MCP Server

[English](README.md) | [中文](README_CN.md)

A Model Context Protocol (MCP) server for [RoxyBrowser](https://www.roxybrowser.com/) that provides AI assistants with the ability to manage browser instances and obtain Chrome DevTools Protocol (CDP) WebSocket endpoints for automation.

## Features

- 🚀 **Browser Management**: Open and close RoxyBrowser instances programmatically
- 🔗 **CDP Integration**: Get WebSocket endpoints for Chrome DevTools Protocol automation
- 🤖 **AI-Friendly**: Seamlessly integrates with AI assistants through MCP
- 🎯 **Playwright Ready**: Works with [RoxyBrowser Playwright MCP](https://github.com/roxybrowserlabs/roxybrowser-playwright-mcp) (RoxyBrowser's customized Playwright MCP)
- 📊 **Workspace Support**: Manage browsers across different workspaces and projects
- 🛠️ **Browser Creation**: Create browsers (single or batch) with full configuration
- 🌐 **Proxy Management**: List, create, detect, and manage proxy configurations
- 👤 **Account Management**: Manage platform accounts and credentials in workspaces
- 🔧 **Advanced Configuration**: Fingerprints, cache clear, random fingerprint, and more
- 🏥 **Health Check**: Server and workspace connectivity diagnostics

## Quick Start

### Prerequisites

1. **RoxyBrowser** installed and running
2. **RoxyBrowser API** enabled in settings:
   - Open RoxyBrowser → API
   - Set "API Status" to "Enable"
   - Copy your API Key
   - Note the API port (default: 50000)

### MCP Client Configuration

Add both RoxyBrowser OpenAPI and RoxyBrowser Playwright MCP to your MCP client configuration:

**Claude Desktop / VS Code / Cursor:**
```json
{
  "mcpServers": {
    "roxybrowser-openapi": {
      "command": "npx",
      "args": ["@roxybrowser/openapi@latest"],
      "env": {
        "ROXY_API_KEY": "YOUR API KEY",
        "ROXY_API_HOST": "http://127.0.0.1:50000"
      }
    },
    "roxybrowser-playwright-mcp": {
      "command": "npx",
      "args": ["@roxybrowser/playwright-mcp@latest"]
    }
  }
}
```

**Note:** Replace `YOUR API KEY` and `YOUR API HOST` with your actual RoxyBrowser credentials.

## Usage

This package supports three ways to run: **CLI**, **in-process (programmatic)**, and **as a library** for custom integration.

### 1. CLI (direct start)

Start the MCP server from the command line. Ideal for MCP clients that spawn the server as a subprocess.

```bash
# After npm install -g @roxybrowser/openapi
roxy-browser-mcp

# Or with npx (no global install)
npx @roxybrowser/openapi

# After cloning and building
npm run build && node lib/index.js
```

CLI options (config: **CLI args > environment variables > defaults**):

- `-V, --version` — Show version
- `-h, --help` — Show usage
- `-H, --api-host <url>` — RoxyBrowser API base URL (default: `http://127.0.0.1:50000`)
- `-k, --api-key <key>` — API key (required unless set via env)
- `-t, --timeout <ms>` — Request timeout in milliseconds (default: `30000`)

Environment variables (used when an option is not passed): `ROXY_API_HOST`, `ROXY_API_KEY`, `ROXY_TIMEOUT`.

Examples:

```bash
roxy-browser-mcp --api-key "your-key"
roxy-browser-mcp -k "your-key" -H http://127.0.0.1:50000
ROXY_API_KEY=your-key roxy-browser-mcp
```

### 2. In-process (programmatic start)

Run the MCP server inside your own Node process (same process, stdio transport). Useful when you want to start the server from code instead of a separate CLI process.

```ts
import { runServer } from '@roxybrowser/openapi'

// Starts MCP server on stdio; runs until process exits
await runServer()
```

Or use the server class for more control:

```ts
import { RoxyBrowserMCPServer } from '@roxybrowser/openapi'

const server = new RoxyBrowserMCPServer()
await server.run()
```

Set env vars (`ROXY_API_KEY`, `ROXY_API_HOST`) before calling `runServer()`; config is read at process start and cannot be changed at runtime.

### 3. Library (secondary development)

Use the exported tools and API helpers in your own app: call RoxyBrowser APIs without running the MCP server.

```ts
import {
  listBrowsers,
  openBrowser,
  createBrowser,
  listWorkspaces,
  healthCheck,
} from '@roxybrowser/openapi'

// Set ROXY_API_KEY and ROXY_API_HOST (env) before any request; config is fixed at process start
// Use tool handlers directly (same as MCP tool calls)
const listResult = await listBrowsers.handle({ workspaceId: 1 })
const openResult = await openBrowser.handle({
  workspaceId: 1,
  dirIds: ['browser-dir-id'],
})
const createResult = await createBrowser.handle({
  workspaceId: 1,
  windowName: 'My Browser',
})
```

Each tool exports:

- `.name` — Tool name (e.g. `roxy_list_browsers`)
- `.schema` — MCP tool schema (`name`, `description`, `inputSchema`)
- `.handle(args)` — Async handler; pass the same arguments as the MCP tool

You can also use the low-level `request()` helper and types:

```ts
import { request, resolveConfig } from '@roxybrowser/openapi'
import type { RoxyClientConfig, BrowserListItem, Workspace } from '@roxybrowser/openapi'

const res = await request('/browser/list_v3?workspaceId=1', { method: 'GET' })
```

This allows you to build custom UIs, scripts, or other MCP servers that reuse RoxyBrowser logic.

## Available Tools

### Workspace
- `roxy_list_workspaces` - List all available workspaces and their projects

### Browser
- `roxy_list_browsers` - List browsers in a workspace/project with filtering
- `roxy_create_browser` - Create a browser with full configuration
- `roxy_batch_create_browsers` - Create multiple browsers in batch
- `roxy_open_browsers` - Open browsers and get CDP WebSocket endpoints for automation
- `roxy_update_browser` - Update existing browser configuration
- `roxy_close_browsers` - Close running browsers (does NOT free quota)
- `roxy_delete_browsers` - Delete browser profiles permanently (frees quota)
- `roxy_get_browser_detail` - Get detailed browser information and configuration
- `roxy_get_connection_info` - Get CDP endpoints and PIDs for opened browsers
- `roxy_clear_local_cache` - Clear local browser cache
- `roxy_clear_server_cache` - Clear server-side browser cache
- `roxy_random_fingerprint` - Randomize browser fingerprint
- `roxy_list_labels` - Get browser labels/tags for organization

### Proxy
- `roxy_list_proxies` - List proxy configurations in a workspace
- `roxy_store_proxies` - Get list of proxies you've purchased (store)
- `roxy_create_proxy` - Create a proxy configuration
- `roxy_batch_create_proxies` - Create multiple proxies in batch
- `roxy_detect_proxy` - Detect/test proxy availability
- `roxy_modify_proxy` - Modify existing proxy configuration
- `roxy_delete_proxies` - Delete proxy configurations

### Account
- `roxy_list_accounts` - List platform accounts and credentials in a workspace
- `roxy_create_account` - Create a platform account
- `roxy_batch_create_accounts` - Create multiple accounts in batch
- `roxy_modify_account` - Modify existing account
- `roxy_delete_accounts` - Delete accounts

### Utilities
- `roxy_health_check` - Server health check and workspace/browser connectivity diagnostics

## Complete Workflow Examples

### Example 1: Quick Browser Automation Setup

```
1. AI: "Create a browser in workspace 1 with name 'Test Browser'"
   → Uses roxy_create_browser
   → Returns browser ID ready for use

2. AI: "Open the browser I just created"
   → Uses roxy_open_browsers with the returned ID
   → Returns CDP WebSocket URL like: ws://127.0.0.1:52314/devtools/browser/xxx

3. AI: "Navigate to gmail.com, login, and send emails"
   → Uses RoxyBrowser Playwright MCP tools (browser_navigate, browser_type, browser_click, etc.)
   → RoxyBrowser Playwright MCP connects to the opened browser via CDP endpoint

4. AI: "Close the browser when done"
   → Uses roxy_close_browsers
```

### Example 2: Browser with Proxy

```
1. AI: "Detect my proxy before creating browsers"
   → Uses roxy_detect_proxy
   → Confirms proxy is available

2. AI: "Create a browser with SOCKS5 proxy and 1920x1080 in workspace 2"
   → Uses roxy_create_browser with proxy configuration
   → Returns configured browser ID

3. AI: "Open the browser and start automation"
   → Uses roxy_open_browsers → gets CDP endpoint
   → RoxyBrowser Playwright MCP connects and begins automation
```

## Integration with Playwright MCP

RoxyBrowser MCP is designed to work seamlessly with [RoxyBrowser Playwright MCP](https://github.com/roxybrowserlabs/roxybrowser-playwright-mcp), our customized Playwright MCP server built specifically for RoxyBrowser compatibility.

**RoxyBrowser Playwright MCP** is based on [Microsoft's Playwright MCP](https://github.com/microsoft/playwright-mcp) with enhancements for RoxyBrowser's fingerprint browser features.

### Workflow

1. Use RoxyBrowser OpenAPI MCP to create and open browsers
2. Get CDP WebSocket endpoints from opened browsers
3. Use RoxyBrowser Playwright MCP to automate browser tasks with full Playwright capabilities

Both servers work together seamlessly when configured in your MCP client (see configuration above).

## Development

```bash
# Development mode with auto-rebuild
npm run dev

# Build for production
npm run build
```

## API Reference

### Configuration

Config is resolved in this order: **CLI arguments > environment variables > defaults**.

| Source | Options / Variables | Description |
|--------|----------------------|-------------|
| CLI | `-H, --api-host`, `-k, --api-key`, `-t, --timeout` | Pass when starting the server |
| Env | `ROXY_API_HOST`, `ROXY_API_KEY`, `ROXY_TIMEOUT` | Used when CLI option not passed |
| Defaults | `apiHost: http://127.0.0.1:50000`, `timeout: 30000` | Built-in defaults |

Config is read from env only; use `resolveConfig()` to read current effective config (env + defaults).

## Troubleshooting

### Connection Issues

**Error: "Failed to connect to RoxyBrowser API"**

Check:
1. RoxyBrowser is running
2. API is enabled: RoxyBrowser → API → API Status = Enable
3. Correct API key: Copy from RoxyBrowser → API → API Key
4. Correct port: Check RoxyBrowser → API → Port Settings (default: 50000)
5. No firewall blocking http://127.0.0.1:50000

### Authentication Issues

**Error: "Configuration Error: API key is required"**

Set the environment variable:
```bash
export ROXY_API_KEY="your_actual_api_key_from_roxybrowser"
```

### Browser Opening Issues

**Error: "Insufficient profiles quota" (Code 101 or 409)**

Solutions:
- Purchase more profiles in RoxyBrowser Billing Center
- **Delete** unused browser profiles using `roxy_delete_browsers` (closing alone does NOT free quota)
- Upgrade your subscription plan
- Check current quota usage in workspace settings

**Some browsers fail to open:**

- Check that the browser profiles exist and are not corrupted
- Ensure sufficient system resources (RAM, CPU)
- Verify the dirIds are valid (use `roxy_list_browsers` first)
- Run `roxy_health_check` for connectivity and health diagnostics

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
