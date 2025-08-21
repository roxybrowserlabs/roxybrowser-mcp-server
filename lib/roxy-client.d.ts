/**
 * RoxyBrowser API Client
 *
 * HTTP client for RoxyBrowser REST API with authentication and error handling
 */
import { RoxyClientConfig, WorkspaceListResponse, BrowserListResponse, BrowserListParams, BrowserOpenParams, BrowserOpenResult, BrowserCloseParams } from './types.js';
export declare class RoxyClient {
    private readonly config;
    constructor(config: RoxyClientConfig);
    /**
     * Make authenticated HTTP request to RoxyBrowser API
     */
    private makeRequest;
    /**
     * Get list of workspaces and projects
     */
    getWorkspaces(pageIndex?: number, pageSize?: number): Promise<WorkspaceListResponse>;
    /**
     * Get list of browsers in workspace/project
     */
    getBrowsers(params: BrowserListParams): Promise<BrowserListResponse>;
    /**
     * Open a single browser
     */
    openBrowser(params: BrowserOpenParams): Promise<BrowserOpenResult>;
    /**
     * Open multiple browsers in batch
     */
    openBrowsers(workspaceId: number, dirIds: string[], args?: string[]): Promise<BrowserOpenResult[]>;
    /**
     * Close a single browser
     */
    closeBrowser(params: BrowserCloseParams): Promise<void>;
    /**
     * Close multiple browsers in batch
     */
    closeBrowsers(dirIds: string[]): Promise<Array<{
        dirId: string;
        success: boolean;
        error?: string;
    }>>;
    /**
     * Test API connectivity
     */
    testConnection(): Promise<boolean>;
}
//# sourceMappingURL=roxy-client.d.ts.map