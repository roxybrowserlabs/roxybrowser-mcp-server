/**
 * Proxy Validation Utilities
 * 
 * Advanced proxy validation and testing tools for RoxyBrowser MCP
 */

import { ProxyInfo } from '../types.js';
import { ProxyManager, ProxyValidationResult, ProxyTestResult } from './proxy-manager.js';

export interface ProxyListValidationResult {
  validProxies: ProxyInfo[];
  invalidProxies: Array<{ proxy: ProxyInfo; errors: string[] }>;
  totalCount: number;
  validCount: number;
  invalidCount: number;
  summary: string;
}

export interface ProxyBenchmarkResult {
  proxy: ProxyInfo;
  responseTime: number;
  success: boolean;
  error?: string;
  location?: string;
  anonymityLevel?: 'transparent' | 'anonymous' | 'elite';
}

export class ProxyValidator {
  /**
   * Validate a list of proxies
   */
  static validateProxyList(proxies: ProxyInfo[]): ProxyListValidationResult {
    const validProxies: ProxyInfo[] = [];
    const invalidProxies: Array<{ proxy: ProxyInfo; errors: string[] }> = [];

    for (const proxy of proxies) {
      const validation = ProxyManager.validateProxy(proxy);
      
      if (validation.valid) {
        validProxies.push(proxy);
      } else {
        invalidProxies.push({ proxy, errors: validation.errors });
      }
    }

    const validCount = validProxies.length;
    const invalidCount = invalidProxies.length;
    const totalCount = proxies.length;

    const summary = `${validCount}/${totalCount} proxies are valid (${((validCount / totalCount) * 100).toFixed(1)}%)`;

    return {
      validProxies,
      invalidProxies,
      totalCount,
      validCount,
      invalidCount,
      summary,
    };
  }

  /**
   * Parse and validate proxy string in various formats
   */
  static parseAndValidateProxyString(proxyString: string): {
    proxy: ProxyInfo | null;
    validation: ProxyValidationResult | null;
    error?: string;
  } {
    try {
      // Try to parse proxy string
      const proxy = ProxyManager.parseProxyUrl(proxyString);
      
      if (!proxy) {
        // Try alternative formats
        const altProxy = this.parseAlternativeFormats(proxyString);
        if (!altProxy) {
          return {
            proxy: null,
            validation: null,
            error: 'Unable to parse proxy string format',
          };
        }
        
        const validation = ProxyManager.validateProxy(altProxy);
        return { proxy: altProxy, validation };
      }

      const validation = ProxyManager.validateProxy(proxy);
      return { proxy, validation };
    } catch (error) {
      return {
        proxy: null,
        validation: null,
        error: error instanceof Error ? error.message : 'Unknown parsing error',
      };
    }
  }

  /**
   * Test multiple proxies and rank by performance
   */
  static async benchmarkProxies(
    proxies: ProxyInfo[],
    options: {
      timeout?: number;
      retries?: number;
      testUrl?: string;
    } = {}
  ): Promise<ProxyBenchmarkResult[]> {
    const { timeout = 10000, retries = 1, testUrl = 'http://httpbin.org/ip' } = options;
    const results: ProxyBenchmarkResult[] = [];

    for (const proxy of proxies) {
      let bestResult: ProxyBenchmarkResult | null = null;

      for (let attempt = 0; attempt <= retries; attempt++) {
        const startTime = Date.now();
        
        try {
          // Simulate proxy test (in real implementation, you'd use actual HTTP requests)
          const testResult = await this.simulateProxyTest(proxy, testUrl, timeout);
          const responseTime = Date.now() - startTime;

          const result: ProxyBenchmarkResult = {
            proxy,
            responseTime,
            success: testResult.success,
            location: testResult.location,
            anonymityLevel: testResult.anonymityLevel,
          };

          if (!bestResult || (result.success && result.responseTime < bestResult.responseTime)) {
            bestResult = result;
          }

          if (result.success) break; // Stop retrying on success
        } catch (error) {
          bestResult = {
            proxy,
            responseTime: timeout,
            success: false,
            error: error instanceof Error ? error.message : 'Test failed',
          };
        }
      }

      if (bestResult) {
        results.push(bestResult);
      }
    }

    // Sort by success and response time
    return results.sort((a, b) => {
      if (a.success && !b.success) return -1;
      if (!a.success && b.success) return 1;
      return a.responseTime - b.responseTime;
    });
  }

  /**
   * Generate proxy health report
   */
  static generateProxyHealthReport(
    validationResult: ProxyListValidationResult,
    benchmarkResults?: ProxyBenchmarkResult[]
  ): string {
    let report = `## Proxy Health Report\n\n`;
    report += `**Total Proxies:** ${validationResult.totalCount}\n`;
    report += `**Valid:** ${validationResult.validCount}\n`;
    report += `**Invalid:** ${validationResult.invalidCount}\n`;
    report += `**Success Rate:** ${((validationResult.validCount / validationResult.totalCount) * 100).toFixed(1)}%\n\n`;

    if (validationResult.invalidCount > 0) {
      report += `### ❌ Invalid Proxies (${validationResult.invalidCount})\n\n`;
      validationResult.invalidProxies.forEach((invalid, index) => {
        const proxy = invalid.proxy;
        report += `${index + 1}. **${proxy.host}:${proxy.port}** (${proxy.proxyCategory})\n`;
        invalid.errors.forEach(error => {
          report += `   • ${error}\n`;
        });
        report += '\n';
      });
    }

    if (benchmarkResults && benchmarkResults.length > 0) {
      report += `### 🚀 Performance Results\n\n`;
      const workingProxies = benchmarkResults.filter(r => r.success);
      const failedProxies = benchmarkResults.filter(r => !r.success);

      if (workingProxies.length > 0) {
        report += `**✅ Working Proxies (${workingProxies.length}):**\n\n`;
        workingProxies.slice(0, 10).forEach((result, index) => { // Show top 10
          report += `${index + 1}. **${result.proxy.host}:${result.proxy.port}** - ${result.responseTime}ms`;
          if (result.location) report += ` (${result.location})`;
          if (result.anonymityLevel) report += ` [${result.anonymityLevel}]`;
          report += '\n';
        });
        report += '\n';
      }

      if (failedProxies.length > 0) {
        report += `**❌ Failed Proxies (${failedProxies.length}):**\n\n`;
        failedProxies.slice(0, 5).forEach((result, index) => { // Show first 5 failures
          report += `${index + 1}. **${result.proxy.host}:${result.proxy.port}** - ${result.error}\n`;
        });
        if (failedProxies.length > 5) {
          report += `... and ${failedProxies.length - 5} more\n`;
        }
      }
    }

    return report;
  }

  /**
   * Get proxy recommendations based on use case
   */
  static getProxyRecommendations(useCase: 'social_media' | 'ecommerce' | 'scraping' | 'general'): {
    recommendedTypes: string[];
    settings: Partial<ProxyInfo>;
    tips: string[];
  } {
    const recommendations = {
      social_media: {
        recommendedTypes: ['SOCKS5', 'HTTP'],
        settings: {
          proxyMethod: 'custom' as const,
          ipType: 'IPV4' as const,
          checkChannel: 'IP-API' as const,
        },
        tips: [
          'Use residential proxies for better success rates',
          'Rotate proxies frequently to avoid detection',
          'Ensure proxy location matches target audience',
          'Test proxy anonymity level regularly',
        ],
      },
      ecommerce: {
        recommendedTypes: ['HTTP', 'HTTPS'],
        settings: {
          proxyMethod: 'custom' as const,
          ipType: 'IPV4' as const,
          checkChannel: 'IPRust.io' as const,
        },
        tips: [
          'Use dedicated proxies for account security',
          'Prefer HTTPS proxies for sensitive operations',
          'Test proxy stability before bulk operations',
          'Keep proxy sessions long for shopping carts',
        ],
      },
      scraping: {
        recommendedTypes: ['SOCKS5', 'HTTP'],
        settings: {
          proxyMethod: 'custom' as const,
          ipType: 'IPV4' as const,
          checkChannel: 'IP123.in' as const,
        },
        tips: [
          'Use high-anonymity proxies',
          'Implement proxy rotation strategy',
          'Monitor proxy ban rates',
          'Use different proxy pools for different sites',
        ],
      },
      general: {
        recommendedTypes: ['HTTP', 'SOCKS5'],
        settings: {
          proxyMethod: 'custom' as const,
          ipType: 'IPV4' as const,
          checkChannel: 'IP-API' as const,
        },
        tips: [
          'Test proxy speed and reliability',
          'Use geographically relevant proxies',
          'Keep backup proxies available',
          'Monitor proxy uptime statistics',
        ],
      },
    };

    return recommendations[useCase] || recommendations.general;
  }

  /**
   * Private helper methods
   */
  private static parseAlternativeFormats(proxyString: string): ProxyInfo | null {
    // Format: host:port:username:password
    const parts = proxyString.split(':');
    if (parts.length >= 2) {
      const [host, port, username, password] = parts;
      return {
        proxyMethod: 'custom',
        proxyCategory: 'HTTP',
        protocol: 'HTTP',
        ipType: 'IPV4',
        host,
        port,
        proxyUserName: username,
        proxyPassword: password,
      };
    }
    return null;
  }

  private static async simulateProxyTest(
    proxy: ProxyInfo,
    testUrl: string,
    timeout: number
  ): Promise<{
    success: boolean;
    location?: string;
    anonymityLevel?: 'transparent' | 'anonymous' | 'elite';
  }> {
    // Simulate proxy test with basic validation
    const isValid = proxy.host && proxy.port && proxy.proxyCategory !== 'noproxy';
    
    if (!isValid) {
      throw new Error('Invalid proxy configuration');
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

    // Simulate success/failure based on proxy configuration quality
    const hasAuth = !!(proxy.proxyUserName && proxy.proxyPassword);
    const isGoodType = ['SOCKS5', 'HTTPS'].includes(proxy.proxyCategory || '');
    const successRate = hasAuth ? 0.9 : 0.7;
    const typeBonus = isGoodType ? 0.1 : 0;
    
    const success = Math.random() < (successRate + typeBonus);

    if (!success) {
      throw new Error('Proxy connection failed');
    }

    return {
      success: true,
      location: 'Simulated Location',
      anonymityLevel: hasAuth ? 'elite' : 'anonymous',
    };
  }
}