# Claude Assistant Instructions for RoxyBrowser MCP

This document provides Claude with specific instructions for using the RoxyBrowser MCP server effectively.

## Context

RoxyBrowser is a fingerprint browser designed for managing multiple browser profiles. This MCP server provides Claude with the ability to:
- Manage browser instances (open/close)
- Retrieve Chrome DevTools Protocol (CDP) WebSocket endpoints
- Work with browser profiles across different workspaces and projects

## Available Tools

### 1. `roxy_list_workspaces`
Lists all available workspaces and their associated projects.

**Usage Pattern:**
```
Claude: "Let me check what workspaces are available"
→ Use roxy_list_workspaces
```

**Returns:** List of workspaces with their projects, useful for finding the right workspace/project IDs.

### 2. `roxy_list_browsers` 
Lists browsers in a specific workspace/project.

**Parameters:**
- `workspaceId` (required): The workspace ID
- `projectIds` (optional): Comma-separated project IDs to filter
- `windowName` (optional): Filter by browser window name
- `pageIndex` (optional): Page number for pagination
- `pageSize` (optional): Number of results per page

**Usage Pattern:**
```
Claude: "I need to see what browsers are available in workspace 6"
→ Use roxy_list_browsers with workspaceId: 6
```

### 3. `roxy_open_browsers` ⭐ Primary Tool
Opens multiple browsers and returns their CDP WebSocket endpoints.

**Parameters:**
- `workspaceId` (required): The workspace ID
- `dirIds` (required): Array of browser directory IDs to open
- `args` (optional): Browser startup arguments

**Usage Pattern:**
```
Claude: "Open 3 browsers for Gmail automation"
1. First use roxy_list_browsers to get available browser IDs
2. Then use roxy_open_browsers with selected dirIds
3. Extract WebSocket URLs from response for playwright-mcp
```

**Critical:** This tool returns CDP WebSocket endpoints that can be used with playwright-mcp for automation.

### 4. `roxy_close_browsers`
Closes multiple browsers by their directory IDs.

**Parameters:**
- `dirIds` (required): Array of browser directory IDs to close

**Usage Pattern:**
```
Claude: "Clean up by closing all opened browsers"
→ Use roxy_close_browsers with the dirIds that were opened earlier
```

## Integration with Playwright MCP

The primary value of RoxyBrowser MCP is providing CDP endpoints for playwright-mcp:

```
1. Use roxy_open_browsers → Get WebSocket URLs
2. Use playwright-mcp with --cdp-endpoint flag
3. Perform web automation with playwright tools
4. Use roxy_close_browsers when done
```

**Example WebSocket URL:** `ws://127.0.0.1:62662/devtools/browser/58293891-bfb2-402b-b79a-8f37ed005402`

## Best Practices

### Workflow Order
1. **Discovery:** Use `roxy_list_workspaces` to understand available resources
2. **Selection:** Use `roxy_list_browsers` to find suitable browser profiles
3. **Opening:** Use `roxy_open_browsers` to start browsers and get CDP endpoints
4. **Automation:** Use playwright-mcp with the CDP endpoints
5. **Cleanup:** Use `roxy_close_browsers` to close browsers when done

### Resource Management
- Always close browsers after automation tasks
- Keep track of opened browser dirIds for proper cleanup
- Consider system resources when opening multiple browsers

### Error Handling
- If browser opening fails, check if the profile exists and isn't already open
- Verify workspace and project IDs exist before attempting operations
- Handle partial failures gracefully when opening multiple browsers

## Common Use Cases

### Gmail Automation Workflow
```
1. "List workspaces to find Gmail project"
2. "Show browsers in the Gmail workspace/project"  
3. "Open 10 Gmail browser profiles"
4. "Use the CDP endpoints with playwright for automation"
5. "Close all browsers when email tasks are complete"
```

### Browser Profile Management
```
1. "Show all available browser profiles in workspace X"
2. "Open specific browsers for testing"
3. "Close unused browser instances"
```

## Important Notes

- RoxyBrowser MCP focuses on browser lifecycle management
- Actual web automation should be done through playwright-mcp
- Always verify API connectivity before attempting operations
- Browser opening can take time, be patient with responses
- Each browser gets a unique CDP WebSocket endpoint

## Environment Requirements

The MCP server requires:
- `ROXY_API_KEY`: Your RoxyBrowser API key
- `ROXY_API_HOST`: RoxyBrowser API endpoint (default: http://127.0.0.1:50000)
- RoxyBrowser application running with API enabled

## Security Considerations

- API keys should be handled securely
- CDP endpoints provide full browser control
- Only use trusted browser profiles for automation
- Consider network security when accessing WebSocket endpoints