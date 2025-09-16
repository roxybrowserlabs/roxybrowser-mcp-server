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

/** Browser template types */
export type BrowserTemplateType = 'gmail' | 'facebook' | 'ecommerce' | 'social_media' | 'general' | 'custom';

/** Browser template configuration */
export interface BrowserTemplate {
  name: BrowserTemplateType;
  description: string;
  defaultConfig: Partial<BrowserCreateConfig>;
}

/** Template-based browser creation parameters */
export interface BrowserCreateTemplateParams {
  workspaceId: number;                  // Required: Workspace ID
  templateName: BrowserTemplateType;    // Template to use
  count?: number;                       // Number of browsers to create (default: 1)
  proxyList?: ProxyInfo[];              // List of proxies to assign
  customConfig?: Partial<BrowserCreateConfig>; // Override template config
  namePrefix?: string;                  // Prefix for browser names
  projectId?: number;                   // Project ID
}

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

/** Template browser creation tool response */
export interface BrowserCreateTemplateResponse {
  browsers: BrowserCreateResult[];
  template: BrowserTemplateType;
  successCount: number;
  failureCount: number;
  total: number;
  message: string;
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