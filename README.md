# RoxyBrowser MCP Server

A Model Context Protocol (MCP) server for [RoxyBrowser](https://www.roxybrowser.com/) that provides AI assistants with the ability to manage browser instances and obtain Chrome DevTools Protocol (CDP) WebSocket endpoints for automation.

## Features

- 🚀 **Browser Management**: Open and close RoxyBrowser instances programmatically
- 🔗 **CDP Integration**: Get WebSocket endpoints for Chrome DevTools Protocol automation
- 🤖 **AI-Friendly**: Seamlessly integrates with AI assistants through MCP
- 🎯 **Playwright Ready**: Works perfectly with [@playwright/mcp](https://github.com/microsoft/playwright-mcp)
- 📊 **Workspace Support**: Manage browsers across different workspaces and projects

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

#### 1. `roxy_list_workspaces`
Get all available workspaces and their projects.

**Parameters:**
- `pageIndex` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Items per page (default: 15)

**Example:**
```
AI: "List all RoxyBrowser workspaces"
```

#### 2. `roxy_list_browsers`
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

#### 3. `roxy_open_browsers` ⭐
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

#### 4. `roxy_close_browsers`
Close multiple browsers by their directory IDs.

**Parameters:**
- `dirIds` (required): Array of browser directory IDs to close

**Example:**
```
AI: "Close browsers with IDs: abc123, def456, ghi789"
```

## Complete Workflow Example

Here's how to use RoxyBrowser MCP with Playwright MCP for Gmail automation:

```
1. AI: "List workspaces to find my Gmail project"
   → Uses roxy_list_workspaces

2. AI: "List browsers in workspace 1 project 2" 
   → Uses roxy_list_browsers to find available browser profiles

3. AI: "Open 10 browsers from the Gmail project"
   → Uses roxy_open_browsers
   → Returns CDP WebSocket URLs like: ws://127.0.0.1:52314/devtools/browser/xxx

4. AI: "Connect to the first browser and automate Gmail"
   → Uses playwright-mcp with --cdp-endpoint flag
   → npx @playwright/mcp@latest --cdp-endpoint "ws://127.0.0.1:52314/devtools/browser/xxx"

5. AI: "Navigate to gmail.com, login, and send emails"
   → Uses playwright-mcp tools: browser_navigate, browser_type, browser_click, etc.

6. AI: "Close all browsers when done"
   → Uses roxy_close_browsers
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