/**
 * RoxyBrowser API Client
 * 
 * HTTP client for RoxyBrowser REST API with authentication and error handling
 */

import {
  RoxyClientConfig,
  RoxyApiResponse,
  WorkspaceListResponse,
  BrowserListResponse,
  BrowserListParams,
  BrowserOpenParams,
  BrowserOpenResult,
  BrowserCloseParams,
  BrowserCreateConfig,
  BrowserCreateResult,
  BrowserCreateBatchResult,
  RoxyApiError,
  ConfigError,
  BrowserCreationError,
} from './types.js';

export class RoxyClient {
  private readonly config: Required<RoxyClientConfig>;

  constructor(config: RoxyClientConfig) {
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
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
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
        throw new RoxyApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          await response.text().catch(() => 'Unknown error')
        );
      }

      const data: RoxyApiResponse<T> = await response.json();

      // Check API response code
      if (data.code !== 0) {
        throw new RoxyApiError(
          data.msg || 'API request failed',
          data.code,
          data
        );
      }

      return data.data as T;
    } catch (error) {
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
  async getWorkspaces(pageIndex = 1, pageSize = 15): Promise<WorkspaceListResponse> {
    const params = new URLSearchParams({
      page_index: pageIndex.toString(),
      page_size: pageSize.toString(),
    });
    return this.makeRequest<WorkspaceListResponse>(`/browser/workspace?${params}`, {
      method: 'GET',
    });
  }

  /**
   * Get list of browsers in workspace/project
   */
  async getBrowsers(params: BrowserListParams): Promise<BrowserListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('workspaceId', params.workspaceId.toString());
    if (params.dirIds) searchParams.append('dirIds', params.dirIds);
    if (params.windowName) searchParams.append('windowName', params.windowName);
    if (params.sortNums) searchParams.append('sortNums', params.sortNums);
    if (params.os) searchParams.append('os', params.os);
    if (params.projectIds) searchParams.append('projectIds', params.projectIds);
    if (params.windowRemark) searchParams.append('windowRemark', params.windowRemark);
    if (params.page_index) searchParams.append('page_index', params.page_index.toString());
    if (params.page_size) searchParams.append('page_size', params.page_size.toString());
    
    return this.makeRequest<BrowserListResponse>(`/browser/list_v3?${searchParams}`, {
      method: 'GET',
    });
  }

  /**
   * Open a single browser
   */
  async openBrowser(params: BrowserOpenParams): Promise<BrowserOpenResult> {
    return this.makeRequest<BrowserOpenResult>('/browser/open', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Open multiple browsers in batch
   */
  async openBrowsers(
    workspaceId: number,
    dirIds: string[],
    args?: string[]
  ): Promise<BrowserOpenResult[]> {
    const results: BrowserOpenResult[] = [];
    const errors: Array<{ dirId: string; error: string }> = [];

    // Open browsers in parallel with reasonable concurrency
    const BATCH_SIZE = 5;
    for (let i = 0; i < dirIds.length; i += BATCH_SIZE) {
      const batch = dirIds.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (dirId) => {
        try {
          const result = await this.openBrowser({ workspaceId, dirId, args });
          return { dirId, result };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          return { dirId, error: errorMsg };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      for (const item of batchResults) {
        if ('result' in item && item.result) {
          results.push(item.result);
        } else if ('error' in item) {
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
  async closeBrowser(params: BrowserCloseParams): Promise<void> {
    await this.makeRequest<void>('/browser/close', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Close multiple browsers in batch
   */
  async closeBrowsers(dirIds: string[]): Promise<Array<{ dirId: string; success: boolean; error?: string }>> {
    const results: Array<{ dirId: string; success: boolean; error?: string }> = [];

    // Close browsers in parallel
    const closePromises = dirIds.map(async (dirId) => {
      try {
        await this.closeBrowser({ dirId });
        return { dirId, success: true };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return { dirId, success: false, error: errorMsg };
      }
    });

    const closeResults = await Promise.all(closePromises);
    results.push(...closeResults);

    return results;
  }

  /**
   * Create a single browser
   */
  async createBrowser(config: BrowserCreateConfig): Promise<{ dirId: string }> {
    return this.makeRequest<{ dirId: string }>('/browser/create', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  /**
   * Create multiple browsers in batch
   */
  async createBrowsers(
    configs: BrowserCreateConfig[]
  ): Promise<BrowserCreateBatchResult> {
    const results: BrowserCreateResult[] = [];
    const errors: Array<{ config: BrowserCreateConfig; error: string }> = [];

    // Create browsers in parallel with reasonable concurrency
    const BATCH_SIZE = 3;
    for (let i = 0; i < configs.length; i += BATCH_SIZE) {
      const batch = configs.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (config, batchIndex) => {
        try {
          const result = await this.createBrowser(config);
          return {
            dirId: result.dirId,
            windowName: config.windowName || `Browser-${i + batchIndex + 1}`,
            success: true,
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push({ config, error: errorMsg });
          return {
            dirId: '',
            windowName: config.windowName || `Browser-${i + batchIndex + 1}`,
            success: false,
            error: errorMsg,
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add small delay between batches to avoid overwhelming the API
      if (i + BATCH_SIZE < configs.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    // If there were errors and some successes, log warnings
    if (errors.length > 0) {
      console.warn(`${errors.length} browser creation(s) failed:`, errors);
    }

    return {
      results,
      successCount,
      failureCount,
      total: configs.length,
    };
  }

  /**
   * Get browser details by ID
   */
  async getBrowserDetail(workspaceId: number, dirId: string): Promise<any> {
    const params = new URLSearchParams({
      workspaceId: workspaceId.toString(),
      dirId,
    });
    return this.makeRequest<any>(`/browser/detail?${params}`, {
      method: 'GET',
    });
  }

  /**
   * Update/modify existing browser
   */
  async updateBrowser(config: BrowserCreateConfig & { dirId: string }): Promise<void> {
    await this.makeRequest<void>('/browser/mdf', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  /**
   * Delete browsers
   */
  async deleteBrowsers(workspaceId: number, dirIds: string[]): Promise<void> {
    await this.makeRequest<void>('/browser/delete', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, dirIds }),
    });
  }

  /**
   * Random fingerprint for browser
   */
  async randomBrowserFingerprint(workspaceId: number, dirId: string): Promise<void> {
    await this.makeRequest<void>('/browser/random_env', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, dirId }),
    });
  }

  /**
   * Clear browser local cache
   */
  async clearBrowserLocalCache(dirIds: string[]): Promise<void> {
    await this.makeRequest<void>('/browser/clear_local_cache', {
      method: 'POST',
      body: JSON.stringify({ dirIds }),
    });
  }

  /**
   * Clear browser server cache
   */
  async clearBrowserServerCache(workspaceId: number, dirIds: string[]): Promise<void> {
    await this.makeRequest<void>('/browser/clear_server_cache', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, dirIds }),
    });
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest<string>('/health');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}