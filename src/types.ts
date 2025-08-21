/**
 * RoxyBrowser MCP Server Types
 * 
 * TypeScript type definitions for RoxyBrowser API and MCP server functionality
 */

// ========== RoxyBrowser API Types ==========

/** Base API response structure */
export interface RoxyApiResponse<T = unknown> {
  code: number;
  msg: string;
  data?: T;
}

/** Workspace project details */
export interface ProjectDetails {
  projectId: number;
  projectName: string;
}

/** Workspace information */
export interface Workspace {
  id: number;
  workspaceName: string;
  project_details: ProjectDetails[];
}

/** Paginated workspace response */
export interface WorkspaceListResponse {
  total: number;
  rows: Workspace[];
}

/** Browser open result (single browser) */
export interface BrowserOpenResult {
  ws: string;           // WebSocket CDP endpoint
  http: string;         // HTTP endpoint  
  coreVersion: string;  // Browser core version
  driver: string;       // WebDriver path
  sortNum: number;      // Window sort number
  windowName: string;   // Window name
  windowRemark: string; // Window remark
  pid: number;          // Process ID
  dirId?: string;       // Browser directory ID
}

/** Browser list item */
export interface BrowserListItem {
  dirId: string;        // Browser directory ID
  workspaceId: number;  // Workspace ID
  projectId: number;    // Project ID
  windowName: string;   // Window name
  windowRemark: string; // Window remark
  sortNum: number;      // Window sort number
  os: string;           // Operating system
  status: string;       // Browser status
  // ... other fields from API
}

/** Paginated browser list response */
export interface BrowserListResponse {
  total: number;
  rows: BrowserListItem[];
}

/** Browser list query parameters */
export interface BrowserListParams {
  workspaceId: number;
  dirIds?: string;      // Comma-separated browser IDs
  windowName?: string;  // Browser window name
  sortNums?: string;    // Comma-separated sort numbers
  os?: string;          // Operating system
  projectIds?: string;  // Comma-separated project IDs
  windowRemark?: string; // Window remark
  page_index?: number;  // Page index (default: 1)
  page_size?: number;   // Page size (default: 15)
}

/** Browser open parameters */
export interface BrowserOpenParams {
  workspaceId: number;
  dirId: string;        // Browser directory ID
  args?: string[];      // Browser startup arguments
}

/** Browser close parameters */
export interface BrowserCloseParams {
  dirId: string;        // Browser directory ID
}

// ========== MCP Tool Types ==========

/** Workspace list tool response */
export interface WorkspaceListToolResponse {
  workspaces: Workspace[];
  total: number;
}

/** Browser list tool parameters */
export interface BrowserListToolParams {
  workspaceId: number;
  projectIds?: string;  // Comma-separated project IDs
  windowName?: string;
  pageIndex?: number;
  pageSize?: number;
}

/** Browser list tool response */
export interface BrowserListToolResponse {
  browsers: BrowserListItem[];
  total: number;
  workspaceId: number;
}

/** Browser open tool parameters */
export interface BrowserOpenToolParams {
  workspaceId: number;
  dirIds: string[];     // Array of browser directory IDs
  args?: string[];      // Optional browser startup arguments
}

/** Browser open tool response */
export interface BrowserOpenToolResponse {
  results: {
    dirId: string;
    ws: string;         // CDP WebSocket endpoint
    http: string;       // HTTP endpoint  
    pid: number;
    success: boolean;
    error?: string;
  }[];
  total: number;
  successCount: number;
  failureCount: number;
}

/** Browser close tool parameters */
export interface BrowserCloseToolParams {
  dirIds: string[];     // Array of browser directory IDs
}

/** Browser close tool response */
export interface BrowserCloseToolResponse {
  results: {
    dirId: string;
    success: boolean;
    error?: string;
  }[];
  total: number;
  successCount: number;
  failureCount: number;
}

// ========== Client Configuration ==========

/** RoxyBrowser client configuration */
export interface RoxyClientConfig {
  apiHost: string;      // RoxyBrowser API host (default: http://127.0.0.1:50000)
  apiKey: string;       // RoxyBrowser API key
  timeout?: number;     // Request timeout in milliseconds (default: 30000)
}

// ========== Error Types ==========

/** RoxyBrowser API error */
export class RoxyApiError extends Error {
  constructor(
    message: string,
    public code: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'RoxyApiError';
  }
}

/** Configuration error */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}