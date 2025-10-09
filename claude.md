# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RoxyBrowser MCP Server is a Model Context Protocol (MCP) server that provides AI assistants with browser automation capabilities through the RoxyBrowser fingerprint browser. The server acts as a bridge between AI assistants and RoxyBrowser's API, enabling browser lifecycle management and Chrome DevTools Protocol (CDP) endpoint generation.

## Development Commands

### Build and Development
```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Development mode with auto-rebuild
npm run dev

# Clean build artifacts
npm run clean

# Build and publish to npm
npm run npm-publish
```

### Running the Server
```bash
# Start the compiled server
npm start

# Or run directly from source (after build)
node lib/index.js
```

## Architecture Overview

### Core Components

1. **Main Server** (`src/index.ts`)
   - MCP server implementation using `@modelcontextprotocol/sdk`
   - Tool registration and request handling
   - Configuration management and API connectivity testing
   - Error handling and graceful shutdown

2. **RoxyClient** (`src/roxy-client.ts`)
   - HTTP client for RoxyBrowser REST API
   - Authentication using API key in `token` header
   - Request/response handling with proper error types
   - Batch operations for browsers (open/close/create)

3. **Browser Creator** (`src/browser/browser-creator.ts`)
   - Configuration builder for different complexity levels
   - Validation and default application
   - Proxy assignment and batch operations
   - OS version compatibility checking

4. **Proxy Manager** (`src/proxy/proxy-manager.ts`)
   - Proxy configuration validation and testing
   - Multiple proxy formats support (URL, host:port)
   - Proxy distribution strategies (round-robin, random)
   - Statistics and filtering capabilities

5. **Types** (`src/types.ts`)
   - Comprehensive TypeScript definitions
   - API request/response types
   - Browser configuration interfaces
   - Error classes and validation types

### Browser Creation Complexity Levels

The server supports three complexity levels for browser creation:

1. **Simple** - Basic proxy configuration, minimal setup
2. **Standard** - OS/version selection, window size, language, timezone
3. **Advanced** - Complete control over fingerprints, user agents, platform accounts

### Enhanced Error Handling System

The server includes a comprehensive error handling and analysis system:

**Error Types:**
- **ConfigError**: Environment/configuration issues
- **RoxyApiError**: Enhanced API errors with troubleshooting guidance
- **BrowserCreationError**: Browser setup failures with retry capabilities

**Key Features:**
- **Error Code Mapping**: Complete RoxyBrowser API error code interpretation (0, 400, 401, 403, 404, 408, 409, 500, 502, 503, 504)
- **Chinese/English Support**: Bilingual error messages and explanations
- **Intelligent Analysis**: `ErrorAnalyzer` utility categorizes errors by type, severity, and provides actionable solutions
- **Retry Logic**: Automatic retry for retriable errors with exponential backoff
- **Network Pattern Detection**: Recognizes common network issues (ECONNREFUSED, ETIMEDOUT, etc.)
- **Batch Error Analysis**: Aggregates and analyzes multiple errors to identify patterns

**Error Categories:**
- `network`: Connection and communication issues
- `authentication`: API key and permission problems
- `configuration`: Parameter validation and setup errors
- `resource`: Missing workspaces, browsers, or conflicts
- `server`: RoxyBrowser internal errors
- `browser`: Browser lifecycle issues
- `proxy`: Proxy configuration and connectivity

**Diagnostic Tools:**
- **System Diagnostics**: `roxy_system_diagnostics` tool for comprehensive health checks
- **Enhanced Startup**: Detailed connectivity and authentication testing
- **Troubleshooting Guidance**: Context-aware suggestions for resolving issues

## Configuration Requirements

### Environment Variables
```bash
# Required
ROXY_API_KEY="your_api_key_from_roxybrowser"

# Optional
ROXY_API_HOST="http://127.0.0.1:50000"  # Default API endpoint
ROXY_TIMEOUT="30000"                     # Request timeout in ms
```

### RoxyBrowser Setup
1. Install and run RoxyBrowser application
2. Enable API: RoxyBrowser → API → API配置 → 启用状态 = 启用
3. Copy API Key from the settings
4. Verify API port (default: 50000)

## MCP Integration Patterns

### Tool Implementation Pattern
Each MCP tool follows this structure:
1. Parameter validation using TypeScript interfaces
2. Business logic delegation to service classes
3. Formatted response with success/error details
4. Consistent error handling and user feedback

### Batch Operations
The server implements intelligent batching for performance:
- Browser opening: 5 concurrent operations
- Browser creation: 3 concurrent with 1s delays
- Proper error isolation and partial success handling

### Response Formatting
All tool responses use structured markdown format with:
- Success/failure indicators (✅/❌)
- Key information (Browser IDs, counts, configurations)
- Actionable next steps
- Example commands for playwright-mcp integration

## Integration with Playwright MCP

Primary workflow:
1. Use RoxyBrowser MCP to manage browser lifecycle
2. Extract CDP WebSocket endpoints from open operations
3. Pass endpoints to playwright-mcp for automation
4. Clean up browsers when automation completes

Example CDP endpoint: `ws://127.0.0.1:62662/devtools/browser/58293891-bfb2-402b-b79a-8f37ed005402`

## Development Guidelines

### Adding New Tools
1. Define TypeScript interfaces in `types.ts`
2. Add tool schema to `TOOLS` array in `index.ts`
3. Implement handler method in `RoxyBrowserMCPServer` class
4. Add business logic to appropriate service class
5. Use `ErrorAnalyzer.formatErrorForDisplay()` for consistent error responses
6. Update documentation and test connectivity

### Working with Error Analysis
**Using the ErrorAnalyzer utility:**
```typescript
// Analyze single error
const analysis = ErrorAnalyzer.analyzeError(error);
const formatted = ErrorAnalyzer.formatErrorForDisplay(error);

// Analyze batch errors
const batchAnalysis = ErrorAnalyzer.analyzeBatchErrors(errorArray);
const batchFormatted = ErrorAnalyzer.formatBatchAnalysisForDisplay(batchAnalysis);
```

**Key Error Analysis Features:**
- **Error Classification**: Automatically categorizes errors by type and severity
- **Retry Detection**: Identifies which errors can be safely retried
- **Troubleshooting**: Provides context-aware troubleshooting steps
- **Pattern Recognition**: Detects common error patterns in network issues
- **Bilingual Support**: Returns both Chinese and English explanations

### Error Handling Best Practices
- Use specific error types for different failure modes
- Include actionable troubleshooting information
- Log warnings for partial failures
- Preserve context for debugging

### Available MCP Tools

**Workspace & Project Management:**
- `roxy_list_workspaces` - List all workspaces and projects
- `roxy_list_accounts` - Get platform accounts/credentials in workspace
- `roxy_list_labels` - Get browser labels in workspace

**Browser Management:**
- `roxy_list_browsers` - List browsers with filtering options
- `roxy_get_browser_detail` - Get detailed information for a specific browser
- `roxy_create_browser_simple` - Create browser with basic configuration
- `roxy_create_browser_standard` - Create browser with standard options
- `roxy_create_browser_advanced` - Create browser with full control
- `roxy_update_browser` - Update/modify existing browser configuration
- `roxy_delete_browsers` - Delete browsers permanently

**Browser Operations:**
- `roxy_open_browsers` - Open browsers and get CDP endpoints
- `roxy_close_browsers` - Close opened browsers
- `roxy_get_connection_info` - Get CDP endpoints and PIDs for opened browsers

**Browser Maintenance:**
- `roxy_random_fingerprint` - Randomize browser fingerprint
- `roxy_clear_local_cache` - Clear local browser cache
- `roxy_clear_server_cache` - Clear server-side browser cache

**Utilities:**
- `roxy_validate_proxy_config` - Validate proxy configuration
- `roxy_system_diagnostics` - Comprehensive system health check and diagnostics
  - Tests API connectivity, authentication, workspace access
  - Checks browser availability and status
  - Provides detailed troubleshooting recommendations
  - Supports verbose mode for detailed information

**Error Analysis Features:**
- All tools now provide enhanced error responses with:
  - Bilingual error messages (Chinese/English)
  - Error categorization and severity assessment
  - Specific troubleshooting steps
  - Retry recommendations when applicable
  - Related error pattern identification

## API Integration Notes

The RoxyBrowser API uses:
- `token` header for authentication (not Authorization)
- Numeric response codes (0 = success)
- Workspace/Project hierarchical organization
- Directory IDs (dirId) for browser identification

Key endpoints:
- `/browser/workspace` - List workspaces and projects
- `/browser/account` - Get platform accounts/credentials
- `/browser/label` - Get browser labels
- `/browser/list_v3` - List browsers with filtering
- `/browser/detail` - Get detailed browser information
- `/browser/open` - Open single browser
- `/browser/close` - Close single browser
- `/browser/connection_info` - Get connection info for opened browsers
- `/browser/create` - Create new browser
- `/browser/mdf` - Update/modify browser
- `/browser/delete` - Delete browsers permanently
- `/browser/random_env` - Randomize browser fingerprint
- `/browser/clear_local_cache` - Clear local browser cache
- `/browser/clear_server_cache` - Clear server browser cache

## Testing and Validation

Connection testing happens at startup:
1. API connectivity verification
2. Authentication validation
3. Graceful failure with helpful error messages

For development, verify:
1. RoxyBrowser application is running
2. API is enabled in settings
3. Network connectivity to localhost:50000
4. API key is valid and not expired

## Security Considerations

- API keys are passed in environment variables only
- No credentials stored in code or logs
- CDP endpoints provide full browser control
- Consider network security for WebSocket connections
- Only use trusted browser profiles for automation