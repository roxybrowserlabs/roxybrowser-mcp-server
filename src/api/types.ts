export type JsonObject = Record<string, unknown>;

export interface RoxyApiClientOptions {
  apiKey?: string;
  apikey?: string;
  baseUrl?: string;
  apiHost?: string;
  workspaceId?: number;
  timeout?: number;
  fetch?: typeof fetch;
}

export interface RoxyApiResponse<T = unknown> {
  code: number;
  msg: string;
  data?: T;
}

export interface PageRequest {
  page_index?: number;
  page_size?: number;
}

export interface PageData<T> {
  total: number;
  rows: T[];
}

export interface RawProject {
  id?: number;
  name?: string;
  projectId?: number;
  projectName?: string;
  project_name?: string;
  [key: string]: unknown;
}
