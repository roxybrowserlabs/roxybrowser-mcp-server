/**
 * RoxyBrowser MCP Server Types
 *
 * TypeScript type definitions for RoxyBrowser API and MCP server functionality
 */
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
    ws: string;
    http: string;
    coreVersion: string;
    driver: string;
    sortNum: number;
    windowName: string;
    windowRemark: string;
    pid: number;
    dirId?: string;
}
/** Browser list item */
export interface BrowserListItem {
    dirId: string;
    workspaceId: number;
    projectId: number;
    windowName: string;
    windowRemark: string;
    sortNum: number;
    os: string;
    status: string;
}
/** Paginated browser list response */
export interface BrowserListResponse {
    total: number;
    rows: BrowserListItem[];
}
/** Browser list query parameters */
export interface BrowserListParams {
    workspaceId: number;
    dirIds?: string;
    windowName?: string;
    sortNums?: string;
    os?: string;
    projectIds?: string;
    windowRemark?: string;
    page_index?: number;
    page_size?: number;
}
/** Browser open parameters */
export interface BrowserOpenParams {
    workspaceId: number;
    dirId: string;
    args?: string[];
}
/** Browser close parameters */
export interface BrowserCloseParams {
    dirId: string;
}
/** Workspace list tool response */
export interface WorkspaceListToolResponse {
    workspaces: Workspace[];
    total: number;
}
/** Browser list tool parameters */
export interface BrowserListToolParams {
    workspaceId: number;
    projectIds?: string;
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
    dirIds: string[];
    args?: string[];
}
/** Browser open tool response */
export interface BrowserOpenToolResponse {
    results: {
        dirId: string;
        ws: string;
        http: string;
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
    dirIds: string[];
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
/** RoxyBrowser client configuration */
export interface RoxyClientConfig {
    apiHost: string;
    apiKey: string;
    timeout?: number;
}
/** RoxyBrowser API error */
export declare class RoxyApiError extends Error {
    code: number;
    response?: unknown | undefined;
    constructor(message: string, code: number, response?: unknown | undefined);
}
/** Configuration error */
export declare class ConfigError extends Error {
    constructor(message: string);
}
//# sourceMappingURL=types.d.ts.map