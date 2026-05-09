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
  /**
   * 仅当用户没有指定商店时调用
   */
  description = 'Get list of proxy configurations. If you want to get the list of proxies configurations you\'ve bought, please use `roxy_store_proxies`.'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
      },
      id: {
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

    const result = await request(`/proxy/list?${searchParams}`)
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
            const name = `proxy (id: ${proxy.id}) ${proxy.remark ? `remark: ${proxy.remark}` : ''}`

            const location = proxy.lastCountry
              ? `${proxy.lastCity || ''}${proxy.lastCity && proxy.lastCountry ? ', ' : ''}${proxy.lastCountry}`
              : null

            // 构建简洁的输出
            let baseInfo = `${index + 1}. ${statusText} **${name}**\nprotocol: ${proxy.protocol || 'N/A'}\nipType: ${proxy.ipType || 'N/A'}\nbind profile count: ${proxy.bindCount || 'N/A'}\nDetection channel: ${proxy.checkChannel || 'N/A'}`

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
      text = `📋 **proxy list** (total: ${data.total})\n\n${proxyListText}

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

/** 代理商店 */
export class ProxyStore {
  name = 'roxy_store_proxies'
  description = 'Get list of proxy configurations in the Proxy Store'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
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
      type: {
        type: 'number',
        description: 'Type of proxies to get (0: list_use, 1: available_list)',
        default: 0,
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
    if (params.pageIndex)
      searchParams.append('page_index', params.pageIndex.toString())
    if (params.pageSize)
      searchParams.append('page_size', params.pageSize.toString())
    if (params.type)
      searchParams.append('type', params.type.toString())

    const result = await request(`/proxy/bought_list?${searchParams}`)
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
            const name = `proxy (id: ${proxy.id}) ${proxy.remark ? `remark: ${proxy.remark}` : ''}`

            const location = proxy.lastCountry
              ? `${proxy.lastCity || ''}${proxy.lastCity && proxy.lastCountry ? ', ' : ''}${proxy.lastCountry}`
              : null

            // 构建简洁的输出
            let baseInfo = `${index + 1}. ${statusText} **${name}**\nprotocol: ${proxy.protocol || 'N/A'}\nipType: ${proxy.ipType || 'N/A'}\nbind profile count: ${proxy.bindCount || 'N/A'}\nDetection channel: ${proxy.checkChannel || 'N/A'}\nexpire date: ${proxy.expireDate}`

            const ipInfo = [proxy.host, ':', proxy.port]
            if (proxy.proxyUserName) {
              ipInfo.push(...[proxy.proxyUserName, '@', proxy.proxyPassword])
            }
            if (location) {
              baseInfo += `\n${ipInfo.join('')}\n📍 ${location}`
            }
            return baseInfo
          }).join('\n\n')
        : ''
      text = `📋 **proxy store** (total: ${data.total})\n\n${proxyListText}

Pagination:
- currentPage: ${currentPage}
- pageSize: ${pageSize}
- totalPages: ${totalPages}
- hasNextPage: ${hasNextPage}
${hasNextPage ? `- nextPageHint: Call roxy_store_proxies again with pageIndex=${currentPage + 1}` : '- nextPageHint: No more pages'}`
    }
    else {
      text = `❌ **get proxy store failed**\n\n${result.msg}`
    }

    return { content: [{ type: 'text', text }] }
  }
}

class CreateProxy {
  name = 'roxy_create_proxy'
  description = 'Create a new proxy configuration with automatic IP detection'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
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
        description: 'IP type (default: IPV4)',
      },
      checkChannel: {
        type: 'string',
        enum: channelList.map(item => item.label),
        description: 'IP detection channel (default: IP123.in)',
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
    required: ['workspaceId', 'protocol', 'host', 'port'],
  }

  get schema() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  async handle(params: any) {
    if (!params.workspaceId || !params.protocol || !params.host || !params.port) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ **Failed to create proxy:**\n\n workspaceId, protocol, host, and port are required',
          },
        ],
      }
    }

    const { workspaceId, ipType = 'IPV4', checkChannel = 'IP123.in', ...proxyData } = params
    const proxyParams = {
      workspaceId,
      ...proxyData,
      ipType,
      checkChannel: checkChannel ? channelList.find(item => item.label === checkChannel)?.value : null,
      proxyCategory: params.protocol,
    }

    const result = await request('/proxy/create', {
      method: 'POST',
      body: JSON.stringify(proxyParams),
    })

    let text = ''
    if (result.code !== 0) {
      if (result.data) {
        text = `❌ **Failed to create proxy:**\n\n error message: ${result.msg}\n\n${result.data.map((item: any) => `  - index: ${item.index}, error message: ${item.msg.join(', ')}`).join('\n')}`
      }
      else {
        text = `❌ **Failed to create proxy:**\n\n error message: ${result.msg}`
      }
    }
    else {
      text = `✅ **Proxy Created Successfully**

**Protocol:** ${params.protocol}
**Host:** ${params.host}:${params.port}${params.proxyUserName
  ? `
**Username:** ${params.proxyUserName}`
  : ''}${params.remark
  ? `
**Remark:** ${params.remark}`
  : ''}${params.checkChannel
  ? `
**Check Channel:** ${params.checkChannel}`
  : ''}

*Proxy configuration created. IP detection will be performed automatically.*`
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

class BatchCreateProxies {
  name = 'roxy_batch_create_proxies'
  description = 'Batch create multiple proxy configurations'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
      },
      // checkChannel: {
      //   type: 'string',
      //   enum: channelList.map(item => item.label),
      //   description: 'Default IP detection channel for all proxies',
      // },
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
      // checkStatus: 0, // 0 未检测 1 检测成功 2 检测失败
      // lastIp: '',
      // lastCity: '',
      // lastCountry: '',
      // timezone: '',
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

// class GetDetectChannels {
//   name = 'roxy_get_detect_channels'
//   description = 'Get available IP detection channels'
//   inputSchema = {
//     type: 'object',
//     properties: {
//       workspaceId: {
//         type: 'number',
//         description: 'Workspace ID',
//       },
//     },
//     required: ['workspaceId'],
//   }

//   get schema() {
//     return {
//       name: this.name,
//       description: this.description,
//       inputSchema: this.inputSchema,
//     }
//   }

//   async handle(params: any) {
//     if (!params.workspaceId) {
//       return {
//         content: [
//           {
//             type: 'text',
//             text: '❌ **Failed to get detect channels:**\n\n workspaceId is required',
//           },
//         ],
//       }
//     }

//     const searchParams = new URLSearchParams()
//     searchParams.append('workspaceId', params.workspaceId.toString())

//     const result = await request(`/proxy/detect_channel?${searchParams}`, {
//       method: 'GET',
//     })

//     const data = result.data

//     let text = ''
//     if (result.code !== 0) {
//       text = `❌ **Failed to get detect channels:**\n\n error message: ${result.msg}`
//     }
//     else {
//       const channelsText = data.checkChannel && data.checkChannel.length > 0
//         ? data.checkChannel.map((channel: any) => `- **${channel.label}** (${channel.value})`).join('\n')
//         : 'No detect channels available'

//       text = `📡 **Available IP Detection Channels**

// ${channelsText}

// *These channels are used to detect proxy IP information (location, ISP, etc.).*`
//     }

//     return {
//       content: [
//         {
//           type: 'text',
//           text,
//         },
//       ],
//     }
//   }
// }

export const proxyList = new ProxyList()
export const proxyStore = new ProxyStore()
export const createProxy = new CreateProxy()
export const batchCreateProxies = new BatchCreateProxies()
export const detectProxy = new DetectProxy()
export const modifyProxy = new ModifyProxy()
export const deleteProxies = new DeleteProxies()
// export const getDetectChannels = new GetDetectChannels()
