# RoxyBrowser MCP Server

A Model Context Protocol (MCP) server for [RoxyBrowser](https://www.roxybrowser.com/) that provides AI assistants with the ability to manage browser instances and obtain Chrome DevTools Protocol (CDP) WebSocket endpoints for automation.

## Features

- 🚀 **Browser Management**: Open and close RoxyBrowser instances programmatically
- 🔗 **CDP Integration**: Get WebSocket endpoints for Chrome DevTools Protocol automation
- 🤖 **AI-Friendly**: Seamlessly integrates with AI assistants through MCP
- 🎯 **Playwright Ready**: Works perfectly with [@playwright/mcp](https://github.com/microsoft/playwright-mcp)
- 📊 **Workspace Support**: Manage browsers across different workspaces and projects
- 🛠️ **Browser Creation**: Create browsers with layered complexity (Simple, Standard, Advanced)
- 🌐 **Proxy Management**: Built-in proxy validation, testing, and configuration tools
- 🔧 **Advanced Configuration**: Full control over fingerprints, proxies, and browser settings

## Quick Start

### Prerequisites

1. **RoxyBrowser** installed and running
2. **RoxyBrowser API** enabled in settings:
   - Open RoxyBrowser → API → API配置
   - Set "启用状态" to "启用" (Enable)
   - Copy your API Key
   - Note the API port (default: 50000)

### Installation

```bash
# Clone or download the roxy-browser-mcp project
cd roxy-browser-mcp

# Install dependencies
npm install

# Build the TypeScript project
npm run build
```

### Configuration

Set up your environment variables:

```bash
# Required: Your RoxyBrowser API Key
export ROXY_API_KEY="your_api_key_here"

# Optional: API host (default: http://127.0.0.1:50000)
export ROXY_API_HOST="http://127.0.0.1:50000"

# Optional: Request timeout in milliseconds (default: 30000)
export ROXY_TIMEOUT="30000"
```

### MCP Client Configuration

Add the server to your MCP client configuration:

**Claude Desktop / VS Code / Cursor:**
```json
{
  "mcpServers": {
    "roxy-browser": {
      "command": "node",
      "args": ["/path/to/roxy-browser-mcp/lib/index.js"],
      "env": {
        "ROXY_API_KEY": "your_api_key_here",
        "ROXY_API_HOST": "http://127.0.0.1:50000"
      }
    }
  }
}
```

## Usage

### Available Tools

#### Browser Management Tools

##### 1. `roxy_list_workspaces`
Get all available workspaces and their projects.

**Parameters:**
- `pageIndex` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Items per page (default: 15)

**Example:**
```
AI: "List all RoxyBrowser workspaces"
```

##### 2. `roxy_list_browsers`
Get browsers in a specific workspace/project.

**Parameters:**
- `workspaceId` (required): Workspace ID
- `projectIds` (optional): Comma-separated project IDs
- `windowName` (optional): Filter by browser window name
- `pageIndex` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 15)

**Example:**
```
AI: "List browsers in workspace 1 project 5"
```

##### 3. `roxy_open_browsers` ⭐
Open multiple browsers and get their CDP WebSocket endpoints.

**Parameters:**
- `workspaceId` (required): Workspace ID
- `dirIds` (required): Array of browser directory IDs
- `args` (optional): Browser startup arguments

**Example:**
```
AI: "Open 5 browsers from workspace 1 with IDs: abc123, def456, ghi789, jkl012, mno345"
```

**Returns:**
- CDP WebSocket URLs for each browser
- HTTP endpoints
- Process IDs
- Ready-to-use playwright-mcp commands

##### 4. `roxy_close_browsers`
Close multiple browsers by their directory IDs.

**Parameters:**
- `dirIds` (required): Array of browser directory IDs to close

**Example:**
```
AI: "Close browsers with IDs: abc123, def456, ghi789"
```

#### Browser Creation Tools 🆕

##### 5. `roxy_create_browser_simple` 
Create a browser with simple configuration - perfect for quick setup.

**Parameters:**
- `workspaceId` (required): Workspace ID
- `windowName` (optional): Browser window name
- `projectId` (optional): Project ID
- `proxyHost` (optional): Proxy server host
- `proxyPort` (optional): Proxy server port
- `proxyUserName` (optional): Proxy username
- `proxyPassword` (optional): Proxy password
- `proxyType` (optional): HTTP, HTTPS, or SOCKS5

**Example:**
```
AI: "Create a simple browser in workspace 1 with proxy 192.168.1.100:8080"
```

##### 6. `roxy_create_browser_standard`
Create a browser with standard configuration - covers most use cases.

**Parameters:**
- `workspaceId` (required): Workspace ID
- `windowName` (optional): Browser window name
- `projectId` (optional): Project ID
- `os` (optional): Windows, macOS, Linux, IOS, Android
- `osVersion` (optional): OS version
- `coreVersion` (optional): Browser core version
- `proxyInfo` (optional): Complete proxy configuration object
- `openWidth` (optional): Window width
- `openHeight` (optional): Window height
- `language` (optional): Browser language
- `timeZone` (optional): Browser timezone
- `defaultOpenUrl` (optional): URLs to open by default

**Example:**
```
AI: "Create a standard Windows 11 browser with 1920x1080 resolution and SOCKS5 proxy"
```

##### 7. `roxy_create_browser_advanced`
Create a browser with complete configuration control - for expert users.

**Parameters:**
- All standard parameters plus:
- `userAgent` (optional): Custom user agent
- `searchEngine` (optional): Default search engine
- `labelIds` (optional): Label IDs to assign
- `proxyInfo` (optional): Full proxy configuration
- `fingerInfo` (optional): Complete fingerprint configuration
- `windowPlatformList` (optional): Platform account information

**Example:**
```
AI: "Create an advanced browser with custom fingerprint settings and multiple platform accounts"
```

#### Proxy Management Tools 🆕

##### 8. `roxy_validate_proxy_config`
Validate proxy configuration before using it.

**Parameters:**
- `proxyInfo` (required): Proxy configuration to validate

**Example:**
```
AI: "Validate this proxy configuration before creating browsers"
```

## Complete Workflow Examples

### Example 1: Quick Browser Automation Setup

```
1. AI: "Create a simple browser in workspace 1 with name 'Test Browser'"
   → Uses roxy_create_browser_simple
   → Returns browser ID ready for use

2. AI: "Open the browser I just created"
   → Uses roxy_open_browsers with the returned ID
   → Returns CDP WebSocket URL like: ws://127.0.0.1:52314/devtools/browser/xxx

3. AI: "Connect to the browser and automate tasks"
   → Uses playwright-mcp with --cdp-endpoint flag
   → npx @playwright/mcp@latest --cdp-endpoint "ws://127.0.0.1:52314/devtools/browser/xxx"

4. AI: "Navigate to gmail.com, login, and send emails"
   → Uses playwright-mcp tools: browser_navigate, browser_type, browser_click, etc.

5. AI: "Close the browser when done"
   → Uses roxy_close_browsers
```

### Example 2: Advanced Browser with Proxy Setup

```
1. AI: "Validate my proxy configuration before creating browsers"
   → Uses roxy_validate_proxy_config
   → Confirms proxy settings are correct

2. AI: "Create a standard browser with SOCKS5 proxy and 1920x1080 resolution in workspace 2"
   → Uses roxy_create_browser_standard with proxy configuration
   → Returns configured browser ID

3. AI: "Open the browser and start automation"
   → Uses roxy_open_browsers → playwright-mcp integration
   → Begin automated tasks
```

## Integration with Playwright MCP

RoxyBrowser MCP is designed to work seamlessly with [@playwright/mcp](https://github.com/microsoft/playwright-mcp):

```bash
# 1. Use RoxyBrowser MCP to open browsers and get WebSocket URLs
# 2. Start playwright-mcp with the WebSocket endpoint:

npx @playwright/mcp@latest --cdp-endpoint "ws://127.0.0.1:52314/devtools/browser/xxx"
```

## Development

```bash
# Development mode with auto-rebuild
npm run dev

# Build for production
npm run build

# Clean build artifacts
npm run clean
```

## Troubleshooting

### Connection Issues

**Error: "Failed to connect to RoxyBrowser API"**

Check:
1. RoxyBrowser is running
2. API is enabled: RoxyBrowser → API → API配置 → 启用状态 = 启用
3. Correct API key: Copy from RoxyBrowser → API → API配置 → API Key
4. Correct port: Check RoxyBrowser → API → API配置 → 端口 (default: 50000)
5. No firewall blocking localhost:50000

### Authentication Issues

**Error: "Configuration Error: API key is required"**

Set the environment variable:
```bash
export ROXY_API_KEY="your_actual_api_key_from_roxybrowser"
```

### Browser Opening Issues

**Some browsers fail to open:**

- Check that the browser profiles exist and are not corrupted
- Ensure sufficient system resources (RAM, CPU)
- Verify the dirIds are valid (use `roxy_list_browsers` first)

## API Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ROXY_API_KEY` | ✅ Yes | - | API key from RoxyBrowser settings |
| `ROXY_API_HOST` | No | `http://127.0.0.1:50000` | RoxyBrowser API endpoint |
| `ROXY_TIMEOUT` | No | `30000` | Request timeout in milliseconds |

### Error Codes

| Code | Meaning | Action |
|------|---------|---------|
| 0 | Success | - |
| 408 | Timeout | Check network connection |
| 500 | Server Error | Check RoxyBrowser logs |

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request