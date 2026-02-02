export class ConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigError'
  }
}

export interface RoxyClientConfig {
  /**
   * RoxyBrowser API host (default: http://127.0.0.1:50000)
   */
  apiHost: string
  /**
   * RoxyBrowser API key
   */
  apiKey: string
  /**
   * Request timeout in milliseconds (default: 30000)
   */
  timeout?: number
}

export function getConfig(): RoxyClientConfig {
  const apiHost = process.env.ROXY_API_HOST || 'http://127.0.0.1:50000'
  const apiKey = process.env.ROXY_API_KEY || ''
  const timeout = process.env.ROXY_TIMEOUT ? Number.parseInt(process.env.ROXY_TIMEOUT) : 30000

  if (!apiKey) {
    throw new ConfigError(
      'ROXY_API_KEY environment variable is required. '
      + 'Get your API key from RoxyBrowser: API -> API配置 -> API Key',
    )
  }

  return { apiHost, apiKey, timeout }
}

const config = getConfig()

export async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<{
  code: number
  msg: string
  data?: T
}> {
  const url = `${config.apiHost}${endpoint}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), config.timeout)

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'token': config.apiKey, // RoxyBrowser uses 'token' header
        ...options.headers,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const responseText = await response.text().catch(() => 'Unknown error')
      throw new Error(
        `HTTP ${response.status}: ${response.statusText} ${responseText}`,
      )
    }

    const result = await response.json()

    return result
  }
  catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}
