/**
 * Error Analysis Utility
 *
 * Provides intelligent error analysis, categorization, and troubleshooting guidance
 */

import {
  BrowserCreationError,
  ConfigError,
  NETWORK_ERROR_PATTERNS,
  ROXY_ERROR_MAP,
  RoxyApiError,
} from '../types.js'

export interface ErrorAnalysisResult {
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  chineseDescription: string
  troubleshooting: string[]
  retryable: boolean
  retryStrategy?: {
    shouldRetry: boolean
    delayMs: number
    maxRetries: number
  }
  suggestedActions: string[]
  relatedErrors?: string[]
}

export interface BatchErrorAnalysis {
  totalErrors: number
  errorsByCategory: Record<string, number>
  errorsBySeverity: Record<string, number>
  commonPatterns: Array<{
    pattern: string
    count: number
    affectedItems: string[]
  }>
  recommendations: string[]
  retryableCount: number
  criticalCount: number
}

export class ErrorAnalyzer {
  /**
   * Analyze a single error and provide detailed insights
   */
  static analyzeError(error: Error): ErrorAnalysisResult {
    if (error instanceof RoxyApiError) {
      return this.analyzeRoxyApiError(error)
    }

    if (error instanceof ConfigError) {
      return this.analyzeConfigError() as ErrorAnalysisResult
    }

    if (error instanceof BrowserCreationError) {
      return this.analyzeBrowserCreationError(error)
    }

    // Generic error analysis
    return this.analyzeGenericError(error)
  }

  /**
   * Analyze RoxyBrowser API errors
   */
  private static analyzeRoxyApiError(error: RoxyApiError): ErrorAnalysisResult {
    const baseResult: ErrorAnalysisResult = {
      category: error.category,
      severity: error.severity as 'low' | 'medium' | 'high' | 'critical',
      description: error.errorInfo?.description || error.message,
      chineseDescription: error.errorInfo?.chineseMsg || '未知错误',
      troubleshooting: error.getTroubleshootingSteps(),
      retryable: error.isRetryable(),
      suggestedActions: [],
      relatedErrors: [],
    }

    if (error.isRetryable()) {
      baseResult.retryStrategy = error.getRetryStrategy()
    }

    // Add specific suggestions based on error type
    baseResult.suggestedActions = this.generateSuggestedActions(error)
    baseResult.relatedErrors = this.findRelatedErrors(error.code)

    return baseResult
  }

  /**
   * Analyze configuration errors
   */
  private static analyzeConfigError() {
    return {
      category: 'configuration',
      severity: 'high',
      description: 'Configuration error - invalid or missing settings',
      chineseDescription: '配置错误 - 配置无效或缺失',
      troubleshooting: [
        'Check environment variables (ROXY_API_KEY, ROXY_API_HOST)',
        'Verify RoxyBrowser application settings',
        'Ensure all required configuration is provided',
        'Check configuration file syntax and format',
      ],
      retryable: false,
      suggestedActions: [
        'Review configuration setup',
        'Check environment variable spelling',
        'Restart application after fixing configuration',
      ],
    }
  }

  /**
   * Analyze browser creation errors
   */
  private static analyzeBrowserCreationError(error: BrowserCreationError): ErrorAnalysisResult {
    const hasPartialResults = error.partialResults && error.partialResults.length > 0

    return {
      category: 'browser',
      severity: hasPartialResults ? 'medium' : 'high',
      description: 'Browser creation failed - configuration or resource issue',
      chineseDescription: '浏览器创建失败 - 配置或资源问题',
      troubleshooting: [
        'Verify workspace and project IDs exist',
        'Check browser configuration parameters',
        'Ensure sufficient system resources',
        'Validate proxy settings if used',
        'Check for conflicting browser instances',
      ],
      retryable: true,
      retryStrategy: {
        shouldRetry: true,
        delayMs: 2000,
        maxRetries: 2,
      },
      suggestedActions: hasPartialResults
        ? [
            'Retry with failed configurations only',
            'Reduce batch size',
            'Check specific error details for each failure',
          ]
        : [
            'Validate all configuration parameters',
            'Check system resources',
            'Try creating browsers one at a time',
          ],
    }
  }

  /**
   * Analyze generic errors
   */
  private static analyzeGenericError(error: Error): ErrorAnalysisResult {
    // Check for network error patterns
    const networkPattern = NETWORK_ERROR_PATTERNS.find(pattern =>
      pattern.pattern.test(error.message),
    )

    if (networkPattern) {
      return {
        category: 'network',
        severity: 'high',
        description: networkPattern.description,
        chineseDescription: '网络连接错误',
        troubleshooting: networkPattern.troubleshooting,
        retryable: true,
        retryStrategy: {
          shouldRetry: true,
          delayMs: 3000,
          maxRetries: 3,
        },
        suggestedActions: [
          'Check network connectivity',
          'Verify service availability',
          'Try again after a brief wait',
        ],
      }
    }

    return {
      category: 'unknown',
      severity: 'medium',
      description: error.message || 'Unknown error occurred',
      chineseDescription: '未知错误',
      troubleshooting: [
        'Check application logs for more details',
        'Verify system status',
        'Try the operation again',
      ],
      retryable: true,
      retryStrategy: {
        shouldRetry: true,
        delayMs: 1000,
        maxRetries: 1,
      },
      suggestedActions: [
        'Review error message for clues',
        'Check system resources',
        'Contact support if issue persists',
      ],
    }
  }

  /**
   * Generate context-specific suggested actions
   */
  private static generateSuggestedActions(error: RoxyApiError): string[] {
    const actions: string[] = []

    switch (error.code) {
      case 401:
        actions.push(
          'Copy API key from RoxyBrowser settings',
          'Set ROXY_API_KEY environment variable',
          'Restart the MCP server',
        )
        break
      case 404:
        actions.push(
          'Use roxy_list_workspaces to find valid workspace IDs',
          'Use roxy_list_browsers to find valid browser IDs',
          'Check if resources were deleted',
        )
        break
      case 409:
        // Check if it's quota error
        if (error.message.includes('额度不足') || error.message.includes('quota')) {
          actions.push(
            '打开 RoxyBrowser 应用 / Open RoxyBrowser app',
            '前往费用中心 / Go to Billing Center',
            '购买或升级窗口套餐 / Purchase or upgrade profiles plan',
            '等待充值生效后重试创建 / Retry creation after quota is added',
          )
        }
        else {
          // Profile conflict case
          actions.push(
            'Close conflicting profile instances',
            'Use roxy_close_browsers tool',
            'Wait a moment and try again',
          )
        }
        break
      case 500:
        actions.push(
          'Check RoxyBrowser application status',
          'Restart RoxyBrowser if needed',
          'Check system resources',
        )
        break
      case 408:
      case 504:
        actions.push(
          'Increase timeout settings',
          'Reduce batch operation size',
          'Check network connectivity',
        )
        break
    }

    return actions
  }

  /**
   * Find related error codes that might have similar causes
   */
  private static findRelatedErrors(errorCode: number): string[] {
    const related: string[] = []

    // Group related errors
    const authErrors = [401, 403]
    const networkErrors = [408, 502, 503, 504]
    const resourceErrors = [404, 409]

    if (authErrors.includes(errorCode)) {
      related.push(...authErrors.filter(code => code !== errorCode).map(code => `Error ${code}`))
    }
    else if (networkErrors.includes(errorCode)) {
      related.push(...networkErrors.filter(code => code !== errorCode).map(code => `Error ${code}`))
    }
    else if (resourceErrors.includes(errorCode)) {
      related.push(...resourceErrors.filter(code => code !== errorCode).map(code => `Error ${code}`))
    }

    return related
  }

  /**
   * Analyze multiple errors to find patterns and provide batch insights
   */
  static analyzeBatchErrors(errors: Error[]): BatchErrorAnalysis {
    const analysis: BatchErrorAnalysis = {
      totalErrors: errors.length,
      errorsByCategory: {},
      errorsBySeverity: {},
      commonPatterns: [],
      recommendations: [],
      retryableCount: 0,
      criticalCount: 0,
    }

    const errorMessages: string[] = []
    const errorCodes: number[] = []

    // Analyze each error
    for (const error of errors) {
      const result = this.analyzeError(error)

      // Count by category
      analysis.errorsByCategory[result.category] = (analysis.errorsByCategory[result.category] || 0) + 1

      // Count by severity
      analysis.errorsBySeverity[result.severity] = (analysis.errorsBySeverity[result.severity] || 0) + 1

      // Track retryable and critical errors
      if (result.retryable)
        analysis.retryableCount++
      if (result.severity === 'critical')
        analysis.criticalCount++

      errorMessages.push(error.message)

      if (error instanceof RoxyApiError) {
        errorCodes.push(error.code)
      }
    }

    // Find common patterns
    analysis.commonPatterns = this.findCommonPatterns(errorMessages, errorCodes)

    // Generate recommendations
    analysis.recommendations = this.generateBatchRecommendations(analysis)

    return analysis
  }

  /**
   * Find common patterns in error messages and codes
   */
  private static findCommonPatterns(messages: string[], codes: number[]): Array<{
    pattern: string
    count: number
    affectedItems: string[]
  }> {
    const patterns: Array<{ pattern: string, count: number, affectedItems: string[] }> = []

    // Count error codes
    const codeCount: Record<number, number> = {}
    const codeMessages: Record<number, string[]> = {}

    codes.forEach((code, index) => {
      codeCount[code] = (codeCount[code] || 0) + 1
      if (!codeMessages[code])
        codeMessages[code] = []
      codeMessages[code].push(messages[index])
    })

    // Add significant error code patterns
    Object.entries(codeCount).forEach(([code, count]) => {
      if (count >= 2) {
        const errorInfo = ROXY_ERROR_MAP[Number.parseInt(code)]
        patterns.push({
          pattern: errorInfo ? `${errorInfo.name} (${code})` : `Error Code ${code}`,
          count,
          affectedItems: codeMessages[Number.parseInt(code)].slice(0, 3), // Show first 3 examples
        })
      }
    })

    // Look for common message patterns
    const commonKeywords = ['timeout', 'connection', 'authentication', 'not found', 'conflict']
    commonKeywords.forEach((keyword) => {
      const matchingMessages = messages.filter(msg =>
        msg.toLowerCase().includes(keyword.toLowerCase()),
      )
      if (matchingMessages.length >= 2) {
        patterns.push({
          pattern: `Messages containing "${keyword}"`,
          count: matchingMessages.length,
          affectedItems: matchingMessages.slice(0, 3),
        })
      }
    })

    return patterns.sort((a, b) => b.count - a.count)
  }

  /**
   * Generate batch-level recommendations
   */
  private static generateBatchRecommendations(analysis: BatchErrorAnalysis): string[] {
    const recommendations: string[] = []

    // Critical errors
    if (analysis.criticalCount > 0) {
      recommendations.push('🚨 Critical errors detected - immediate attention required')
    }

    // Authentication issues
    if (analysis.errorsByCategory.authentication > 0) {
      recommendations.push('🔑 Authentication issues detected - check API key and permissions')
    }

    // Network issues
    if (analysis.errorsByCategory.network > 0) {
      recommendations.push('🌐 Network issues detected - check connectivity and proxy settings')
    }

    // High retry rate
    if (analysis.retryableCount > analysis.totalErrors * 0.7) {
      recommendations.push('🔄 Many errors are retryable - consider implementing automatic retry')
    }

    // Browser conflicts
    if (analysis.errorsByCategory.browser > 0) {
      recommendations.push('🖥️ Browser-related issues detected - check resource availability and conflicts')
    }

    // Configuration issues
    if (analysis.errorsByCategory.configuration > 0) {
      recommendations.push('⚙️ Configuration issues detected - review settings and parameters')
    }

    return recommendations
  }

  /**
   * Format error analysis for display to user/AI
   */
  static formatErrorForDisplay(error: Error): string {
    const analysis = this.analyzeError(error)

    let formatted = `## 错误分析 / Error Analysis\n\n`
    formatted += `**错误类型 / Category**: ${analysis.category}\n`
    formatted += `**严重程度 / Severity**: ${analysis.severity}\n`
    formatted += `**描述 / Description**: ${analysis.description}\n`
    formatted += `**中文说明**: ${analysis.chineseDescription}\n\n`

    if (analysis.troubleshooting.length > 0) {
      formatted += `### 故障排除步骤 / Troubleshooting Steps\n`
      analysis.troubleshooting.forEach((step, index) => {
        formatted += `${index + 1}. ${step}\n`
      })
      formatted += '\n'
    }

    if (analysis.suggestedActions.length > 0) {
      formatted += `### 建议操作 / Suggested Actions\n`
      analysis.suggestedActions.forEach((action, index) => {
        formatted += `${index + 1}. ${action}\n`
      })
      formatted += '\n'
    }

    if (analysis.retryable && analysis.retryStrategy) {
      formatted += `### 重试策略 / Retry Strategy\n`
      formatted += `- **可重试 / Retryable**: ✅ Yes\n`
      formatted += `- **延迟 / Delay**: ${analysis.retryStrategy.delayMs}ms\n`
      formatted += `- **最大重试次数 / Max Retries**: ${analysis.retryStrategy.maxRetries}\n\n`
    }
    else {
      formatted += `### 重试策略 / Retry Strategy\n`
      formatted += `- **可重试 / Retryable**: ❌ No\n\n`
    }

    if (analysis.relatedErrors && analysis.relatedErrors.length > 0) {
      formatted += `### 相关错误 / Related Errors\n`
      formatted += `${analysis.relatedErrors.join(', ')}\n\n`
    }

    return formatted
  }

  /**
   * Format batch analysis for display
   */
  static formatBatchAnalysisForDisplay(analysis: BatchErrorAnalysis): string {
    let formatted = `## 批量错误分析 / Batch Error Analysis\n\n`
    formatted += `**总错误数 / Total Errors**: ${analysis.totalErrors}\n`
    formatted += `**可重试错误 / Retryable Errors**: ${analysis.retryableCount}\n`
    formatted += `**严重错误 / Critical Errors**: ${analysis.criticalCount}\n\n`

    if (Object.keys(analysis.errorsByCategory).length > 0) {
      formatted += `### 错误分类统计 / Error Categories\n`
      Object.entries(analysis.errorsByCategory).forEach(([category, count]) => {
        formatted += `- **${category}**: ${count}\n`
      })
      formatted += '\n'
    }

    if (analysis.commonPatterns.length > 0) {
      formatted += `### 常见错误模式 / Common Patterns\n`
      analysis.commonPatterns.forEach((pattern, index) => {
        formatted += `${index + 1}. **${pattern.pattern}** (${pattern.count} occurrences)\n`
        if (pattern.affectedItems.length > 0) {
          formatted += `   Examples: ${pattern.affectedItems.slice(0, 2).join(', ')}\n`
        }
      })
      formatted += '\n'
    }

    if (analysis.recommendations.length > 0) {
      formatted += `### 建议 / Recommendations\n`
      analysis.recommendations.forEach((rec, index) => {
        formatted += `${index + 1}. ${rec}\n`
      })
      formatted += '\n'
    }

    return formatted
  }
}
