import type { RoxyApiClient } from "../../api/index.js";
import { GeneratedWorkspaceDomain } from "../../generated/roxy-browser-client.js";
import { toPage, toPageRequest, type PaginationParams } from "../../sdk/shared/pagination.js";
import { unwrapData } from "../../sdk/shared/result.js";

export class WorkspaceDomain extends GeneratedWorkspaceDomain {}

export class ProjectDomain {
  constructor(private readonly api: RoxyApiClient) {}

  async list(params: PaginationParams = {}) {
    const data = unwrapData(await this.api.workspace.projects(toPageRequest(params) as any));
    const rows = Array.isArray(data) ? data : data.rows;
    const total = Array.isArray(data) ? data.length : data.total;
    return toPage({ total, rows }, params);
  }
}
