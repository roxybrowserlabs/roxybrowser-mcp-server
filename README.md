# RoxyBrowser MCP Server

[English](README.md) | [中文](README_CN.md)

> **⚠️ BETA VERSION NOTICE**
>
> This project is currently in **beta testing and active development**. While we strive for stability, please exercise caution when using this tool in production environments or with critical assets. We recommend closely monitoring software and browser operations when using it with MCP clients to avoid unnecessary losses.
>
>For more details, please refer to: [RoxyBrowser Now Supports MCP — AI Can Finally Do the Work for You](https://roxybrowser.com/blog/roxybrowser-mcp-integration)

A Model Context Protocol (MCP) server for [RoxyBrowser](https://www.roxybrowser.com/) that provides AI assistants with the ability to manage browser instances and obtain Chrome DevTools Protocol (CDP) WebSocket endpoints for automation.

## Features

- 🚀 **Browser Management**: Open and close RoxyBrowser instances programmatically
- 🔗 **CDP Integration**: Get WebSocket endpoints for Chrome DevTools Protocol automation
- 🤖 **AI-Friendly**: Seamlessly integrates with AI assistants through MCP
- 🎯 **Playwright Ready**: Works with [PlayRoxy MCP](https://github.com/roxybrowserlabs/playroxy-mcp) (RoxyBrowser's customized Playwright MCP)
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

Add both RoxyBrowser OpenAPI and PlayRoxy MCP to your MCP client configuration:

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
   → Uses PlayRoxy MCP tools (browser_navigate, browser_type, browser_click, etc.)
   → PlayRoxy MCP connects to the opened browser via CDP endpoint

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
   → PlayRoxy MCP connects and begins automation
```

## Integration with Playwright MCP

RoxyBrowser MCP is designed to work seamlessly with [PlayRoxy MCP](https://github.com/roxybrowserlabs/playroxy-mcp), our customized Playwright MCP server built specifically for RoxyBrowser compatibility.

**PlayRoxy MCP** is based on [Microsoft's Playwright MCP](https://github.com/microsoft/playwright-mcp) with enhancements for RoxyBrowser's fingerprint browser features.

### Workflow

1. Use RoxyBrowser OpenAPI MCP to create and open browsers
2. Get CDP WebSocket endpoints from opened browsers
3. Use PlayRoxy MCP to automate browser tasks with full Playwright capabilities

Both servers work together seamlessly when configured in your MCP client (see configuration above).

## Development

```bash
# Development mode with auto-rebuild
npm run dev

# Build for production
npm run build
```

## API Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ROXY_API_KEY` | ✅ Yes | - | API key from RoxyBrowser settings |
| `ROXY_API_HOST` | ✅ Yes | `http://127.0.0.1:50000` | RoxyBrowser API endpoint |
| `ROXY_TIMEOUT` | No | `30000` | Request timeout in milliseconds |

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
