/**
 * Browser Creator Service
 * 
 * Handles browser creation with different complexity levels and configuration building
 */

import {
  BrowserCreateConfig,
  BrowserCreateSimpleParams,
  BrowserCreateStandardParams,
  BrowserCreateAdvancedParams,
  BrowserCreateResult,
  BrowserCreateBatchResult,
  ProxyInfo,
  FingerInfo,
  WindowPlatformInfo,
  BrowserOS,
  CoreVersion,
  LATEST_CORE_VERSION,
  BrowserCreationError,
} from '../types.js';

export class BrowserCreator {
  /**
   * Convert simple parameters to full browser configuration
   */
  static buildSimpleConfig(params: BrowserCreateSimpleParams): BrowserCreateConfig {
    const config: BrowserCreateConfig = {
      workspaceId: params.workspaceId,
    };

    // Add optional basic fields
    if (params.windowName) config.windowName = params.windowName;
    if (params.projectId) config.projectId = params.projectId;
    if (params.windowRemark) config.windowRemark = params.windowRemark;

    // Convert simple proxy parameters to ProxyInfo
    if (params.proxyHost || params.proxyPort) {
      config.proxyInfo = {
        proxyMethod: 'custom',
        proxyCategory: params.proxyType || 'HTTP',
        protocol: params.proxyType || 'HTTP',
        host: params.proxyHost,
        port: params.proxyPort,
        proxyUserName: params.proxyUserName,
        proxyPassword: params.proxyPassword,
        ipType: 'IPV4',
      };
    }

    return config;
  }

  /**
   * Convert standard parameters to full browser configuration
   */
  static buildStandardConfig(params: BrowserCreateStandardParams): BrowserCreateConfig {
    const config: BrowserCreateConfig = {
      workspaceId: params.workspaceId,
    };

    // Add all standard fields
    if (params.windowName) config.windowName = params.windowName;
    if (params.projectId) config.projectId = params.projectId;
    if (params.windowRemark) config.windowRemark = params.windowRemark;
    if (params.os) config.os = params.os;
    if (params.osVersion) config.osVersion = params.osVersion;
    if (params.coreVersion) config.coreVersion = params.coreVersion;
    if (params.defaultOpenUrl) config.defaultOpenUrl = params.defaultOpenUrl;

    // Add proxy configuration
    if (params.proxyInfo) {
      config.proxyInfo = params.proxyInfo;
    }

    // Build fingerprint configuration for common settings
    if (params.openWidth || params.openHeight || params.language || params.timeZone) {
      config.fingerInfo = {};
      
      if (params.openWidth) config.fingerInfo.openWidth = params.openWidth;
      if (params.openHeight) config.fingerInfo.openHeight = params.openHeight;
      if (params.language) {
        config.fingerInfo.isLanguageBaseIp = false;
        config.fingerInfo.language = params.language;
      }
      if (params.timeZone) {
        config.fingerInfo.isTimeZone = false;
        config.fingerInfo.timeZone = params.timeZone;
      }
    }

    return config;
  }

  /**
   * Advanced configuration - pass through as-is
   */
  static buildAdvancedConfig(params: BrowserCreateAdvancedParams): BrowserCreateConfig {
    return params;
  }

  /**
   * Generate unique browser name
   */
  static generateBrowserName(prefix?: string, index?: number): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    
    if (prefix && index !== undefined) {
      return `${prefix}-${index + 1}-${timestamp}`;
    } else if (prefix) {
      return `${prefix}-${timestamp}-${randomSuffix}`;
    } else {
      return `Browser-${timestamp}-${randomSuffix}`;
    }
  }

  /**
   * Assign proxies from a list to multiple browser configurations
   */
  static assignProxiesToConfigs(
    configs: BrowserCreateConfig[],
    proxyList: ProxyInfo[]
  ): BrowserCreateConfig[] {
    if (!proxyList.length) {
      return configs;
    }

    return configs.map((config, index) => ({
      ...config,
      proxyInfo: proxyList[index % proxyList.length], // Round-robin proxy assignment
    }));
  }

  /**
   * Validate browser configuration
   */
  static validateConfig(config: BrowserCreateConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!config.workspaceId) {
      errors.push('workspaceId is required');
    }

    // Proxy validation
    if (config.proxyInfo) {
      const proxy = config.proxyInfo;
      if (proxy.proxyCategory !== 'noproxy') {
        if (!proxy.host) errors.push('Proxy host is required when proxy is enabled');
        if (!proxy.port) errors.push('Proxy port is required when proxy is enabled');
      }
    }

    // OS version compatibility
    if (config.os && config.osVersion) {
      const validVersions = this.getValidOSVersions(config.os);
      if (validVersions && !validVersions.includes(config.osVersion)) {
        errors.push(`Invalid OS version '${config.osVersion}' for OS '${config.os}'`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get valid OS versions for a given operating system
   */
  private static getValidOSVersions(os: BrowserOS): string[] | null {
    const osVersionMap: Record<BrowserOS, string[]> = {
      Windows: ['11', '10', '8', '7'],
      macOS: [
        '15.3.2', '15.3.1', '15.3', '15.2', '15.1', '15.0.1', '15.0',
        '14.7.4', '14.7.3', '14.7.2', '14.7.1', '14.7', '14.6.1', '14.6',
        '14.5', '14.4.1', '14.4', '14.3.1', '14.3', '14.2.1', '14.2', '14.1',
        '13.7.4', '13.7.3', '13.7.2', '13.7.1', '13.7'
      ],
      Android: ['14', '13', '12', '11', '10', '9'],
      IOS: [
        '18.2', '18.1', '18.0', '17.0', '16.6', '16.5', '16.4', '16.3', '16.2',
        '16.1', '16.0', '15.7', '15.6', '15.5', '15.4', '15.3', '15.2', '15.1',
        '15.0', '14.7', '14.6', '14.5', '14.4', '14.3', '14.2', '14.1', '14.0'
      ],
      Linux: [], // Linux versions are more flexible, skip validation
    };

    return osVersionMap[os] || null;
  }

  /**
   * Apply smart defaults to configuration
   */
  static applyDefaults(config: BrowserCreateConfig): BrowserCreateConfig {
    const defaultConfig: Partial<BrowserCreateConfig> = {
      os: 'Windows',
      osVersion: '11',
      coreVersion: LATEST_CORE_VERSION,
      searchEngine: 'Google',
      
      // Default fingerprint settings
      fingerInfo: {
        isLanguageBaseIp: true,
        isDisplayLanguageBaseIp: true,
        isTimeZone: true,
        position: 1,
        isPositionBaseIp: true,
        forbidAudio: true,
        forbidImage: true,
        forbidMedia: true,
        openWidth: '1000',
        openHeight: '1000',
        openBookmarks: false,
        positionSwitch: true,
        isDisplayName: false,
        syncBookmark: false,
        syncHistory: false,
        syncTab: true,
        syncCookie: true,
        syncExtensions: false,
        syncPassword: true,
        syncIndexedDb: false,
        syncLocalStorage: false,
        clearCacheFile: false,
        clearCookie: false,
        clearLocalStorage: false,
        randomFingerprint: false,
        forbidSavePassword: true,
        stopOpenNet: false,
        stopOpenIP: false,
        stopOpenPosition: false,
        openWorkbench: 1,
        resolutionType: false,
        fontType: false,
        webRTC: 2,
        webGL: true,
        webGLInfo: true,
        webGpu: 'webgl',
        canvas: true,
        audioContext: true,
        speechVoices: true,
        doNotTrack: true,
        clientRects: true,
        deviceInfo: true,
        deviceNameSwitch: true,
        macInfo: true,
        disableSsl: false,
        portScanProtect: true,
        useGpu: true,
        sandboxPermission: false,
      },

      // Default proxy settings
      proxyInfo: {
        proxyMethod: 'custom',
        proxyCategory: 'noproxy',
        ipType: 'IPV4',
      },
    };

    // Deep merge configuration with defaults
    const result = { ...defaultConfig, ...config };
    
    // Merge fingerInfo and proxyInfo specifically
    if (defaultConfig.fingerInfo && config.fingerInfo) {
      result.fingerInfo = { ...defaultConfig.fingerInfo, ...config.fingerInfo };
    }
    
    if (defaultConfig.proxyInfo && config.proxyInfo) {
      result.proxyInfo = { ...defaultConfig.proxyInfo, ...config.proxyInfo };
    }

    return result;
  }

  /**
   * Batch validate multiple configurations
   */
  static validateConfigs(configs: BrowserCreateConfig[]): {
    valid: boolean;
    errors: Array<{ index: number; errors: string[] }>;
  } {
    const allErrors: Array<{ index: number; errors: string[] }> = [];

    configs.forEach((config, index) => {
      const validation = this.validateConfig(config);
      if (!validation.valid) {
        allErrors.push({ index, errors: validation.errors });
      }
    });

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
    };
  }
}