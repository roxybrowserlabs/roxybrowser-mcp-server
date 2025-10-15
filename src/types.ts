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

/** Browser delete tool parameters */
export interface BrowserDeleteToolParams {
  workspaceId: number;  // Workspace ID
  dirIds: string[];     // Array of browser directory IDs to delete
}

/** Browser delete tool response */
export interface BrowserDeleteToolResponse {
  results: {
    dirId: string;
    success: boolean;
    error?: string;
  }[];
  successCount: number;
  failureCount: number;
  message: string;
}

// ========== Client Configuration ==========

/** RoxyBrowser client configuration */
export interface RoxyClientConfig {
  apiHost: string;      // RoxyBrowser API host (default: http://127.0.0.1:50000)
  apiKey: string;       // RoxyBrowser API key
  timeout?: number;     // Request timeout in milliseconds (default: 30000)
}

// ========== Browser Creation Types ==========

/** Browser operating system types */
export type BrowserOS = 'Windows' | 'macOS' | 'Linux' | 'IOS' | 'Android';

/** Browser core versions */
export type CoreVersion = '138' | '137' | '136' | '135' | '133' | '130' | '125' | '117' | '109';

/** Search engine options */
export type SearchEngine = 'Google' | 'Microsoft Bing' | 'Yahoo' | 'Yandex' | 'DuckDuckGo';

/** Window platform information */
export interface WindowPlatformInfo {
  platformUrl?: string;         // Business platform URL
  platformUserName?: string;    // Platform account
  platformPassword?: string;    // Platform password  
  platformEfa?: string;         // EFA value
  platformRemarks?: string;     // Platform remarks
}

/** Proxy configuration details */
export interface ProxyInfo {
  proxyMethod?: 'custom' | 'choose' | 'api';                    // Proxy method
  proxyCategory?: 'noproxy' | 'HTTP' | 'HTTPS' | 'SOCKS5' | 'SSH'; // Proxy type
  ipType?: 'IPV4' | 'IPV6';                                     // Network protocol
  protocol?: 'HTTP' | 'HTTPS' | 'SOCKS5';                      // Proxy protocol
  host?: string;                                                // Proxy host
  port?: string;                                                // Proxy port
  proxyUserName?: string;                                       // Proxy username
  proxyPassword?: string;                                       // Proxy password
  refreshUrl?: string;                                          // Refresh URL
  checkChannel?: 'IPRust.io' | 'IP-API' | 'IP123.in';         // IP query channel
}

/** Fingerprint configuration */
export interface FingerInfo {
  // Language settings
  isLanguageBaseIp?: boolean;           // Follow IP matching for browser language
  language?: string;                    // Custom browser language
  isDisplayLanguageBaseIp?: boolean;    // Follow IP matching for display language
  displayLanguage?: string;             // Custom display language
  
  // Location and timezone
  isTimeZone?: boolean;                 // Follow IP matching for timezone
  timeZone?: string;                    // Custom timezone
  position?: 0 | 1 | 2;                // Geolocation prompt: 0=ask, 1=allow, 2=deny
  isPositionBaseIp?: boolean;           // Follow IP matching for geolocation
  longitude?: string;                   // Custom longitude
  latitude?: string;                    // Custom latitude
  precisionPos?: string;                // Precision in meters
  
  // Media settings
  forbidAudio?: boolean;                // Enable/disable sound
  forbidImage?: boolean;                // Enable/disable image loading
  forbidMedia?: boolean;                // Enable/disable video playback
  
  // Window settings
  openWidth?: string;                   // Window width
  openHeight?: string;                  // Window height
  openBookmarks?: boolean;              // Enable bookmarks
  positionSwitch?: boolean;             // Window position switch
  windowRatioPosition?: string;         // Window position ratio
  isDisplayName?: boolean;              // Show window name in title bar
  
  // Sync settings
  syncBookmark?: boolean;               // Sync bookmarks
  syncHistory?: boolean;                // Sync history
  syncTab?: boolean;                    // Sync tabs
  syncCookie?: boolean;                 // Sync cookies
  syncExtensions?: boolean;             // Sync extensions
  syncPassword?: boolean;               // Sync saved passwords
  syncIndexedDb?: boolean;              // Sync IndexedDB
  syncLocalStorage?: boolean;           // Sync LocalStorage
  
  // Cleanup settings
  clearCacheFile?: boolean;             // Clear cache files on startup
  clearCookie?: boolean;                // Clear cookies on startup
  clearLocalStorage?: boolean;          // Clear LocalStorage on startup
  
  // Advanced settings
  randomFingerprint?: boolean;          // Generate random fingerprint
  forbidSavePassword?: boolean;         // Disable password save prompts
  stopOpenNet?: boolean;                // Stop opening if network fails
  stopOpenIP?: boolean;                 // Stop opening if IP changes
  stopOpenPosition?: boolean;           // Stop opening if IP location changes
  openWorkbench?: 0 | 1 | 2;           // Open workbench: 0=close, 1=open, 2=follow app
  
  // Display settings
  resolutionType?: boolean;             // Custom resolution vs follow system
  resolutionX?: string;                 // Custom resolution width
  resolutionY?: string;                 // Custom resolution height
  fontType?: boolean;                   // Random fonts vs system fonts
  
  // Browser fingerprint settings
  webRTC?: 0 | 1 | 2;                  // WebRTC: 0=replace, 1=real, 2=disable
  webGL?: boolean;                      // WebGL: random vs real
  webGLInfo?: boolean;                  // WebGL info: custom vs real
  webGLManufacturer?: string;           // Custom WebGL manufacturer
  webGLRender?: string;                 // Custom WebGL renderer
  webGpu?: 'webgl' | 'real' | 'block';  // WebGPU setting
  canvas?: boolean;                     // Canvas: random vs real
  audioContext?: boolean;               // AudioContext: random vs real
  speechVoices?: boolean;               // Speech Voices: random vs real
  doNotTrack?: boolean;                 // Enable Do Not Track
  clientRects?: boolean;                // ClientRects: random vs real
  deviceInfo?: boolean;                 // Media devices: random vs real
  deviceNameSwitch?: boolean;           // Device names: random vs real
  macInfo?: boolean;                    // MAC address: custom vs real
  hardwareConcurrent?: string;          // Hardware concurrency
  deviceMemory?: string;                // Device memory
  disableSsl?: boolean;                 // SSL fingerprint settings
  disableSslList?: string[];            // SSL feature list
  portScanProtect?: boolean;            // Port scan protection
  portScanList?: string;                // Port scan whitelist
  useGpu?: boolean;                     // Use GPU acceleration
  sandboxPermission?: boolean;          // Disable sandbox
  startupParam?: string;                // Browser startup parameters
}

/** Complete browser creation configuration */
export interface BrowserCreateConfig {
  workspaceId: number;                  // Required: Workspace ID
  windowName?: string;                  // Window name
  coreVersion?: CoreVersion;            // Browser core version
  os?: BrowserOS;                       // Operating system
  osVersion?: string;                   // OS version
  userAgent?: string;                   // Custom user agent
  cookie?: unknown[];                   // Cookie list
  searchEngine?: SearchEngine;          // Default search engine
  labelIds?: number[];                  // Label IDs
  windowPlatformList?: WindowPlatformInfo[]; // Platform account info
  defaultOpenUrl?: string[];            // Default URLs to open
  windowRemark?: string;                // Window remarks
  projectId?: number;                   // Project ID
  proxyInfo?: ProxyInfo;                // Proxy configuration
  fingerInfo?: FingerInfo;              // Fingerprint configuration
}

/** Simple browser creation parameters - for most common use cases */
export interface BrowserCreateSimpleParams {
  workspaceId: number;                  // Required: Workspace ID
  windowName?: string;                  // Window name
  projectId?: number;                   // Project ID
  windowRemark?: string;                // Window remarks
  proxyHost?: string;                   // Simple proxy host
  proxyPort?: string;                   // Simple proxy port
  proxyUserName?: string;               // Simple proxy username
  proxyPassword?: string;               // Simple proxy password
  proxyType?: 'HTTP' | 'HTTPS' | 'SOCKS5'; // Simple proxy type
}

/** Standard browser creation parameters - covers 80% of use cases */
export interface BrowserCreateStandardParams {
  workspaceId: number;                  // Required: Workspace ID
  windowName?: string;                  // Window name
  projectId?: number;                   // Project ID
  windowRemark?: string;                // Window remarks
  os?: BrowserOS;                       // Operating system
  osVersion?: string;                   // OS version
  coreVersion?: CoreVersion;            // Browser core version
  proxyInfo?: ProxyInfo;                // Complete proxy configuration
  openWidth?: string;                   // Window width
  openHeight?: string;                  // Window height
  language?: string;                    // Browser language
  timeZone?: string;                    // Timezone
  defaultOpenUrl?: string[];            // Default URLs
}

/** Advanced browser creation parameters - full control */
export interface BrowserCreateAdvancedParams extends BrowserCreateConfig {}

/** Browser creation result */
export interface BrowserCreateResult {
  dirId: string;                        // Browser directory ID
  windowName: string;                   // Window name
  success: boolean;                     // Creation success
  error?: string;                       // Error message if failed
}

/** Batch browser creation result */
export interface BrowserCreateBatchResult {
  results: BrowserCreateResult[];       // Individual results
  successCount: number;                 // Number of successful creations
  failureCount: number;                 // Number of failed creations
  total: number;                        // Total attempts
}

// ========== MCP Tool Types for Browser Creation ==========

/** Simple browser creation tool response */
export interface BrowserCreateSimpleResponse {
  browser: {
    dirId: string;
    windowName: string;
    workspaceId: number;
    projectId?: number;
    proxyConfigured: boolean;
  };
  message: string;
}

/** Standard browser creation tool response */
export interface BrowserCreateStandardResponse {
  browser: {
    dirId: string;
    windowName: string;
    workspaceId: number;
    projectId?: number;
    os: string;
    coreVersion: string;
    proxyInfo?: ProxyInfo;
    windowSize: string;
  };
  message: string;
}

/** Advanced browser creation tool response */
export interface BrowserCreateAdvancedResponse {
  browser: {
    dirId: string;
    config: BrowserCreateConfig;
  };
  message: string;
}

// ========== Error Types ==========

/** RoxyBrowser API error codes mapping */
export enum RoxyApiErrorCode {
  SUCCESS = 0,           // 成功
  INVALID_PARAMS = 400,  // 参数错误
  UNAUTHORIZED = 401,    // 认证失败
  FORBIDDEN = 403,       // 权限不足
  NOT_FOUND = 404,       // 资源不存在
  TIMEOUT = 408,         // 请求超时
  CONFLICT = 409,        // 资源冲突
  SERVER_ERROR = 500,    // 服务器内部错误
  BAD_GATEWAY = 502,     // 网关错误
  SERVICE_UNAVAILABLE = 503, // 服务不可用
  GATEWAY_TIMEOUT = 504, // 网关超时
}

/** Error information with troubleshooting guidance */
export interface ErrorInfo {
  code: number;
  name: string;
  description: string;
  chineseMsg: string;
  englishMsg: string;
  category: 'network' | 'authentication' | 'configuration' | 'resource' | 'server' | 'browser' | 'proxy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  troubleshooting: string[];
  autoRecoverable: boolean;
  retryable: boolean;
}

/** Error mapping for RoxyBrowser API */
export const ROXY_ERROR_MAP: Record<number, ErrorInfo> = {
  0: {
    code: 0,
    name: 'SUCCESS',
    description: 'Operation completed successfully',
    chineseMsg: '成功',
    englishMsg: 'Success',
    category: 'server',
    severity: 'low',
    troubleshooting: [],
    autoRecoverable: true,
    retryable: false,
  },
  400: {
    code: 400,
    name: 'INVALID_PARAMS',
    description: 'Invalid parameters provided',
    chineseMsg: '参数错误',
    englishMsg: 'Invalid parameters',
    category: 'configuration',
    severity: 'medium',
    troubleshooting: [
      'Check all required parameters are provided',
      'Verify parameter types and formats',
      'Ensure workspace ID and directory IDs exist',
      'Validate proxy configuration format',
    ],
    autoRecoverable: false,
    retryable: false,
  },
  401: {
    code: 401,
    name: 'UNAUTHORIZED',
    description: 'Authentication failed - invalid API key',
    chineseMsg: '认证失败',
    englishMsg: 'Authentication failed',
    category: 'authentication',
    severity: 'high',
    troubleshooting: [
      'Verify ROXY_API_KEY environment variable is set correctly',
      'Check API key in RoxyBrowser: API → API配置 → API Key',
      'Ensure API key has not expired or been regenerated',
      'Confirm API is enabled in RoxyBrowser settings',
    ],
    autoRecoverable: false,
    retryable: false,
  },
  403: {
    code: 403,
    name: 'FORBIDDEN',
    description: 'Access denied - insufficient permissions',
    chineseMsg: '权限不足',
    englishMsg: 'Access denied',
    category: 'authentication',
    severity: 'high',
    troubleshooting: [
      'Check if API key has sufficient permissions',
      'Verify workspace access rights',
      'Ensure browser profiles are not locked by another process',
      'Check RoxyBrowser license and feature availability',
    ],
    autoRecoverable: false,
    retryable: false,
  },
  404: {
    code: 404,
    name: 'NOT_FOUND',
    description: 'Resource not found',
    chineseMsg: '资源不存在',
    englishMsg: 'Resource not found',
    category: 'resource',
    severity: 'medium',
    troubleshooting: [
      'Verify workspace ID exists using roxy_list_workspaces',
      'Check browser directory IDs using roxy_list_browsers',
      'Ensure browser profiles have not been deleted',
      'Confirm project IDs are valid',
    ],
    autoRecoverable: false,
    retryable: false,
  },
  408: {
    code: 408,
    name: 'TIMEOUT',
    description: 'Request timeout',
    chineseMsg: '请求超时',
    englishMsg: 'Request timeout',
    category: 'network',
    severity: 'medium',
    troubleshooting: [
      'Check network connectivity to RoxyBrowser',
      'Increase ROXY_TIMEOUT environment variable',
      'Verify RoxyBrowser is responsive and not overloaded',
      'Reduce batch operation size',
    ],
    autoRecoverable: true,
    retryable: true,
  },
  409: {
    code: 409,
    name: 'CONFLICT',
    description: 'Resource conflict or insufficient profiles quota',
    chineseMsg: '资源冲突或额度不足',
    englishMsg: 'Resource conflict or insufficient profiles quota',
    category: 'browser',
    severity: 'medium',
    troubleshooting: [
      'Check error message: if quota insufficient, purchase more profiles',
      'If profile conflict, close conflicting profile instances',
      'Wait for previous operations to complete',
      'Verify workspace quota in RoxyBrowser settings',
    ],
    autoRecoverable: false,
    retryable: false,
  },
  500: {
    code: 500,
    name: 'SERVER_ERROR',
    description: 'Internal server error',
    chineseMsg: '服务器内部错误',
    englishMsg: 'Internal server error',
    category: 'server',
    severity: 'high',
    troubleshooting: [
      'Check RoxyBrowser application logs',
      'Restart RoxyBrowser application',
      'Verify system resources (CPU, memory, disk space)',
      'Update RoxyBrowser to latest version',
    ],
    autoRecoverable: false,
    retryable: true,
  },
  502: {
    code: 502,
    name: 'BAD_GATEWAY',
    description: 'Bad gateway - proxy or network issue',
    chineseMsg: '网关错误',
    englishMsg: 'Bad gateway',
    category: 'network',
    severity: 'high',
    troubleshooting: [
      'Check proxy configuration',
      'Verify network connectivity',
      'Test proxy connection independently',
      'Try with different proxy or no proxy',
    ],
    autoRecoverable: false,
    retryable: true,
  },
  503: {
    code: 503,
    name: 'SERVICE_UNAVAILABLE',
    description: 'Service temporarily unavailable',
    chineseMsg: '服务不可用',
    englishMsg: 'Service unavailable',
    category: 'server',
    severity: 'high',
    troubleshooting: [
      'Wait and retry after a few seconds',
      'Check if RoxyBrowser is starting up',
      'Verify RoxyBrowser service status',
      'Check system resource availability',
    ],
    autoRecoverable: true,
    retryable: true,
  },
  504: {
    code: 504,
    name: 'GATEWAY_TIMEOUT',
    description: 'Gateway timeout',
    chineseMsg: '网关超时',
    englishMsg: 'Gateway timeout',
    category: 'network',
    severity: 'medium',
    troubleshooting: [
      'Increase request timeout settings',
      'Check network latency to proxy servers',
      'Verify proxy server responsiveness',
      'Consider using faster proxy servers',
    ],
    autoRecoverable: true,
    retryable: true,
  },
};

/** Network error patterns and their solutions */
export const NETWORK_ERROR_PATTERNS: Array<{
  pattern: RegExp;
  category: string;
  description: string;
  troubleshooting: string[];
}> = [
  {
    pattern: /ECONNREFUSED/i,
    category: 'connection_refused',
    description: 'Connection refused - RoxyBrowser API not accessible',
    troubleshooting: [
      'Ensure RoxyBrowser application is running',
      'Check if API port (default 50000) is open',
      'Verify API is enabled in RoxyBrowser settings',
      'Check firewall settings',
    ],
  },
  {
    pattern: /ENOTFOUND|getaddrinfo/i,
    category: 'host_not_found',
    description: 'Host not found - DNS resolution failed',
    troubleshooting: [
      'Check ROXY_API_HOST configuration',
      'Verify hostname spelling',
      'Test DNS resolution',
      'Use IP address instead of hostname',
    ],
  },
  {
    pattern: /ETIMEDOUT/i,
    category: 'connection_timeout',
    description: 'Connection timeout',
    troubleshooting: [
      'Check network connectivity',
      'Increase timeout values',
      'Verify target host is reachable',
      'Check for network congestion',
    ],
  },
  {
    pattern: /ECONNRESET/i,
    category: 'connection_reset',
    description: 'Connection reset by peer',
    troubleshooting: [
      'Check server stability',
      'Verify network equipment',
      'Retry with exponential backoff',
      'Check for rate limiting',
    ],
  },
];

/** Enhanced RoxyBrowser API error */
export class RoxyApiError extends Error {
  public readonly errorInfo?: ErrorInfo;
  public readonly troubleshooting: string[];
  public readonly category: string;
  public readonly severity: string;
  public readonly retryable: boolean;

  constructor(
    message: string,
    public code: number,
    public response?: unknown,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'RoxyApiError';
    
    // Get error information from mapping
    this.errorInfo = ROXY_ERROR_MAP[code];
    this.troubleshooting = this.errorInfo?.troubleshooting || [];
    this.category = this.errorInfo?.category || 'unknown';
    this.severity = this.errorInfo?.severity || 'medium';
    this.retryable = this.errorInfo?.retryable || false;

    // Enhance message with Chinese translation if available
    if (this.errorInfo) {
      const enhancedMessage = `${message} (${this.errorInfo.chineseMsg})`;
      this.message = enhancedMessage;
    }
  }

  /** Get user-friendly error explanation */
  getExplanation(): string {
    if (!this.errorInfo) {
      return `Error ${this.code}: ${this.message}`;
    }

    return `**${this.errorInfo.name}** (${this.code}): ${this.errorInfo.description}\n` +
           `**中文说明**: ${this.errorInfo.chineseMsg}\n` +
           `**分类**: ${this.errorInfo.category}\n` +
           `**严重程度**: ${this.errorInfo.severity}`;
  }

  /** Get troubleshooting steps */
  getTroubleshootingSteps(): string[] {
    const steps = [...this.troubleshooting];
    
    // Add network-specific troubleshooting for network errors
    if (this.originalError) {
      const networkPattern = NETWORK_ERROR_PATTERNS.find(pattern => 
        pattern.pattern.test(this.originalError!.message)
      );
      if (networkPattern) {
        steps.unshift(`**网络错误检测**: ${networkPattern.description}`);
        steps.push(...networkPattern.troubleshooting);
      }
    }

    return steps;
  }

  /** Check if error is retryable */
  isRetryable(): boolean {
    return this.retryable;
  }

  /** Get retry strategy */
  getRetryStrategy(): { shouldRetry: boolean; delayMs: number; maxRetries: number } {
    if (!this.retryable) {
      return { shouldRetry: false, delayMs: 0, maxRetries: 0 };
    }

    // Different retry strategies based on error type
    switch (this.category) {
      case 'network':
        return { shouldRetry: true, delayMs: 2000, maxRetries: 3 };
      case 'server':
        return { shouldRetry: true, delayMs: 5000, maxRetries: 2 };
      case 'browser':
        return { shouldRetry: true, delayMs: 1000, maxRetries: 1 };
      default:
        return { shouldRetry: true, delayMs: 1000, maxRetries: 1 };
    }
  }
}

/** Configuration error */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

/** Browser creation error */
export class BrowserCreationError extends Error {
  constructor(
    message: string,
    public failedConfigs?: Partial<BrowserCreateConfig>[],
    public partialResults?: BrowserCreateResult[]
  ) {
    super(message);
    this.name = 'BrowserCreationError';
  }
}

// ========== Account Types ==========

/** Account item */
export interface AccountItem {
  id: number;                         // Account ID
  platformUrl: string;                // Business platform URL
  platformUserName: string;           // Account username
  platformPassword: string;           // Account password
  platformEfa: string;                // Account EFA
  platformCookies: Array<{            // Account Cookies
    name: string;
    value: string;
    domain: string;
  }>;
  platformName: string;               // Platform name
  platformRemarks: string;            // Platform remarks
  createTime: string;                 // Create time
  updateTime: string;                 // Update time
}

/** Paginated account list response */
export interface AccountListResponse {
  total: number;
  rows: AccountItem[];
}

/** Account list query parameters */
export interface AccountListParams {
  workspaceId: number;
  accountId?: number;
  page_index?: number;
  page_size?: number;
}

// ========== Label Types ==========

/** Label item */
export interface LabelItem {
  id: number;                         // Label ID
  color: string;                      // Label color
  name: string;                       // Label name
}

/** Label list response */
export interface LabelListResponse {
  labels: LabelItem[];
}

// ========== Connection Info Types ==========

/** Connection info item for opened browser */
export interface ConnectionInfoItem {
  ws: string;                         // WebSocket endpoint for automation tools
  http: string;                       // HTTP endpoint for automation tools
  coreVersion: string;                // Core version
  driver: string;                     // WebDriver path for automation tools
  sortNum: number;                    // Window sort number
  windowName: string;                 // Window name
  windowRemark: string;               // Window remark
  pid: number;                        // Process ID
  dirId: string;                      // Browser directory ID
}

/** Connection info response */
export interface ConnectionInfoResponse {
  connections: ConnectionInfoItem[];
}

// ========== Update Browser Types ==========

/** Browser update parameters (same as create but with dirId) */
export interface BrowserUpdateParams extends BrowserCreateConfig {
  dirId: string;                      // Browser directory ID (required for update)
}

// ========== Cache Clear Types ==========

/** Local cache clear parameters */
export interface ClearLocalCacheParams {
  dirIds: string[];                   // Array of browser directory IDs
}

/** Server cache clear parameters */
export interface ClearServerCacheParams {
  workspaceId: number;
  dirIds: string[];                   // Array of browser directory IDs
}

// ========== Random Fingerprint Types ==========

/** Random fingerprint parameters */
export interface RandomFingerprintParams {
  workspaceId: number;
  dirId: string;                      // Browser directory ID
}