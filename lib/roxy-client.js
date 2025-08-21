/**
 * RoxyBrowser API Client
 *
 * HTTP client for RoxyBrowser REST API with authentication and error handling
 */
import { RoxyApiError, ConfigError, } from './types.js';
export class RoxyClient {
    config;
    constructor(config) {
        // Validate required configuration
        if (!config.apiKey?.trim()) {
            throw new ConfigError('API key is required');
        }
        if (!config.apiHost?.trim()) {
            throw new ConfigError('API host is required');
        }
        this.config = {
            apiHost: config.apiHost.replace(/\/$/, ''), // Remove trailing slash
            apiKey: config.apiKey,
            timeout: config.timeout ?? 30000,
        };
    }
    /**
     * Make authenticated HTTP request to RoxyBrowser API
     */
    async makeRequest(endpoint, options = {}) {
        const url = `${this.config.apiHost}${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'token': this.config.apiKey, // RoxyBrowser uses 'token' header
                    ...options.headers,
                },
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new RoxyApiError(`HTTP ${response.status}: ${response.statusText}`, response.status, await response.text().catch(() => 'Unknown error'));
            }
            const data = await response.json();
            // Check API response code
            if (data.code !== 0) {
                throw new RoxyApiError(data.msg || 'API request failed', data.code, data);
            }
            return data.data;
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof RoxyApiError) {
                throw error;
            }
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new RoxyApiError(`Request timeout after ${this.config.timeout}ms`, 408);
                }
                throw new RoxyApiError(`Network error: ${error.message}`, 0, error);
            }
            throw new RoxyApiError('Unknown error occurred', 0, error);
        }
    }
    /**
     * Get list of workspaces and projects
     */
    async getWorkspaces(pageIndex = 1, pageSize = 15) {
        const params = new URLSearchParams({
            page_index: pageIndex.toString(),
            page_size: pageSize.toString(),
        });
        return this.makeRequest(`/browser/workspace?${params}`, {
            method: 'GET',
        });
    }
    /**
     * Get list of browsers in workspace/project
     */
    async getBrowsers(params) {
        const searchParams = new URLSearchParams();
        searchParams.append('workspaceId', params.workspaceId.toString());
        if (params.dirIds)
            searchParams.append('dirIds', params.dirIds);
        if (params.windowName)
            searchParams.append('windowName', params.windowName);
        if (params.sortNums)
            searchParams.append('sortNums', params.sortNums);
        if (params.os)
            searchParams.append('os', params.os);
        if (params.projectIds)
            searchParams.append('projectIds', params.projectIds);
        if (params.windowRemark)
            searchParams.append('windowRemark', params.windowRemark);
        if (params.page_index)
            searchParams.append('page_index', params.page_index.toString());
        if (params.page_size)
            searchParams.append('page_size', params.page_size.toString());
        return this.makeRequest(`/browser/list_v3?${searchParams}`, {
            method: 'GET',
        });
    }
    /**
     * Open a single browser
     */
    async openBrowser(params) {
        return this.makeRequest('/browser/open', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }
    /**
     * Open multiple browsers in batch
     */
    async openBrowsers(workspaceId, dirIds, args) {
        const results = [];
        const errors = [];
        // Open browsers in parallel with reasonable concurrency
        const BATCH_SIZE = 5;
        for (let i = 0; i < dirIds.length; i += BATCH_SIZE) {
            const batch = dirIds.slice(i, i + BATCH_SIZE);
            const batchPromises = batch.map(async (dirId) => {
                try {
                    const result = await this.openBrowser({ workspaceId, dirId, args });
                    return { dirId, result };
                }
                catch (error) {
                    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                    return { dirId, error: errorMsg };
                }
            });
            const batchResults = await Promise.all(batchPromises);
            for (const item of batchResults) {
                if ('result' in item && item.result) {
                    results.push(item.result);
                }
                else if ('error' in item) {
                    errors.push({ dirId: item.dirId, error: item.error });
                }
            }
        }
        if (errors.length > 0) {
            console.warn('Some browsers failed to open:', errors);
        }
        return results;
    }
    /**
     * Close a single browser
     */
    async closeBrowser(params) {
        await this.makeRequest('/browser/close', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }
    /**
     * Close multiple browsers in batch
     */
    async closeBrowsers(dirIds) {
        const results = [];
        // Close browsers in parallel
        const closePromises = dirIds.map(async (dirId) => {
            try {
                await this.closeBrowser({ dirId });
                return { dirId, success: true };
            }
            catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                return { dirId, success: false, error: errorMsg };
            }
        });
        const closeResults = await Promise.all(closePromises);
        results.push(...closeResults);
        return results;
    }
    /**
     * Test API connectivity
     */
    async testConnection() {
        try {
            await this.makeRequest('/health');
            return true;
        }
        catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }
}
//# sourceMappingURL=roxy-client.js.map