import { request } from '../utils/index.js'

const channelList = [
  {
    label: 'IPRust.io',
    type: 'checkChannel',
    value: 'http://iprust.io/ip.json',
  },
  {
    label: 'IP-API',
    type: 'checkChannel',
    value: 'http://pro.ip-api.com/json?key=c1ulk9X5j8NKqTV',
  },
  {
    label: 'IP123.in',
    type: 'checkChannel',
    value: 'http://ip123.in/ip.json',
  },
  {
    label: 'IPinfo',
    type: 'checkChannel',
    value: 'http://ipinfo.io',
  },
]

/** 代理列表 */
export class ProxyList {
  name = 'roxy_list_proxies'
  description = 'Get list of proxy IP List.'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
      },
      proxyType: {
        type: 'number',
        description: 'Filter by proxy ID',
      },
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
    const searchParams = new URLSearchParams()
    searchParams.append('workspaceId', params.workspaceId.toString())
    if (params.id)
      searchParams.append('id', params.id.toString())
    if (params.pageIndex)
      searchParams.append('page_index', params.pageIndex.toString())
    if (params.pageSize)
      searchParams.append('page_size', params.pageSize.toString())

    if (!params.workspaceId) {
      throw new Error('workspaceId is required')
    }

    const result = await request(`/proxy/list_merged?${searchParams}`)
    let text = ''
    if (result.code === 0) {
      const data = result.data
      const currentPage = params.pageIndex ?? 1
      const pageSize = params.pageSize ?? 15
      const totalPages = Math.max(1, Math.ceil((data.total || 0) / pageSize))
      const hasNextPage = currentPage < totalPages

      const proxyListText = data.rows.length > 0
        ? data.rows.map((proxy: any, index: number) => {
            const statusText = proxy.checkStatus === 1 ? '✅ available' : proxy.checkStatus === 2 ? '❌ unavailable' : '⏳ not checked'
            const sourceType = proxy.dataType === 'proxyModule' ? 'user-added' : proxy.dataType === 'buyProxy' ? 'proxy store' : proxy.dataType || 'unknown'
            const canDelete = proxy.dataType === 'proxyModule' ? 'yes' : 'no'
            const name = `proxy (id: ${proxy.id}) ${proxy.remark ? `remark: ${proxy.remark}` : ''}`

            const location = proxy.lastCountry
              ? `${proxy.lastCity || ''}${proxy.lastCity && proxy.lastCountry ? ', ' : ''}${proxy.lastCountry}`
              : null

            let baseInfo = `${index + 1}. ${statusText} **${name}**\nsource: ${sourceType}\ndeletable: ${canDelete}\nprotocol: ${proxy.protocol || 'N/A'}\nipType: ${proxy.ipType || 'N/A'}\nbind profile count: ${proxy.bindCount || 'N/A'}\nDetection channel: ${proxy.checkChannel || 'N/A'}`

            const ipInfo = []
            if (proxy.host && proxy.port) {
              ipInfo.push(...[proxy.host, ':', proxy.port])
              if (proxy.proxyUserName && proxy.proxyPassword) {
                ipInfo.push(...['@', proxy.proxyUserName, ':', proxy.proxyPassword])
              }
            }

            if (location) {
              baseInfo += `\n${ipInfo.length > 0 ? `${ipInfo.join('')}\n` : ''}\n📍 ${location}`
            }
            return baseInfo
          }).join('\n\n')
        : ''
      text = `📵 **proxy list** (total: ${data.total})\n\nOnly proxies with \`source: user-added\` can be deleted.\n\n${proxyListText}

Pagination:
- currentPage: ${currentPage}
- pageSize: ${pageSize}
- totalPages: ${totalPages}
- hasNextPage: ${hasNextPage}
${hasNextPage ? `- nextPageHint: Call roxy_list_proxies again with pageIndex=${currentPage + 1}` : '- nextPageHint: No more pages'}`
    }
    else {
      text = `❌ **get proxy list failed**\n\n${result.msg}`
    }

    return { content: [{ type: 'text', text }] }
  }
}

class CreateProxies {
  name = 'roxy_create_proxies'
  description = 'Batch create multiple proxy configurations'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
      },
      proxyList: {
        type: 'array',
        description: 'Array of proxy configurations',
        items: {
          type: 'object',
          properties: {
            protocol: { type: 'string', enum: ['HTTP', 'HTTPS', 'SOCKS5', 'SSH'] },
            host: { type: 'string' },
            port: { type: 'string' },
            proxyUserName: { type: 'string' },
            proxyPassword: { type: 'string' },
            ipType: { type: 'string', enum: ['IPV4', 'IPV6'] },
            checkChannel: { type: 'string', enum: channelList.map(item => item.label) },
            refreshUrl: { type: 'string' },
            remark: { type: 'string' },
          },
          required: ['protocol', 'host', 'port'],
        },
      },
    },
    required: ['workspaceId', 'proxyList'],
  }

  get schema() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  async handle(params: any) {
    if (!params.workspaceId || !params.proxyList || params.proxyList.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ **Failed to batch create proxies:**\n\n workspaceId and proxyList are required',
          },
        ],
      }
    }

    const { workspaceId, proxyList } = params

    proxyList.forEach((item: any) => {
      item.ipType = item.ipType ? item.ipType : 'IPV4'
      item.checkChannel = item.checkChannel ? channelList.find((channel: any) => channel.label === item.checkChannel)?.value : null
    })

    const result = await request('/proxy/batch_create', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, proxyList }),
    })

    let text = ''
    if (result.code !== 0) {
      if (result.data) {
        text = `❌ **Failed to batch create proxies:**\n\n error message: ${result.msg}\n\n${result.data.map((item: any) => `  - index: ${item.index}, error message: ${item.msg.join(', ')}`).join('\n')}`
      }
      else {
        text = `❌ **Failed to batch create proxies:**\n\n error message: ${result.msg}`
      }
    }
    else {
      text = `✅ **Batch Proxy Creation Successful**

**Count:** ${params.proxyList.length} proxy/proxies
**Workspace:** ${params.workspaceId}${params.checkChannel
  ? `
**Default Check Channel:** ${params.checkChannel}`
  : ''}

*All proxies have been created. IP detection will be performed automatically.*`
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

class DetectProxy {
  name = 'roxy_detect_proxy'
  description = 'Detect/test a proxy configuration and update its IP information'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
      },
      id: {
        type: 'number',
        description: 'Proxy ID to detect',
      },
    },
    required: ['workspaceId', 'id'],
  }

  get schema() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  async handle(params: any) {
    if (!params.workspaceId || !params.id) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ **Failed to detect proxy:**\n\n workspaceId and id are required',
          },
        ],
      }
    }

    const { workspaceId, id } = params

    const result = await request('/proxy/detect', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, id }),
    })

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Failed to detect proxy:**\n\n error message: ${result.msg}`
    }
    else {
      const data = result.data
      if (data) {
        text = `✅ **Proxy Detection ${data.checkStatus === 1 ? 'Success' : data.checkStatus === 2 ? 'Failed' : ''}**

**ip address:** ${data.lastIp}
**country:** ${data.lastCountry}
**city:** ${data.lastCity}
**timezone:** ${data.timezone ? data.timezone : 'N/A'}
`
      }
      else {
        text = `✅ **Proxy Detection Started**

**Proxy ID:** ${params.id}
**Workspace:** ${params.workspaceId}

*Proxy detection is in progress. This may take a few seconds. Use \`roxy_list_proxies\` | \`roxy_store_proxies\` to check the updated status.*
`
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

class ModifyProxy {
  name = 'roxy_modify_proxy'
  description = 'Modify/update an existing proxy configuration'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
      },
      id: {
        type: 'number',
        description: 'Proxy ID to modify',
      },
      protocol: {
        type: 'string',
        enum: ['HTTP', 'HTTPS', 'SOCKS5', 'SSH'],
        description: 'Proxy protocol type',
      },
      host: {
        type: 'string',
        description: 'Proxy host/IP address',
      },
      port: {
        type: 'string',
        description: 'Proxy port',
      },
      proxyUserName: {
        type: 'string',
        description: 'Proxy username',
      },
      proxyPassword: {
        type: 'string',
        description: 'Proxy password',
      },
      ipType: {
        type: 'string',
        enum: ['IPV4', 'IPV6'],
        description: 'IP type',
      },
      checkChannel: {
        type: 'string',
        enum: channelList.map(item => item.label),
        description: 'IP detection channel',
      },
      refreshUrl: {
        type: 'string',
        description: 'Refresh URL for dynamic proxies',
      },
      remark: {
        type: 'string',
        description: 'Proxy remark/notes',
      },
    },
    required: ['workspaceId', 'id'],
  }

  get schema() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  async handle(params: any) {
    if (!params.workspaceId || !params.id) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ **Failed to modify proxy:**\n\n workspaceId and id are required',
          },
        ],
      }
    }

    const { workspaceId, checkChannel = 'IPRust.io', ...proxyData } = params
    const proxyParams = {
      workspaceId,
      ...proxyData,
      checkChannel: checkChannel ? channelList.find(item => item.label === checkChannel)?.value : null,
      proxyCategory: params.protocol,
    }

    const result = await request('/proxy/modify', {
      method: 'POST',
      body: JSON.stringify(proxyParams),
    })

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Failed to modify proxy:**\n\n error message: ${result.msg}`
    }
    else {
      text = `✅ **Proxy Modified Successfully**

**Proxy ID:** ${params.id}${params.protocol
  ? `
**Protocol:** ${params.protocol}`
  : ''}${params.host
  ? `
**Host:** ${params.host}${params.port ? `:${params.port}` : ''}`
  : ''}${params.remark
  ? `
**Remark:** ${params.remark}`
  : ''}

*Proxy configuration has been updated. Use \`roxy_detect_proxy\` to test the new configuration.*`
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

class DeleteProxies {
  name = 'roxy_delete_proxies'
  description = 'Delete one or more proxy configurations'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
      },
      ids: {
        type: 'array',
        items: { type: 'number' },
        description: 'Array of proxy IDs to delete',
      },
    },
    required: ['workspaceId', 'ids'],
  }

  get schema() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  async handle(params: any) {
    if (!params.workspaceId || !params.ids || params.ids.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ **Failed to delete proxies:**\n\n workspaceId and ids are required',
          },
        ],
      }
    }

    const { workspaceId, ids } = params

    const result = await request('/proxy/delete', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, ids }),
    })

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Failed to delete proxies:**\n\n error message: ${result.msg}`
    }
    else {
      text = `✅ **Proxies Deleted Successfully**

**Count:** ${params.ids.length} proxy/proxies
**Workspace:** ${params.workspaceId}

**Deleted Proxy IDs:**
${params.ids.map((id: number, index: number) => `  ${index + 1}. ${id}`).join('\n')}

⚠️ **Warning:** Deleted proxies cannot be recovered.`
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

export const proxyList = new ProxyList()
export const createProxies = new CreateProxies()
export const detectProxy = new DetectProxy()
export const modifyProxy = new ModifyProxy()
export const deleteProxies = new DeleteProxies()
