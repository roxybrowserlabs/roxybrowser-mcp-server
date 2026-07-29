import { RoxyApiConfigError, RoxyApiHttpError } from './errors.js'
import type { JsonObject, RoxyApiClientOptions, RoxyApiResponse } from './types.js'

export interface TransportRequest {
  method: 'GET' | 'POST'
  path: string
  params?: object
}

export class RoxyApiTransport {
  readonly apiKey: string
  readonly baseUrl: string
  readonly workspaceId?: number
  readonly timeout: number

  private readonly fetchImpl: typeof fetch

  constructor(options: RoxyApiClientOptions = {}) {
    this.apiKey = options.apiKey ?? options.apikey ?? ''
    this.baseUrl = options.baseUrl ?? options.apiHost ?? 'http://127.0.0.1:50000'
    this.workspaceId = options.workspaceId
    this.timeout = options.timeout ?? 30_000
    this.fetchImpl = options.fetch ?? fetch
  }

  async request<T>({ method, path, params }: TransportRequest): Promise<RoxyApiResponse<T>> {
    if (!this.apiKey.trim()) {
      throw new RoxyApiConfigError('API key is required. Pass apiKey/apikey or set ROXY_API_KEY.')
    }

    const url = new URL(path, this.baseUrl.replace(/\/$/, '') + '/')
    const init: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        token: this.apiKey,
      },
    }

    if (method === 'GET') {
      appendQuery(url, params)
    }
    else {
      init.body = JSON.stringify(params ?? {})
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    init.signal = controller.signal

    try {
      const response = await this.fetchImpl(url.toString(), init)
      if (!response.ok) {
        const body = await response.text().catch(() => '')
        throw new RoxyApiHttpError(response.status, response.statusText, body)
      }

      return await response.json() as RoxyApiResponse<T>
    }
    finally {
      clearTimeout(timeoutId)
    }
  }
}

export function appendQuery(url: URL, params?: object): void {
  if (!params)
    return

  for (const [key, value] of Object.entries(params as JsonObject)) {
    if (value === undefined || value === null)
      continue
    url.searchParams.append(key, Array.isArray(value) ? value.join(',') : String(value))
  }
}

export function withDefaultWorkspace<T extends object>(params: T | undefined, workspaceId?: number): T {
  const normalized = { ...(params ?? {}) } as T & { workspaceId?: number | null }
  if ((normalized.workspaceId === undefined || normalized.workspaceId === null) && workspaceId !== undefined) {
    normalized.workspaceId = workspaceId
  }
  return normalized as T
}
