import { ConfigError } from '../types.js'
import { AsyncLocalStorage } from 'node:async_hooks'
import {
  createRoxyClientConfigFromEnv,
  DEFAULT_ROXY_CLIENT_CONFIG,
  RoxyOpenAPI,
  type RoxyClientOptions,
} from '../client/index.js'

export { ConfigError }

const clientStorage = new AsyncLocalStorage<RoxyOpenAPI>()

/** Default values when env is not set */
export const DEFAULT_CONFIG = {
  ...DEFAULT_ROXY_CLIENT_CONFIG,
} as const

/**
 * Resolve config from env + defaults (read-only; no runtime override).
 */
export function resolveConfig(): RoxyClientOptions {
  return createRoxyClientConfigFromEnv()
}

export async function runWithRoxyOpenAPI<T>(client: RoxyOpenAPI, fn: () => Promise<T>): Promise<T> {
  return clientStorage.run(client, fn)
}

export function getRoxyOpenAPI(): RoxyOpenAPI {
  return clientStorage.getStore() ?? new RoxyOpenAPI(resolveConfig())
}

export async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<{
  code: number
  msg: string
  data?: T
}> {
  const client = getRoxyOpenAPI()
  const method = (options.method ?? 'GET').toUpperCase() as 'GET' | 'POST'
  const body = typeof options.body === 'string' && options.body !== ''
    ? JSON.parse(options.body)
    : undefined

  return client.request<T>({
    method,
    path: endpoint,
    params: method === 'GET' ? undefined : body,
  })
}
