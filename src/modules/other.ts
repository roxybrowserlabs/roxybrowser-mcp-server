import { request } from '../utils/index.js'
import {
  buildPaginationInfo,
  buildPaginatedToolResult,
  formatPaginationText,
  paginatedToolResponse,
} from '../utils/pagination.js'

class ListWorkspaces {
  name = 'roxy_list_workspaces'
  description = 'Get list of all workspaces/team and projects. This is a paginated partial result unless pagination.isCompleteResult is true. Do not conclude a workspace does not exist from one page alone.'
  inputSchema = {
    type: 'object',
    properties: {
      pageIndex: {
        type: 'number',
        description: '1-based page index for pagination. Larger pages may be needed to prove absence.',
        default: 1,
      },
      pageSize: {
        type: 'number',
        description: 'Number of items per page. A single page is only partial evidence unless pagination.isCompleteResult is true.',
        default: 15,
      },
    },
  }

  get schema() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  async handle(params: any) {
    const { pageIndex = 1, pageSize = 15 } = params || {}

    const searchParams = new URLSearchParams()
    searchParams.append('page_index', pageIndex.toString())
    searchParams.append('page_size', pageSize.toString())

    const result = await request(`/browser/workspace?${searchParams}`, {
      method: 'GET',
    })

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Failed to list workspaces:**\n\n error message: ${result.msg}`
    }
    else {
      const data = result.data
      const rows = Array.isArray(data.rows) ? data.rows : []
      const totalItems = typeof data.total === 'number' ? data.total : rows.length
      const pagination = buildPaginationInfo({
        pageIndex,
        pageSize,
        totalItems,
      })

      const blocks = rows.map((ws: any) => {
        const projects = (ws.project_details || []).map((proj: any) =>
          `    - ${proj.projectName} -> projectId: **${proj.projectId}**`,
        ).join('\n')
        return `  - **Workspace:** ${ws.workspaceName} -> workspaceId: **${ws.id}**\n    Projects under this workspace:\n${projects || '    (no projects)'}`
      })
      const workspaceText = blocks.length > 0
        ? blocks.join('\n\n')
        : totalItems === 0
          ? 'No workspaces found.'
          : `No workspaces found on page ${pageIndex}, but this is not an empty result set.`

      const paginationText = formatPaginationText({
        toolName: 'roxy_workspace_list',
        pagination,
        itemCount: rows.length,
        recoveryHint: totalItems > 0 && rows.length === 0
          ? `Call roxy_workspace_list with pageIndex=${pagination.totalPages}, or use a more specific identifier if available.`
          : undefined,
      })

      text = `Found ${totalItems} workspace(s). Each workspace contains its own projects:\n\n` +
        workspaceText +
        `\n\n> 💡 **Tip:** Browser operations (create/open/list) require a **projectId** from a workspace above. Proxy/account operations only require a **workspaceId**. Pick the relevant ID before calling those tools.\n\n` +
        paginationText

      return paginatedToolResponse(
        text,
        buildPaginatedToolResult({
          entity: 'workspace',
          query: { pageIndex, pageSize },
          items: rows,
          pagination,
          filtersApplied: {},
          existenceGuidance: {
            canCheckExactly: false,
            preferredFilterFields: [],
            warning: 'No exact lookup filter is available. To prove absence, scan all pages or ask the user for a more specific identifier.',
          },
        }),
      )
    }

    return {
      content: [
        {
          type: 'text',
          text,
        },
      ],
    }
  }
}

class ListProjects {
  name = 'roxy_list_projects'
  description = 'Get project list for the current fixed workspace. Falls back to workspace/list when project/list is unavailable. This is a paginated partial result unless pagination.isCompleteResult is true. Do not conclude a project does not exist from one page alone.'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Current workspace ID',
      },
      pageIndex: {
        type: 'number',
        description: '1-based page index for pagination. Larger pages may be needed to prove absence.',
        default: 1,
      },
      pageSize: {
        type: 'number',
        description: 'Number of projects per page. A single page is only partial evidence unless pagination.isCompleteResult is true.',
        default: 15,
      },
    },
    required: ['workspaceId'],
  }

  get schema() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  async handle(params: any) {
    if (!params.workspaceId) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ **Failed to list projects:**\n\n workspaceId is required',
          },
        ],
      }
    }

    const { workspaceId, pageIndex = 1, pageSize = 15 } = params
    const projectSearchParams = new URLSearchParams()
    projectSearchParams.append('workspaceId', workspaceId.toString())
    projectSearchParams.append('page_index', pageIndex.toString())
    projectSearchParams.append('page_size', pageSize.toString())

    let result
    let source = '/project/list'

    try {
      result = await request(`/project/list?${projectSearchParams}`, {
        method: 'GET',
      })
    }
    catch (error: any) {
      const fallbackSearchParams = new URLSearchParams()
      fallbackSearchParams.append('workspaceId', workspaceId.toString())
      fallbackSearchParams.append('page_index', '1')
      fallbackSearchParams.append('page_size', '9999')

      result = await request(`/browser/workspace?${fallbackSearchParams}`, {
        method: 'GET',
      })
      source = '/browser/workspace'
    }

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Failed to list projects:**\n\n error message: ${result.msg}`
    }
    else {
      const data = result.data || {}
      let total = 0
      let pageProjects: any[] = []
      let projectLines = '  (no projects in this workspace)'

      const formatProject = (project: any) => {
        const projectId = project.projectId ?? project.project_id ?? project.id
        const projectName = project.projectName ?? project.project_name ?? project.name ?? 'Unnamed'
        return `  - ${projectName} -> projectId: **${projectId}**`
      }

      if (source === '/project/list') {
        const rows = Array.isArray(data.rows)
          ? data.rows
          : Array.isArray(data)
            ? data
            : []

        total = typeof data.total === 'number' ? data.total : rows.length
        pageProjects = rows
        projectLines = pageProjects.length > 0
          ? pageProjects.map(formatProject).join('\n')
          : total === 0
            ? '  (no projects in this workspace)'
            : `  (no projects on page ${pageIndex}; this page is out of range)`
      }
      else {
        const rows = Array.isArray(data.rows) ? data.rows : []
        const workspace = rows.find((item: any) => Number(item.id ?? item.workspaceId) === Number(workspaceId))
        const projects = Array.isArray(workspace?.project_details) ? workspace.project_details : []
        total = projects.length
        pageProjects = projects.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
        projectLines = pageProjects.length > 0
          ? pageProjects.map(formatProject).join('\n')
          : total === 0
            ? '  (no projects in this workspace)'
            : `  (no projects on page ${pageIndex}; this page is out of range)`
      }

      const pagination = buildPaginationInfo({
        pageIndex,
        pageSize,
        totalItems: total,
      })

      const paginationText = formatPaginationText({
        toolName: 'roxy_project_list',
        pagination,
        itemCount: pageProjects.length,
        recoveryHint: total > 0 && pageProjects.length === 0
          ? `Call roxy_project_list with pageIndex=${pagination.totalPages}, or use exact project id/name details if available.`
          : undefined,
      })

      text = `Found ${total} project(s) in workspaceId ${workspaceId} via ${source}:\n\n${projectLines}\n\n${paginationText}`

      return paginatedToolResponse(
        text,
        buildPaginatedToolResult({
          entity: 'project',
          query: { workspaceId, pageIndex, pageSize },
          items: pageProjects,
          pagination,
          filtersApplied: { workspaceId },
          existenceGuidance: {
            canCheckExactly: false,
            preferredFilterFields: [],
            warning: 'No exact lookup filter is available. To prove absence, scan all pages or ask the user for a more specific identifier.',
          },
        }),
      )
    }

    return {
      content: [
        {
          type: 'text',
          text,
        },
      ],
    }
  }
}

class HealthCheck {
  name = 'roxy_health_check'
  description = 'Check whether the RoxyBrowser server is running and reachable.'
  inputSchema = {
    type: 'object',
    properties: {},
  }

  get schema() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  async handle(_params?: any) {
    let text = ''

    try {
      const result = await request('/health', {
        method: 'GET',
      })

      text = result.code === 0
        ? '✅ **Server is healthy**\n\nThe RoxyBrowser API is running and reachable.'
        : `❌ **Server health check failed**\n\n${result.msg || 'Unknown server response'}`
    }
    catch (error: any) {
      text = `❌ **Server is unavailable**\n\n${error?.message || 'Failed to connect to the server'}\n\n> If the server is actually running, double-check ROXY_API_HOST and whether a reverse proxy or path prefix is rewriting /health.`
    }

    return {
      content: [
        {
          type: 'text',
          text,
        },
      ],
    }
  }
}

export const listWorkspaces = new ListWorkspaces()
export const listProjects = new ListProjects()
export const healthCheck = new HealthCheck()

