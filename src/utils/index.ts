import { ConfigError } from '../types.js'
import { AsyncLocalStorage } from 'node:async_hooks'
import {
  createRoxyClientConfigFromEnv,
  DEFAULT_ROXY_CLIENT_CONFIG,
  RoxyClient,
  type RoxyClientOptions,
} from '../client/index.js'

export { ConfigError }

const clientStorage = new AsyncLocalStorage<RoxyClient>()

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

export async function runWithRoxyClient<T>(client: RoxyClient, fn: () => Promise<T>): Promise<T> {
  return clientStorage.run(client, fn)
}

export async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<{
  code: number
  msg: string
  data?: T
}> {
  const client = clientStorage.getStore() ?? new RoxyClient(resolveConfig())
  return client.request<T>(endpoint, options)
}
