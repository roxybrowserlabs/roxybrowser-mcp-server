/**
 * Browser Template Manager
 * 
 * Provides predefined browser templates for common use cases
 */

import {
  BrowserTemplate,
  BrowserTemplateType,
  BrowserCreateConfig,
  ProxyInfo,
  FingerInfo,
} from '../types.js';

export class TemplateManager {
  private static templates: Record<BrowserTemplateType, BrowserTemplate> = {
    gmail: {
      name: 'gmail',
      description: 'Optimized for Gmail and Google services automation',
      defaultConfig: {
        windowName: 'Gmail Browser',
        os: 'Windows',
        osVersion: '11',
        coreVersion: '125',
        searchEngine: 'Google',
        defaultOpenUrl: ['https://gmail.com'],
        fingerInfo: {
          language: 'en-US',
          isLanguageBaseIp: false,
          displayLanguage: 'en-US',
          isDisplayLanguageBaseIp: false,
          openWidth: '1400',
          openHeight: '900',
          syncCookie: true,
          syncPassword: true,
          syncTab: true,
          clearCacheFile: false,
          clearCookie: false,
          randomFingerprint: true,
          forbidSavePassword: false, // Allow password saving for Gmail
          webRTC: 1, // Real WebRTC for Google services
          canvas: true,
          audioContext: true,
          doNotTrack: false, // Don't use DNT for better compatibility
        },
      },
    },

    facebook: {
      name: 'facebook',
      description: 'Optimized for Facebook and Meta platform automation',
      defaultConfig: {
        windowName: 'Facebook Browser',
        os: 'Windows',
        osVersion: '11',
        coreVersion: '125',
        searchEngine: 'Google',
        defaultOpenUrl: ['https://facebook.com'],
        fingerInfo: {
          language: 'en-US',
          isLanguageBaseIp: false,
          displayLanguage: 'en-US',
          isDisplayLanguageBaseIp: false,
          openWidth: '1366',
          openHeight: '768',
          syncCookie: true,
          syncPassword: true,
          syncTab: true,
          clearCacheFile: false,
          clearCookie: false,
          randomFingerprint: true,
          forbidSavePassword: false,
          webRTC: 1, // Real WebRTC for video calls
          canvas: true,
          audioContext: true,
          deviceInfo: true, // Allow media devices
          forbidAudio: false, // Allow audio for Facebook features
          forbidMedia: false, // Allow video for Facebook features
          doNotTrack: false,
        },
      },
    },

    ecommerce: {
      name: 'ecommerce',
      description: 'Optimized for e-commerce platforms and shopping automation',
      defaultConfig: {
        windowName: 'Shopping Browser',
        os: 'Windows',
        osVersion: '11',
        coreVersion: '125',
        searchEngine: 'Google',
        defaultOpenUrl: ['https://amazon.com'],
        fingerInfo: {
          language: 'en-US',
          isLanguageBaseIp: false,
          displayLanguage: 'en-US',
          isDisplayLanguageBaseIp: false,
          openWidth: '1920',
          openHeight: '1080',
          syncCookie: true,
          syncPassword: true,
          syncTab: false, // Don't sync tabs for privacy
          clearCacheFile: true, // Clear cache for fresh sessions
          clearCookie: false,
          randomFingerprint: true,
          forbidSavePassword: true, // Security for shopping
          webRTC: 2, // Disable WebRTC for privacy
          canvas: true,
          audioContext: true,
          deviceInfo: false, // Limit device fingerprinting
          doNotTrack: true, // Enable DNT for privacy
          portScanProtect: true, // Extra security
        },
      },
    },

    social_media: {
      name: 'social_media',
      description: 'General social media platforms automation',
      defaultConfig: {
        windowName: 'Social Media Browser',
        os: 'Windows',
        osVersion: '11',
        coreVersion: '125',
        searchEngine: 'Google',
        defaultOpenUrl: ['https://twitter.com'],
        fingerInfo: {
          language: 'en-US',
          isLanguageBaseIp: true, // Follow IP for better geo-targeting
          displayLanguage: 'en-US',
          isDisplayLanguageBaseIp: true,
          isTimeZone: true, // Follow IP timezone
          openWidth: '1200',
          openHeight: '800',
          syncCookie: true,
          syncPassword: false, // Don't save passwords
          syncTab: true,
          clearCacheFile: false,
          clearCookie: false,
          randomFingerprint: true,
          forbidSavePassword: true,
          webRTC: 0, // Replace WebRTC
          canvas: true,
          audioContext: true,
          deviceInfo: true,
          forbidAudio: false,
          forbidMedia: false,
          doNotTrack: false,
        },
      },
    },

    general: {
      name: 'general',
      description: 'General-purpose browser configuration',
      defaultConfig: {
        windowName: 'General Browser',
        os: 'Windows',
        osVersion: '11',
        coreVersion: '125',
        searchEngine: 'Google',
        fingerInfo: {
          language: 'en-US',
          isLanguageBaseIp: true,
          displayLanguage: 'en-US',
          isDisplayLanguageBaseIp: true,
          isTimeZone: true,
          openWidth: '1024',
          openHeight: '768',
          syncCookie: true,
          syncPassword: true,
          syncTab: true,
          clearCacheFile: false,
          clearCookie: false,
          randomFingerprint: false, // Keep consistent fingerprint
          forbidSavePassword: true,
          webRTC: 2, // Disable for privacy
          canvas: true,
          audioContext: true,
          deviceInfo: true,
          doNotTrack: true,
        },
      },
    },

    custom: {
      name: 'custom',
      description: 'Empty template for custom configuration',
      defaultConfig: {
        windowName: 'Custom Browser',
        os: 'Windows',
        osVersion: '11',
        coreVersion: '125',
      },
    },
  };

  /**
   * Get available template names and descriptions
   */
  static getAvailableTemplates(): Array<{ name: BrowserTemplateType; description: string }> {
    return Object.values(this.templates).map(template => ({
      name: template.name,
      description: template.description,
    }));
  }

  /**
   * Get template configuration by name
   */
  static getTemplate(templateName: BrowserTemplateType): BrowserTemplate | null {
    return this.templates[templateName] || null;
  }

  /**
   * Get template configuration merged with custom overrides
   */
  static getTemplateConfig(
    templateName: BrowserTemplateType,
    customConfig?: Partial<BrowserCreateConfig>
  ): Partial<BrowserCreateConfig> {
    const template = this.getTemplate(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    if (!customConfig) {
      return template.defaultConfig;
    }

    // Deep merge template config with custom config
    const mergedConfig = { ...template.defaultConfig, ...customConfig };

    // Special handling for nested objects
    if (template.defaultConfig.fingerInfo && customConfig.fingerInfo) {
      mergedConfig.fingerInfo = {
        ...template.defaultConfig.fingerInfo,
        ...customConfig.fingerInfo,
      };
    }

    if (template.defaultConfig.proxyInfo && customConfig.proxyInfo) {
      mergedConfig.proxyInfo = {
        ...template.defaultConfig.proxyInfo,
        ...customConfig.proxyInfo,
      };
    }

    if (template.defaultConfig.windowPlatformList && customConfig.windowPlatformList) {
      mergedConfig.windowPlatformList = [
        ...(template.defaultConfig.windowPlatformList || []),
        ...(customConfig.windowPlatformList || []),
      ];
    }

    return mergedConfig;
  }

  /**
   * Create a custom template
   */
  static createCustomTemplate(
    name: string,
    description: string,
    config: Partial<BrowserCreateConfig>
  ): BrowserTemplate {
    return {
      name: 'custom',
      description,
      defaultConfig: config,
    };
  }

  /**
   * Get template optimized for specific proxy configuration
   */
  static getTemplateForProxy(
    templateName: BrowserTemplateType,
    proxyInfo: ProxyInfo
  ): Partial<BrowserCreateConfig> {
    const baseConfig = this.getTemplateConfig(templateName);
    
    // Apply proxy-specific optimizations
    const optimizedConfig = { ...baseConfig };
    
    // If using proxy, adjust some settings for better anonymity
    if (proxyInfo.proxyCategory !== 'noproxy') {
      optimizedConfig.fingerInfo = {
        ...optimizedConfig.fingerInfo,
        isLanguageBaseIp: true, // Follow proxy IP for language
        isDisplayLanguageBaseIp: true,
        isTimeZone: true, // Follow proxy timezone
        isPositionBaseIp: true, // Follow proxy geolocation
        webRTC: 2, // Disable WebRTC to prevent IP leaks
        doNotTrack: true, // Enable DNT for privacy
      };
    }

    optimizedConfig.proxyInfo = proxyInfo;
    return optimizedConfig;
  }

  /**
   * Get template optimized for specific country/region
   */
  static getTemplateForRegion(
    templateName: BrowserTemplateType,
    countryCode: string,
    language?: string
  ): Partial<BrowserCreateConfig> {
    const baseConfig = this.getTemplateConfig(templateName);
    const optimizedConfig = { ...baseConfig };

    // Regional optimizations
    const regionalSettings = this.getRegionalSettings(countryCode);
    
    optimizedConfig.fingerInfo = {
      ...optimizedConfig.fingerInfo,
      isLanguageBaseIp: false,
      language: language || regionalSettings.language,
      isDisplayLanguageBaseIp: false,
      displayLanguage: language || regionalSettings.language,
      isTimeZone: false,
      timeZone: regionalSettings.timeZone,
    };

    return optimizedConfig;
  }

  /**
   * Get regional settings by country code
   */
  private static getRegionalSettings(countryCode: string): {
    language: string;
    timeZone: string;
  } {
    const regionalMap: Record<string, { language: string; timeZone: string }> = {
      US: { language: 'en-US', timeZone: 'GMT-5:00 America/New_York' },
      CN: { language: 'zh-CN', timeZone: 'GMT+8:00 Asia/Shanghai' },
      JP: { language: 'ja-JP', timeZone: 'GMT+9:00 Asia/Tokyo' },
      KR: { language: 'ko-KR', timeZone: 'GMT+9:00 Asia/Seoul' },
      DE: { language: 'de-DE', timeZone: 'GMT+1:00 Europe/Berlin' },
      FR: { language: 'fr-FR', timeZone: 'GMT+1:00 Europe/Paris' },
      GB: { language: 'en-GB', timeZone: 'GMT+0:00 Europe/London' },
      RU: { language: 'ru-RU', timeZone: 'GMT+3:00 Europe/Moscow' },
      BR: { language: 'pt-BR', timeZone: 'GMT-3:00 America/Sao_Paulo' },
      IN: { language: 'hi-IN', timeZone: 'GMT+5:30 Asia/Kolkata' },
      // Add more regions as needed
    };

    return regionalMap[countryCode.toUpperCase()] || regionalMap.US;
  }

  /**
   * Validate template configuration
   */
  static validateTemplate(template: BrowserTemplate): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.name) {
      errors.push('Template name is required');
    }

    if (!template.description) {
      errors.push('Template description is required');
    }

    if (!template.defaultConfig) {
      errors.push('Template default configuration is required');
    }

    // Additional validation can be added here

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}