import { request } from '../utils/index.js'

class ListAccounts {
  name = 'roxy_list_accounts'
  description = 'Get list of accounts (platform credentials) in specified workspace'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
      },
      accountId: {
        type: 'number',
        description: 'Account ID to filter by',
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
    if (params.accountId)
      searchParams.append('accountId', params.accountId.toString())
    if (params.pageIndex)
      searchParams.append('page_index', params.pageIndex.toString())
    if (params.pageSize)
      searchParams.append('page_size', params.pageSize.toString())

    const result = await request(`/account/list?${searchParams}`, {
      method: 'GET',
    })

    const data = result.data

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Failed to list accounts:**\n\n error message: ${result.msg}`
    }
    else {
      const currentPage = params.pageIndex ?? 1
      const pageSize = params.pageSize ?? 15
      const totalPages = Math.max(1, Math.ceil((data.total || 0) / pageSize))
      const hasNextPage = currentPage < totalPages

      text = `Found ${data.total} accounts in workspace ${params.workspaceId}:

${
        data.rows.map((account: any) =>
          `**${account.platformName}** (ID: ${account.id})\n`
          + `  - Username: ${account.platformUserName}\n`
          + `  - Platform URL: ${account.platformUrl}\n`
          + `  - Remarks: ${account.platformRemarks || 'N/A'}\n`
          + `  - Created: ${account.createTime}`,
        ).join('\n\n')}

Pagination:
- currentPage: ${currentPage}
- pageSize: ${pageSize}
- totalPages: ${totalPages}
- hasNextPage: ${hasNextPage}
${hasNextPage ? `- nextPageHint: Call roxy_list_accounts again with pageIndex=${currentPage + 1}` : '- nextPageHint: No more pages'}`
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

class CreateAccount {
  name = 'roxy_create_account'
  description = 'Create a new platform account with credentials'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
      },
      platformUrl: {
        type: 'string',
        description: 'Business platform URL (e.g., https://www.tiktok.com/)',
      },
      platformUserName: {
        type: 'string',
        description: 'Account username',
      },
      platformPassword: {
        type: 'string',
        description: 'Account password',
      },
      platformEfa: {
        type: 'string',
        description: 'Account EFA',
      },
      platformCookies: {
        type: 'array',
        description: 'Account cookies',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            value: { type: 'string' },
            domain: { type: 'string' },
          },
          required: ['name', 'value', 'domain'],
        },
      },
      platformName: {
        type: 'string',
        description: 'Platform name',
      },
      platformRemarks: {
        type: 'string',
        description: 'Platform remarks/notes',
      },
    },
    required: ['workspaceId', 'platformUrl', 'platformUserName', 'platformPassword'],
  }

  get schema() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  async handle(params: any) {
    if (!params.workspaceId || !params.platformUrl || !params.platformUserName || !params.platformPassword) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ **Failed to create account:**\n\n workspaceId, platformUrl, platformUserName, and platformPassword are required',
          },
        ],
      }
    }

    const { workspaceId, ...accountData } = params

    const result = await request('/account/create', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, ...accountData }),
    })

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Failed to create account:**\n\n error message: ${result.msg}`
    }
    else {
      text = `✅ **Account Created Successfully**

**Platform:** ${params.platformName || params.platformUrl}
**Username:** ${params.platformUserName}
**Platform URL:** ${params.platformUrl}${params.platformRemarks
  ? `
**Remarks:** ${params.platformRemarks}`
  : ''}${params.platformEfa
  ? `
**EFA:** ${params.platformEfa}`
  : ''}${params.platformCookies && params.platformCookies.length > 0
  ? `
**Cookies:** ${params.platformCookies.length} cookie(s)`
  : ''}

*Account has been created successfully.*`
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

class BatchCreateAccounts {
  name = 'roxy_batch_create_accounts'
  description = 'Batch create multiple platform accounts'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
      },
      accountList: {
        type: 'array',
        description: 'Array of account configurations',
        items: {
          type: 'object',
          properties: {
            platformUrl: { type: 'string' },
            platformUserName: { type: 'string' },
            platformPassword: { type: 'string' },
            platformEfa: { type: 'string' },
            platformCookies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  value: { type: 'string' },
                  domain: { type: 'string' },
                },
                required: ['name', 'value', 'domain'],
              },
            },
            platformName: { type: 'string' },
            platformRemarks: { type: 'string' },
          },
          required: ['platformUrl', 'platformUserName', 'platformPassword'],
        },
      },
    },
    required: ['workspaceId', 'accountList'],
  }

  get schema() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  async handle(params: any) {
    if (!params.workspaceId || !params.accountList || params.accountList.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ **Failed to batch create accounts:**\n\n workspaceId and accountList are required',
          },
        ],
      }
    }

    const { workspaceId, accountList } = params

    const result = await request('/account/batch_create', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, accountList }),
    })

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Failed to batch create accounts:**\n\n error message: ${result.msg}`
    }
    else {
      text = `✅ **Batch Account Creation Successful**

**Count:** ${params.accountList.length} account(s)
**Workspace:** ${params.workspaceId}

*All accounts have been created successfully.*`
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

class ModifyAccount {
  name = 'roxy_modify_account'
  description = 'Modify/update an existing platform account'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
      },
      id: {
        type: 'number',
        description: 'Account ID to modify',
      },
      platformUrl: {
        type: 'string',
        description: 'Business platform URL',
      },
      platformUserName: {
        type: 'string',
        description: 'Account username',
      },
      platformPassword: {
        type: 'string',
        description: 'Account password',
      },
      platformEfa: {
        type: 'string',
        description: 'Account EFA',
      },
      platformCookies: {
        type: 'array',
        description: 'Account cookies',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            value: { type: 'string' },
            domain: { type: 'string' },
          },
          required: ['name', 'value', 'domain'],
        },
      },
      platformName: {
        type: 'string',
        description: 'Platform name',
      },
      platformRemarks: {
        type: 'string',
        description: 'Platform remarks/notes',
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
            text: '❌ **Failed to modify account:**\n\n workspaceId and id are required',
          },
        ],
      }
    }

    const { workspaceId, ...accountData } = params

    const result = await request('/account/modify', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, ...accountData }),
    })

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Failed to modify account:**\n\n error message: ${result.msg}`
    }
    else {
      text = `✅ **Account Modified Successfully**

**Account ID:** ${params.id}${params.platformName
  ? `
**Platform:** ${params.platformName}`
  : ''}${params.platformUrl
  ? `
**Platform URL:** ${params.platformUrl}`
  : ''}${params.platformUserName
  ? `
**Username:** ${params.platformUserName}`
  : ''}${params.platformRemarks
  ? `
**Remarks:** ${params.platformRemarks}`
  : ''}

*Account configuration has been updated.*`
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

class DeleteAccounts {
  name = 'roxy_delete_accounts'
  description = 'Delete one or more platform accounts'
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
        description: 'Array of account IDs to delete',
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
            text: '❌ **Failed to delete accounts:**\n\n workspaceId and ids are required',
          },
        ],
      }
    }

    const { workspaceId, ids } = params

    const result = await request('/account/delete', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, ids }),
    })

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Failed to delete accounts:**\n\n error message: ${result.msg}`
    }
    else {
      text = `✅ **Accounts Deleted Successfully**

**Count:** ${params.ids.length} account(s)
**Workspace:** ${params.workspaceId}

**Deleted Account IDs:**
${params.ids.map((id: number, index: number) => `  ${index + 1}. ${id}`).join('\n')}

⚠️ **Warning:** Deleted accounts cannot be recovered.`
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

export const listAccounts = new ListAccounts()
export const createAccount = new CreateAccount()
export const batchCreateAccounts = new BatchCreateAccounts()
export const modifyAccount = new ModifyAccount()
export const deleteAccounts = new DeleteAccounts()
