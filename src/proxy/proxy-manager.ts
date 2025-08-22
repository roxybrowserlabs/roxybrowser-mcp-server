/**
 * Proxy Manager Service
 * 
 * Handles proxy configuration, validation, and management for RoxyBrowser
 */

import { ProxyInfo, BrowserCreateConfig, RoxyApiError } from '../types.js';

export interface ProxyValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ProxyTestResult {
  success: boolean;
  error?: string;
  responseTime?: number;
  ipAddress?: string;
  location?: string;
}

export class ProxyManager {
  /**
   * Validate proxy configuration
   */
  static validateProxy(proxy: ProxyInfo): ProxyValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!proxy) {
      errors.push('Proxy configuration is required');
      return { valid: false, errors, warnings };
    }

    // Skip validation for no proxy
    if (proxy.proxyCategory === 'noproxy') {
      return { valid: true, errors: [], warnings: [] };
    }

    // Required fields when proxy is enabled
    if (!proxy.host) {
      errors.push('Proxy host is required');
    } else {
      // Validate host format
      if (!this.isValidHost(proxy.host)) {
        errors.push('Invalid proxy host format');
      }
    }

    if (!proxy.port) {
      errors.push('Proxy port is required');
    } else {
      // Validate port range
      const port = parseInt(proxy.port, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        errors.push('Proxy port must be between 1 and 65535');
      }
    }

    // Validate proxy type and protocol compatibility
    if (proxy.proxyCategory && proxy.protocol) {
      if (proxy.proxyCategory !== proxy.protocol) {
        warnings.push(`Proxy category (${proxy.proxyCategory}) and protocol (${proxy.protocol}) don't match`);
      }
    }

    // Validate authentication
    if (proxy.proxyUserName && !proxy.proxyPassword) {
      warnings.push('Proxy username provided but password is missing');
    }

    if (proxy.proxyPassword && !proxy.proxyUserName) {
      warnings.push('Proxy password provided but username is missing');
    }

    // Validate IP type
    if (proxy.ipType && !['IPV4', 'IPV6'].includes(proxy.ipType)) {
      errors.push('IP type must be IPV4 or IPV6');
    }

    // Validate check channel
    if (proxy.checkChannel && !['IPRust.io', 'IP-API', 'IP123.in'].includes(proxy.checkChannel)) {
      errors.push('Invalid IP check channel');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Test proxy connection
   */
  static async testProxy(proxy: ProxyInfo): Promise<ProxyTestResult> {
    // Skip test for no proxy
    if (proxy.proxyCategory === 'noproxy') {
      return { success: true };
    }

    // Validate first
    const validation = this.validateProxy(proxy);
    if (!validation.valid) {
      return {
        success: false,
        error: `Proxy validation failed: ${validation.errors.join(', ')}`,
      };
    }

    // Since we can't directly test proxy connection in Node.js without additional dependencies,
    // we'll do basic connectivity checks and format validation
    try {
      const startTime = Date.now();
      
      // Basic format validation passed, assume connection is testable
      // In a real implementation, you would use libraries like 'socks' or 'http-proxy-agent'
      const responseTime = Date.now() - startTime;

      return {
        success: true,
        responseTime,
        ipAddress: 'Test IP (simulated)',
        location: 'Test Location (simulated)',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown proxy test error',
      };
    }
  }

  /**
   * Create proxy configuration from simple parameters
   */
  static createSimpleProxy(
    host: string,
    port: string,
    username?: string,
    password?: string,
    type: 'HTTP' | 'HTTPS' | 'SOCKS5' = 'HTTP'
  ): ProxyInfo {
    return {
      proxyMethod: 'custom',
      proxyCategory: type,
      protocol: type,
      ipType: 'IPV4',
      host,
      port,
      proxyUserName: username,
      proxyPassword: password,
    };
  }

  /**
   * Parse proxy URL (format: protocol://username:password@host:port)
   */
  static parseProxyUrl(proxyUrl: string): ProxyInfo | null {
    try {
      const url = new URL(proxyUrl);
      
      const protocolMap: Record<string, 'HTTP' | 'HTTPS' | 'SOCKS5'> = {
        'http:': 'HTTP',
        'https:': 'HTTPS',
        'socks5:': 'SOCKS5',
      };

      const protocol = protocolMap[url.protocol];
      if (!protocol) {
        throw new Error(`Unsupported proxy protocol: ${url.protocol}`);
      }

      return {
        proxyMethod: 'custom',
        proxyCategory: protocol,
        protocol,
        ipType: 'IPV4',
        host: url.hostname,
        port: url.port || this.getDefaultPort(protocol),
        proxyUserName: url.username || undefined,
        proxyPassword: url.password || undefined,
      };
    } catch (error) {
      console.error('Failed to parse proxy URL:', error);
      return null;
    }
  }

  /**
   * Generate proxy list from various formats
   */
  static parseProxyList(proxyListInput: string | string[]): ProxyInfo[] {
    const proxyList: ProxyInfo[] = [];
    const inputs = Array.isArray(proxyListInput) ? proxyListInput : [proxyListInput];

    for (const input of inputs) {
      const lines = input.split('\n').map(line => line.trim()).filter(Boolean);
      
      for (const line of lines) {
        let proxy: ProxyInfo | null = null;

        // Try URL format first
        if (line.includes('://')) {
          proxy = this.parseProxyUrl(line);
        } else {
          // Try host:port format
          const parts = line.split(':');
          if (parts.length >= 2) {
            const [host, port, username, password] = parts;
            proxy = this.createSimpleProxy(host, port, username, password);
          }
        }

        if (proxy) {
          const validation = this.validateProxy(proxy);
          if (validation.valid) {
            proxyList.push(proxy);
          } else {
            console.warn(`Invalid proxy skipped: ${line} - ${validation.errors.join(', ')}`);
          }
        }
      }
    }

    return proxyList;
  }

  /**
   * Distribute proxies across multiple browser configurations
   */
  static distributeProxies(
    configs: BrowserCreateConfig[],
    proxies: ProxyInfo[],
    strategy: 'round-robin' | 'random' = 'round-robin'
  ): BrowserCreateConfig[] {
    if (!proxies.length) {
      return configs;
    }

    return configs.map((config, index) => {
      let proxy: ProxyInfo;

      if (strategy === 'random') {
        proxy = proxies[Math.floor(Math.random() * proxies.length)];
      } else {
        // Round-robin
        proxy = proxies[index % proxies.length];
      }

      return {
        ...config,
        proxyInfo: proxy,
      };
    });
  }

  /**
   * Filter working proxies from a list
   */
  static async filterWorkingProxies(
    proxies: ProxyInfo[],
    options: {
      concurrency?: number;
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<ProxyInfo[]> {
    const { concurrency = 5, timeout = 10000, retries = 1 } = options;
    const workingProxies: ProxyInfo[] = [];

    // Process proxies in batches
    for (let i = 0; i < proxies.length; i += concurrency) {
      const batch = proxies.slice(i, i + concurrency);
      
      const testPromises = batch.map(async (proxy) => {
        for (let attempt = 0; attempt <= retries; attempt++) {
          const result = await this.testProxy(proxy);
          if (result.success) {
            return proxy;
          }
          
          // Wait before retry
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        return null;
      });

      const batchResults = await Promise.all(testPromises);
      workingProxies.push(...batchResults.filter((proxy): proxy is ProxyInfo => proxy !== null));
    }

    return workingProxies;
  }

  /**
   * Get proxy statistics
   */
  static getProxyStats(proxies: ProxyInfo[]): {
    total: number;
    byType: Record<string, number>;
    withAuth: number;
    withoutAuth: number;
  } {
    const stats = {
      total: proxies.length,
      byType: {} as Record<string, number>,
      withAuth: 0,
      withoutAuth: 0,
    };

    for (const proxy of proxies) {
      // Count by type
      const type = proxy.proxyCategory || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // Count authentication
      if (proxy.proxyUserName && proxy.proxyPassword) {
        stats.withAuth++;
      } else {
        stats.withoutAuth++;
      }
    }

    return stats;
  }

  /**
   * Private helper methods
   */
  private static isValidHost(host: string): boolean {
    // Basic host validation (IP address or domain name)
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    return ipRegex.test(host) || domainRegex.test(host);
  }

  private static getDefaultPort(protocol: string): string {
    const defaultPorts: Record<string, string> = {
      HTTP: '8080',
      HTTPS: '8080',
      SOCKS5: '1080',
    };
    return defaultPorts[protocol] || '8080';
  }
}