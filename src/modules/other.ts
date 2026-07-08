import { request } from '../utils/index.js'

class ListWorkspaces {
  name = 'roxy_list_workspaces'
  description = 'Get list of all workspaces/team and projects'
  inputSchema = {
    type: 'object',
    properties: {
      pageIndex: {
        type: 'number',
        description: 'Page index for pagination',
        default: 1,
      },
      pageSize: {
        type: 'number',
        description: 'Number of items per page',
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
      const currentPage = pageIndex
      const totalPages = Math.max(1, Math.ceil((data.total || 0) / pageSize))
      const hasNextPage = currentPage < totalPages

      const blocks = data.rows.map((ws: any) => {
        const projects = (ws.project_details || []).map((proj: any) =>
          `    • ${proj.projectName} → projectId: **${proj.projectId}**`,
        ).join('\n')
        return `  - **Workspace:** ${ws.workspaceName} → workspaceId: **${ws.id}**\n    Projects under this workspace:\n${projects || '    (no projects)'}`
      })
      text = `Found ${data.total} workspace(s). Each workspace contains its own projects:\n\n` +
        blocks.join('\n\n') +
        `\n\n> 💡 **Tip:** Browser operations (create/open/list) require a **projectId** taken from a workspace above. Proxy/account operations only require a **workspaceId**. Pick the relevant ID before calling those tools.`
      if (totalPages > 1) {
        text += `\n\nPagination: page=${currentPage}, totalPages=${totalPages}, hasNext=${hasNextPage}`
      }
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
        ? '✅ **Server is healthy**\n\nThe RoxyBrowser server is running and reachable.'
        : `❌ **Server health check failed**\n\n${result.msg || 'Unknown server response'}`
    }
    catch (error: any) {
      text = `❌ **Server is unavailable**\n\n${error?.message || 'Failed to connect to the server'}`
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
export const healthCheck = new HealthCheck()
