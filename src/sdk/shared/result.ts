import type { RoxyApiResponse } from "../../api/index.js";

export function unwrapData<T>(response: RoxyApiResponse<T>): T {
  if (response.code !== 0) {
    throw new Error(response.msg || `Roxy API request failed with code ${response.code}`);
  }
  return response.data as T;
}

export function ensureSuccess(response: RoxyApiResponse): void {
  if (response.code !== 0) {
    throw new Error(response.msg || `Roxy API request failed with code ${response.code}`);
  }
}
