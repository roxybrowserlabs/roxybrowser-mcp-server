/**
 * Configuration and HTTP client for RoxyBrowser API.
 *
 * Config is fixed at process start: environment variables (ROXY_API_HOST, ROXY_API_KEY, ROXY_TIMEOUT) + defaults.
 * CLI writes parsed args into process.env before starting the server, so CLI args take effect the same way.
 */

import { ConfigError } from '../types.js'

export { ConfigError }

export interface RoxyClientConfig {
  /** RoxyBrowser API base URL */
  apiHost: string
  /** API key (required for requests) */
  apiKey: string
  /** Request timeout in milliseconds */
  timeout: number
}

/** Default values when env is not set */
export const DEFAULT_CONFIG = {
  apiHost: 'http://127.0.0.1:50000',
  timeout: 30_000,
} as const

const ENV_KEYS = {
  apiHost: 'ROXY_API_HOST',
  apiKey: 'ROXY_API_KEY',
  timeout: 'ROXY_TIMEOUT',
} as const

/**
 * Resolve config from env + defaults (read-only; no runtime override).
 */
export function resolveConfig(): RoxyClientConfig {
  const envHost = process.env[ENV_KEYS.apiHost]
  const envKey = process.env[ENV_KEYS.apiKey]
  const envTimeout = process.env[ENV_KEYS.timeout]

  return {
    apiHost: envHost ?? DEFAULT_CONFIG.apiHost,
    apiKey: envKey ?? '',
    timeout:
      envTimeout != null && envTimeout !== ''
        ? Number.parseInt(envTimeout, 10)
        : DEFAULT_CONFIG.timeout,
  }
}

/** Internal: config with apiKey validation (used by request()). */
function requireConfig(): RoxyClientConfig {
  const config = resolveConfig()
  if (!config.apiKey || config.apiKey.trim() === '') {
    throw new ConfigError(
      'API key is required. Set ROXY_API_KEY or pass --api-key. '
      + 'Get your key from RoxyBrowser: API → API配置 → API Key',
    )
  }
  return config
}

export async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<{
  code: number
  msg: string
  data?: T
}> {
  const config = requireConfig()
  const url = `${config.apiHost.replace(/\/$/, '')}${endpoint}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), config.timeout)

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'token': config.apiKey,
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
