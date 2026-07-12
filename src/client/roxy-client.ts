import { ConfigError } from '../types.js'
import { createRoxyClientConfig, type RoxyClientOptions, type RoxyClientOptionsInput } from './config.js'

export class RoxyClient {
  readonly config: RoxyClientOptions

  constructor(config: RoxyClientOptionsInput = {}) {
    this.config = createRoxyClientConfig(config)
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<{
    code: number
    msg: string
    data?: T
  }> {
    if (!this.config.apiKey || this.config.apiKey.trim() === '') {
      throw new ConfigError(
        'API key is required. Set ROXY_API_KEY, pass --api-key, or provide roxy.apiKey when creating the server. '
        + 'Get your key from RoxyBrowser: API → API配置 → API Key',
      )
    }

    const url = `${this.config.apiHost.replace(/\/$/, '')}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'token': this.config.apiKey,
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

      return await response.json()
    }
    catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }
}
