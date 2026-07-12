export interface RoxyClientOptions {
  apiHost: string
  apiKey: string
  timeout: number
}

export type RoxyClientOptionsInput = Partial<RoxyClientOptions>

export const DEFAULT_ROXY_CLIENT_CONFIG = {
  apiHost: 'http://127.0.0.1:50000',
  timeout: 30_000,
} as const

export function createRoxyClientConfig(input: RoxyClientOptionsInput = {}): RoxyClientOptions {
  return {
    apiHost: input.apiHost ?? DEFAULT_ROXY_CLIENT_CONFIG.apiHost,
    apiKey: input.apiKey ?? '',
    timeout: input.timeout ?? DEFAULT_ROXY_CLIENT_CONFIG.timeout,
  }
}

export function createRoxyClientConfigFromEnv(env: NodeJS.ProcessEnv = process.env): RoxyClientOptions {
  return createRoxyClientConfig({
    apiHost: env.ROXY_API_HOST,
    apiKey: env.ROXY_API_KEY,
    timeout:
      env.ROXY_TIMEOUT != null && env.ROXY_TIMEOUT !== ''
        ? Number.parseInt(env.ROXY_TIMEOUT, 10)
        : undefined,
  })
}
