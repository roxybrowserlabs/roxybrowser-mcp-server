import type { RoxyApiClient } from '../../api/index.js'
import { toPage, toPageRequest, type PaginationParams } from '../../sdk/shared/pagination.js'
import { unwrapData } from '../../sdk/shared/result.js'
import type { Project, Workspace } from './types.js'

export class WorkspaceDomain {
  constructor(private readonly api: RoxyApiClient) {}

  async list(params: PaginationParams = {}) {
    const data = unwrapData(await this.api.workspace.list(toPageRequest(params)))
    return toPage({
      total: data.total,
      rows: data.rows.map(workspace => ({
        id: workspace.id,
        name: workspace.workspaceName,
        projects: (workspace.project_details ?? []).map(project => ({
          id: project.projectId ?? project.id ?? 0,
          name: project.projectName ?? project.name ?? '',
        })),
      })),
    }, params)
  }
}

export class ProjectDomain {
  constructor(private readonly api: RoxyApiClient) {}

  async list(params: PaginationParams = {}) {
    const data = unwrapData(await this.api.workspace.projects(toPageRequest(params) as any))
    const rows = Array.isArray(data) ? data : data.rows
    const total = Array.isArray(data) ? data.length : data.total
    const projects: Project[] = rows.map(project => ({
      id: project.projectId ?? project.id ?? 0,
      name: project.projectName ?? project.name ?? project.project_name ?? '',
    }))
    return toPage({ total, rows: projects }, params)
  }
}
