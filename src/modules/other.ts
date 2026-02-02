import { request } from '../utils/index.js'

class ListWorkspaces {
  name = 'roxy_list_workspaces'
  description = 'Get list of all workspaces and their projects from RoxyBrowser'
  inputSchema = {
    type: 'object',
    properties: {
      pageIndex: {
        type: 'number',
        description: 'Page index for pagination (default: 1)',
        default: 1,
      },
      pageSize: {
        type: 'number',
        description: 'Number of items per page (default: 15)',
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
      text = `Found ${data.total} workspaces:\n\n${
        data.rows.map((ws: any) =>
          `**${ws.workspaceName}** (ID: ${ws.id})\n${
            ws.project_details.map((proj: any) =>
              `  - ${proj.projectName} (ID: ${proj.projectId})`,
            ).join('\n')}`,
        ).join('\n\n')}`
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
  description = 'Check if the target server is alive and healthy. This tool performs a health check to verify server connectivity and status.'
  inputSchema = {
    type: 'object',
    properties: {
      includeWorkspaceCheck: {
        type: 'boolean',
        description: 'Include workspace connectivity tests (optional, default: true)',
        default: true,
      },
      includeBrowserCheck: {
        type: 'boolean',
        description: 'Include browser availability checks (optional, default: true)',
        default: true,
      },
      verbose: {
        type: 'boolean',
        description: 'Include detailed diagnostic information (optional, default: false)',
        default: false,
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
    const { includeWorkspaceCheck = true, includeBrowserCheck = true, verbose = false } = params || {}

    // Perform health check by calling /health endpoint
    let healthStatus = 'unknown'
    let healthError = ''

    try {
      const healthResult = await request('/health', {
        method: 'GET',
      })

      if (healthResult.code === 0 || healthResult.code === undefined) {
        healthStatus = 'healthy'
      }
      else {
        healthStatus = 'unhealthy'
        healthError = healthResult.msg || 'Health check failed'
      }
    }
    catch (error: any) {
      healthStatus = 'unhealthy'
      healthError = error.message || 'Failed to connect to server'
    }

    let text = `## 🔍 健康检查报告 / Health Check Report\n\n`

    // Basic connectivity
    text += `### 🌐 服务器状态 / Server Status\n`
    text += `- **服务器连接 / Server Connection**: ${healthStatus === 'healthy' ? '✅ 正常' : '❌ 异常'}\n`

    if (healthStatus !== 'healthy' && healthError) {
      text += `- **错误信息 / Error**: ${healthError}\n`
    }

    // Additional workspace checks
    if (includeWorkspaceCheck && healthStatus === 'healthy') {
      try {
        const workspaceResult = await request('/browser/workspace?page_index=1&page_size=5', {
          method: 'GET',
        })

        if (workspaceResult.code === 0) {
          const workspaces = workspaceResult.data
          text += `\n### 📁 工作区信息 / Workspace Information\n`
          text += `- **可用工作区 / Available Workspaces**: ${workspaces.total}\n`

          if (workspaces.rows && workspaces.rows.length > 0) {
            text += `- **工作区详情 / Workspace Details**:\n`
            workspaces.rows.slice(0, 3).forEach((ws: any) => {
              const projectCount = ws.project_details?.length || 0
              text += `  - ${ws.workspaceName} (ID: ${ws.id}) - ${projectCount} projects\n`
            })
            if (workspaces.total > 3) {
              text += `  - ... and ${workspaces.total - 3} more\n`
            }
          }
        }
        else {
          text += `\n### 📁 工作区信息 / Workspace Information\n`
          text += `- **状态**: ⚠️ 无法获取工作区信息\n`
          text += `- **错误**: ${workspaceResult.msg}\n`
        }
      }
      catch (error: any) {
        text += `\n### 📁 工作区信息 / Workspace Information\n`
        text += `- **状态**: ❌ 无法获取工作区信息\n`
        text += `- **错误**: ${error.message || 'Unknown error'}\n`
      }
    }

    // Browser availability checks
    if (includeBrowserCheck && healthStatus === 'healthy') {
      try {
        // Get first workspace and check browsers
        const workspaceResult = await request('/browser/workspace?page_index=1&page_size=1', {
          method: 'GET',
        })

        if (workspaceResult.code === 0 && workspaceResult.data.rows && workspaceResult.data.rows.length > 0) {
          const firstWorkspace = workspaceResult.data.rows[0]
          const browserResult = await request(`/browser/list_v3?workspaceId=${firstWorkspace.id}&page_index=1&page_size=5`, {
            method: 'GET',
          })

          if (browserResult.code === 0) {
            const browsers = browserResult.data
            text += `\n### 🌐 浏览器信息 / Browser Information\n`
            text += `- **工作区 / Workspace**: ${firstWorkspace.workspaceName} (ID: ${firstWorkspace.id})\n`
            text += `- **浏览器总数 / Total Browsers**: ${browsers.total}\n`

            if (browsers.rows && browsers.rows.length > 0) {
              text += `- **浏览器示例 / Browser Examples**:\n`
              browsers.rows.slice(0, 3).forEach((browser: any) => {
                text += `  - ${browser.windowName || 'Unnamed'} (ID: ${browser.dirId}) - ${browser.status}\n`
              })
            }
          }
        }
      }
      catch (error: any) {
        text += `\n### 🌐 浏览器信息 / Browser Information\n`
        text += `- **状态**: ⚠️ 无法获取浏览器信息\n`
        text += `- **错误**: ${error.message || 'Unknown error'}\n`
      }
    }

    // Verbose mode - add detailed information
    if (verbose && healthStatus === 'healthy') {
      text += `\n### 📊 详细信息 / Detailed Information\n`
      text += `- **健康检查时间 / Check Time**: ${new Date().toISOString()}\n`
      text += `- **检查模式 / Check Mode**: ${includeWorkspaceCheck ? 'Workspace + ' : ''}${includeBrowserCheck ? 'Browser' : ''}\n`
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
