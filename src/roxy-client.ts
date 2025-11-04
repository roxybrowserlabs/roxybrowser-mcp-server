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
  AccountListParams,
  AccountListResponse,
  LabelItem,
  ConnectionInfoItem,
  BrowserUpdateParams,
  ClearLocalCacheParams,
  ClearServerCacheParams,
  RandomFingerprintParams,
} from "./types.js";

export class RoxyClient {
  public readonly config: Required<RoxyClientConfig>;

  constructor(config: RoxyClientConfig) {
    // Validate required configuration
    if (!config.apiKey?.trim()) {
      throw new ConfigError("API key is required");
    }

    if (!config.apiHost?.trim()) {
      throw new ConfigError("API host is required");
    }

    this.config = {
      apiHost: config.apiHost.replace(/\/$/, ""), // Remove trailing slash
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
          "Content-Type": "application/json",
          token: this.config.apiKey, // RoxyBrowser uses 'token' header
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const responseText = await response.text().catch(() => "Unknown error");
        throw new RoxyApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          responseText,
          undefined // originalError
        );
      }

      const data: RoxyApiResponse<T> = await response.json();

      // Check API response code
      if (data.code !== 0) {
        // Enhanced error message with both Chinese and English
        let errorMessage = data.msg || "API request failed";

        // Special handling for code 409 with quota error
        if (data.code === 409 && data.msg && data.msg.includes('额度不足')) {
          const remainingQuota = typeof data.data === 'number' ? data.data : 0;
          errorMessage = `窗口额度不足 / Insufficient profiles quota. 剩余额度 / Remaining: ${remainingQuota}. 请前往 RoxyBrowser 购买窗口套餐 / Please purchase more profiles in RoxyBrowser.`;
        }

        throw new RoxyApiError(
          errorMessage,
          data.code,
          data,
          undefined // originalError
        );
      }

      return data.data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof RoxyApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new RoxyApiError(
            `Request timeout after ${this.config.timeout}ms`,
            408,
            undefined,
            error // originalError
          );
        }

        // Enhanced network error handling with pattern detection
        throw new RoxyApiError(
          `Network error: ${error.message}`,
          0,
          undefined,
          error // originalError for pattern analysis
        );
      }

      throw new RoxyApiError(
        "Unknown error occurred",
        0,
        error,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get list of workspaces and projects
   */
  async getWorkspaces(
    pageIndex = 1,
    pageSize = 15
  ): Promise<WorkspaceListResponse> {
    const params = new URLSearchParams({
      page_index: pageIndex.toString(),
      page_size: pageSize.toString(),
    });
    return this.makeRequest<WorkspaceListResponse>(
      `/browser/workspace?${params}`,
      {
        method: "GET",
      }
    );
  }

  /**
   * Get list of browsers in workspace/project
   */
  async getBrowsers(params: BrowserListParams): Promise<BrowserListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("workspaceId", params.workspaceId.toString());
    if (params.dirIds) searchParams.append("dirIds", params.dirIds);
    if (params.windowName) searchParams.append("windowName", params.windowName);
    if (params.sortNums) searchParams.append("sortNums", params.sortNums);
    if (params.os) searchParams.append("os", params.os);
    if (params.projectIds) searchParams.append("projectIds", params.projectIds);
    if (params.windowRemark)
      searchParams.append("windowRemark", params.windowRemark);
    if (params.page_index)
      searchParams.append("page_index", params.page_index.toString());
    if (params.page_size)
      searchParams.append("page_size", params.page_size.toString());

    return this.makeRequest<BrowserListResponse>(
      `/browser/list_v3?${searchParams}`,
      {
        method: "GET",
      }
    );
  }

  /**
   * Open a single browser
   */
  async openBrowser(params: BrowserOpenParams): Promise<BrowserOpenResult> {
    return this.makeRequest<BrowserOpenResult>("/browser/open", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Open multiple browsers in batch with enhanced error handling and retry logic
   */
  async openBrowsers(
    workspaceId: number,
    dirIds: string[],
    args?: string[],
    options: { maxRetries?: number; retryDelay?: number } = {}
  ): Promise<{
    successes: BrowserOpenResult[];
    failures: Array<{ dirId: string; error: string; errorCode?: number; retryable: boolean }>;
  }> {
    const { maxRetries = 2, retryDelay = 1000 } = options;
    const successes: BrowserOpenResult[] = [];
    const failures: Array<{
      dirId: string;
      error: string;
      errorCode?: number;
      retryable: boolean;
    }> = [];

    // Open browsers in parallel with reasonable concurrency
    const BATCH_SIZE = 5;
    for (let i = 0; i < dirIds.length; i += BATCH_SIZE) {
      const batch = dirIds.slice(i, i + BATCH_SIZE);

      const batchPromises = batch.map(async (dirId) => {
        let lastError: Error | null = null;
        let lastErrorCode: number | undefined = undefined;

        // Retry logic for each browser
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            const result = await this.openBrowser({ workspaceId, dirId, args });
            return { dirId, result };
          } catch (error) {
            lastError =
              error instanceof Error ? error : new Error("Unknown error");

            // Capture error code if available
            if (error instanceof RoxyApiError) {
              lastErrorCode = error.code;

              // Don't retry non-retryable errors
              if (!error.isRetryable()) {
                break;
              }
            }

            // Don't wait after the last attempt
            if (attempt < maxRetries) {
              await new Promise((resolve) =>
                setTimeout(resolve, retryDelay * (attempt + 1))
              );
            }
          }
        }

        // All attempts failed
        const isRetryable =
          lastError instanceof RoxyApiError ? lastError.isRetryable() : true;
        return {
          dirId,
          error: lastError?.message || "Unknown error",
          errorCode: lastErrorCode,
          retryable: isRetryable,
        };
      });

      const batchResults = await Promise.all(batchPromises);

      for (const item of batchResults) {
        if ("result" in item && item.result) {
          successes.push(item.result);
        } else if ("error" in item) {
          failures.push({
            dirId: item.dirId,
            error: item.error,
            errorCode: item.errorCode,
            retryable: "retryable" in item ? item.retryable : true,
          });
        }
      }
    }

    // Enhanced error reporting
    if (failures.length > 0) {
      const retryableErrors = failures.filter((e) => e.retryable);
      const nonRetryableErrors = failures.filter((e) => !e.retryable);

      console.warn(
        `Browser opening completed with ${failures.length} errors:`
      );
      if (retryableErrors.length > 0) {
        console.warn(
          `  - ${retryableErrors.length} retryable errors (could retry later)`
        );
      }
      if (nonRetryableErrors.length > 0) {
        console.warn(
          `  - ${nonRetryableErrors.length} non-retryable errors (require intervention)`
        );
      }
    }

    return { successes, failures };
  }

  /**
   * Close a single browser
   */
  async closeBrowser(params: BrowserCloseParams): Promise<void> {
    await this.makeRequest<void>("/browser/close", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Close multiple browsers in batch
   */
  async closeBrowsers(
    dirIds: string[]
  ): Promise<Array<{ dirId: string; success: boolean; error?: string }>> {
    const results: Array<{ dirId: string; success: boolean; error?: string }> =
      [];

    // Close browsers in parallel
    const closePromises = dirIds.map(async (dirId) => {
      try {
        await this.closeBrowser({ dirId });
        return { dirId, success: true };
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
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
    return this.makeRequest<{ dirId: string }>("/browser/create", {
      method: "POST",
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
          const errorMsg =
            error instanceof Error ? error.message : "Unknown error";
          errors.push({ config, error: errorMsg });
          return {
            dirId: "",
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

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
    const response = await this.makeRequest<{ rows: any[]; total: number }>(`/browser/detail?${params}`, {
      method: "GET",
    });

    // API returns { rows: [browser object], total: 1 }, extract first browser
    if (response.rows && response.rows.length > 0) {
      return response.rows[0];
    }

    throw new Error('Browser not found or no data returned');
  }

  /**
   * Update/modify existing browser
   */
  async updateBrowser(
    config: BrowserCreateConfig & { dirId: string }
  ): Promise<void> {
    await this.makeRequest<void>("/browser/mdf", {
      method: "POST",
      body: JSON.stringify(config),
    });
  }

  /**
   * Delete browsers
   */
  async deleteBrowsers(workspaceId: number, dirIds: string[]): Promise<void> {
    await this.makeRequest<void>("/browser/delete", {
      method: "POST",
      body: JSON.stringify({ workspaceId, dirIds }),
    });
  }

  /**
   * Random fingerprint for browser
   */
  async randomBrowserFingerprint(
    workspaceId: number,
    dirId: string
  ): Promise<void> {
    await this.makeRequest<void>("/browser/random_env", {
      method: "POST",
      body: JSON.stringify({ workspaceId, dirId }),
    });
  }

  /**
   * Clear browser local cache
   */
  async clearBrowserLocalCache(dirIds: string[]): Promise<void> {
    await this.makeRequest<void>("/browser/clear_local_cache", {
      method: "POST",
      body: JSON.stringify({ dirIds }),
    });
  }

  /**
   * Clear browser server cache
   */
  async clearBrowserServerCache(
    workspaceId: number,
    dirIds: string[]
  ): Promise<void> {
    await this.makeRequest<void>("/browser/clear_server_cache", {
      method: "POST",
      body: JSON.stringify({ workspaceId, dirIds }),
    });
  }

  /**
   * Get account list
   */
  async getAccounts(params: AccountListParams): Promise<AccountListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("workspaceId", params.workspaceId.toString());
    if (params.accountId)
      searchParams.append("accountId", params.accountId.toString());
    if (params.page_index)
      searchParams.append("page_index", params.page_index.toString());
    if (params.page_size)
      searchParams.append("page_size", params.page_size.toString());

    return this.makeRequest<AccountListResponse>(
      `/browser/account?${searchParams}`,
      {
        method: "GET",
      }
    );
  }

  /**
   * Get label list
   */
  async getLabels(workspaceId: number): Promise<LabelItem[]> {
    const params = new URLSearchParams({
      workspaceId: workspaceId.toString(),
    });
    return this.makeRequest<LabelItem[]>(`/browser/label?${params}`, {
      method: "GET",
    });
  }

  /**
   * Get connection info for opened browsers
   */
  async getConnectionInfo(dirIds?: string[]): Promise<ConnectionInfoItem[]> {
    const params = new URLSearchParams();
    if (dirIds && dirIds.length > 0) {
      params.append("dirIds", dirIds.join(","));
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/browser/connection_info?${queryString}`
      : "/browser/connection_info";

    return this.makeRequest<ConnectionInfoItem[]>(endpoint, {
      method: "GET",
    });
  }

  /**
   * Test API connectivity with detailed diagnostics
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest<string>("/health");
      return true;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }

  /**
   * Perform comprehensive API diagnostics
   */
  async performDiagnostics(): Promise<{
    connected: boolean;
    apiVersion?: string;
    authentication: boolean;
    workspaceAccess: boolean;
    errors: string[];
    recommendations: string[];
  }> {
    const result = {
      connected: false,
      authentication: false,
      workspaceAccess: false,
      errors: [] as string[],
      recommendations: [] as string[],
    };

    // Test 1: Basic connectivity
    try {
      await this.makeRequest<string>("/health");
      result.connected = true;
    } catch (error) {
      result.connected = false;
      if (error instanceof RoxyApiError) {
        result.errors.push(`Connection failed: ${error.getExplanation()}`);
        result.recommendations.push(...error.getTroubleshootingSteps());
      } else {
        result.errors.push(
          `Network error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        result.recommendations.push(
          "Check if RoxyBrowser is running",
          "Verify API host configuration",
          "Check network connectivity"
        );
      }
    }

    // Test 2: Authentication (if connected)
    if (result.connected) {
      try {
        await this.getWorkspaces(1, 1);
        result.authentication = true;
        result.workspaceAccess = true;
      } catch (error) {
        if (error instanceof RoxyApiError) {
          if (error.code === 401) {
            result.authentication = false;
            result.errors.push("Authentication failed: Invalid API key");
            result.recommendations.push(
              "Check ROXY_API_KEY environment variable",
              "Verify API key in RoxyBrowser settings",
              "Ensure API is enabled in RoxyBrowser"
            );
          } else if (error.code === 403) {
            result.authentication = true;
            result.workspaceAccess = false;
            result.errors.push("Access denied: Insufficient permissions");
            result.recommendations.push(
              "Check API key permissions",
              "Verify workspace access rights"
            );
          } else {
            result.authentication = true;
            result.errors.push(`API error: ${error.getExplanation()}`);
            result.recommendations.push(...error.getTroubleshootingSteps());
          }
        } else {
          result.errors.push(
            `Unexpected error: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }
    }

    return result;
  }
}
