/**
 * RoxyBrowser MCP Server Types
 *
 * TypeScript type definitions for RoxyBrowser API and MCP server functionality
 */
// ========== Error Types ==========
/** RoxyBrowser API error */
export class RoxyApiError extends Error {
    code;
    response;
    constructor(message, code, response) {
        super(message);
        this.code = code;
        this.response = response;
        this.name = 'RoxyApiError';
    }
}
/** Configuration error */
export class ConfigError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConfigError';
    }
}
//# sourceMappingURL=types.js.map