import { request } from '../utils/index.js'
import { proxyList, proxyStore } from './proxy.js'

const osversion_windows = [
  {
    label: '11',
    type: 'osVersion-Windows',
    value: '11',
  },
  {
    label: '10',
    type: 'osVersion-Windows',
    value: '10',
  },
  {
    label: '8',
    type: 'osVersion-Windows',
    value: '8',
  },
  {
    label: '7',
    type: 'osVersion-Windows',
    value: '7',
  },
]

const osversion_macos = [
  {
    label: '15.3.2',
    type: 'osVersion-macOS',
    value: '15.3.2',
  },
  {
    label: '15.3.1',
    type: 'osVersion-macOS',
    value: '15.3.1',
  },
  {
    label: '15.3',
    type: 'osVersion-macOS',
    value: '15.3',
  },
  {
    label: '15.2',
    type: 'osVersion-macOS',
    value: '15.2',
  },
  {
    label: '15.1',
    type: 'osVersion-macOS',
    value: '15.1',
  },
  {
    label: '15.0.1',
    type: 'osVersion-macOS',
    value: '15.0.1',
  },
  {
    label: '15.0',
    type: 'osVersion-macOS',
    value: '15.0',
  },
  {
    label: '14.7.4',
    type: 'osVersion-macOS',
    value: '14.7.4',
  },
  {
    label: '14.7.3',
    type: 'osVersion-macOS',
    value: '14.7.3',
  },
  {
    label: '14.7.2',
    type: 'osVersion-macOS',
    value: '14.7.2',
  },
  {
    label: '14.7.1',
    type: 'osVersion-macOS',
    value: '14.7.1',
  },
  {
    label: '14.7',
    type: 'osVersion-macOS',
    value: '14.7',
  },
  {
    label: '14.6.1',
    type: 'osVersion-macOS',
    value: '14.6.1',
  },
  {
    label: '14.6',
    type: 'osVersion-macOS',
    value: '14.6',
  },
  {
    label: '14.5',
    type: 'osVersion-macOS',
    value: '14.5',
  },
  {
    label: '14.4.1',
    type: 'osVersion-macOS',
    value: '14.4.1',
  },
  {
    label: '14.4',
    type: 'osVersion-macOS',
    value: '14.4',
  },
  {
    label: '14.3.1',
    type: 'osVersion-macOS',
    value: '14.3.1',
  },
  {
    label: '14.3',
    type: 'osVersion-macOS',
    value: '14.3',
  },
  {
    label: '14.2.1',
    type: 'osVersion-macOS',
    value: '14.2.1',
  },
  {
    label: '14.2',
    type: 'osVersion-macOS',
    value: '14.2',
  },
  {
    label: '14.1',
    type: 'osVersion-macOS',
    value: '14.1',
  },
  {
    label: '13.7.4',
    type: 'osVersion-macOS',
    value: '13.7.4',
  },
  {
    label: '13.7.3',
    type: 'osVersion-macOS',
    value: '13.7.3',
  },
  {
    label: '13.7.2',
    type: 'osVersion-macOS',
    value: '13.7.2',
  },
  {
    label: '13.7.1',
    type: 'osVersion-macOS',
    value: '13.7.1',
  },
  {
    label: '13.7',
    type: 'osVersion-macOS',
    value: '13.7',
  },
  {
    label: 'ALL',
    type: 'osVersion-macOS',
    value: 'ALL',
  },
]

const osversion_linux = [
  {
    label: 'ALL',
    type: 'osVersion-Linux',
    value: 'ALL',
  },
]

const osversion_android = [
  {
    label: '15',
    type: 'osVersion-Android',
    value: '15',
  },
  {
    label: '14',
    type: 'osVersion-Android',
    value: '14',
  },
  {
    label: '13',
    type: 'osVersion-Android',
    value: '13',
  },
  {
    label: '12',
    type: 'osVersion-Android',
    value: '12',
  },
  {
    label: '11',
    type: 'osVersion-Android',
    value: '11',
  },
  {
    label: '10',
    type: 'osVersion-Android',
    value: '10',
  },
  {
    label: '9',
    type: 'osVersion-Android',
    value: '9',
  },
]

const osversion_ios = [
  {
    label: '18.2',
    type: 'osVersion-IOS',
    value: '18.2',
  },
  {
    label: '18.1',
    type: 'osVersion-IOS',
    value: '18.1',
  },
  {
    label: '18.0',
    type: 'osVersion-IOS',
    value: '18.0',
  },
  {
    label: '17.0',
    type: 'osVersion-IOS',
    value: '17.0',
  },
  {
    label: '16.6',
    type: 'osVersion-IOS',
    value: '16.6',
  },
  {
    label: '16.5',
    type: 'osVersion-IOS',
    value: '16.5',
  },
  {
    label: '16.4',
    type: 'osVersion-IOS',
    value: '16.4',
  },
  {
    label: '16.3',
    type: 'osVersion-IOS',
    value: '16.3',
  },
  {
    label: '16.2',
    type: 'osVersion-IOS',
    value: '16.2',
  },
  {
    label: '16.1',
    type: 'osVersion-IOS',
    value: '16.1',
  },
  {
    label: '16.0',
    type: 'osVersion-IOS',
    value: '16.0',
  },
  {
    label: '15.7',
    type: 'osVersion-IOS',
    value: '15.7',
  },
  {
    label: '15.6',
    type: 'osVersion-IOS',
    value: '15.6',
  },
  {
    label: '15.5',
    type: 'osVersion-IOS',
    value: '15.5',
  },
  {
    label: '15.4',
    type: 'osVersion-IOS',
    value: '15.4',
  },
  {
    label: '15.3',
    type: 'osVersion-IOS',
    value: '15.3',
  },
  {
    label: '15.2',
    type: 'osVersion-IOS',
    value: '15.2',
  },
  {
    label: '15.1',
    type: 'osVersion-IOS',
    value: '15.1',
  },
  {
    label: '15.0',
    type: 'osVersion-IOS',
    value: '15.0',
  },
  {
    label: '14.7',
    type: 'osVersion-IOS',
    value: '14.7',
  },
  {
    label: '14.6',
    type: 'osVersion-IOS',
    value: '14.6',
  },
  {
    label: '14.5',
    type: 'osVersion-IOS',
    value: '14.5',
  },
  {
    label: '14.4',
    type: 'osVersion-IOS',
    value: '14.4',
  },
  {
    label: '14.3',
    type: 'osVersion-IOS',
    value: '14.3',
  },
  {
    label: '14.2',
    type: 'osVersion-IOS',
    value: '14.2',
  },
  {
    label: '14.1',
    type: 'osVersion-IOS',
    value: '14.1',
  },
  {
    label: '14.0',
    type: 'osVersion-IOS',
    value: '14.0',
  },
]

const coreVersion = [
  {
    label: 'RoxyChrome 144',
    type: 'coreVersion',
    value: '144',
  },
  {
    label: 'RoxyChrome 143',
    type: 'coreVersion',
    value: '143',
  },
  {
    label: 'RoxyChrome 142',
    type: 'coreVersion',
    value: '142',
  },
  {
    label: 'RoxyChrome 141',
    type: 'coreVersion',
    value: '141',
  },
  {
    label: 'RoxyChrome 140',
    type: 'coreVersion',
    value: '140',
  },
  {
    label: 'RoxyChrome 139',
    type: 'coreVersion',
    value: '139',
  },
  {
    label: 'RoxyChrome 138',
    type: 'coreVersion',
    value: '138',
  },
  {
    label: 'RoxyChrome 137',
    type: 'coreVersion',
    value: '137',
  },
  {
    label: 'RoxyChrome 136',
    type: 'coreVersion',
    value: '136',
  },
  {
    label: 'RoxyChrome 135',
    type: 'coreVersion',
    value: '135',
  },
  {
    label: 'RoxyChrome 133',
    type: 'coreVersion',
    value: '133',
  },
  {
    label: 'RoxyChrome 130',
    type: 'coreVersion',
    value: '130',
  },
  {
    label: 'RoxyChrome 125',
    type: 'coreVersion',
    value: '125',
  },
  {
    label: 'RoxyChrome 117',
    type: 'coreVersion',
    value: '117',
  },
  {
    label: 'RoxyChrome 109',
    type: 'coreVersion',
    value: '109',
  },
]

function osVersionString() {
  return `Windows: ${osversion_windows.map(item => item.value).join(',')}; macOS: ${osversion_macos.map(item => item.value).join(',')}; Linux: ${osversion_linux.map(item => item.value).join(',')}; Android: ${osversion_android.map(item => item.value).join(',')}; IOS: ${osversion_ios.map(item => item.value).join(',')}`
}

class CreateBrowser {
  name = 'roxy_create_browser'
  description = 'Create a browser with complete configuration control - for expert users needing full parameter access'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
      },
      windowName: {
        type: 'string',
        description: 'Browser window name',
      },
      coreVersion: {
        type: 'string',
        enum: coreVersion.map(item => item.value),
        description: 'Browser core version. If not provided, the latest available core version will be used.',
      },
      os: {
        type: 'string',
        enum: ['Windows', 'macOS', 'Linux', 'IOS', 'Android'],
        description: 'Operating system (default: Windows)',
      },
      osVersion: {
        type: 'string',
        description: osVersionString(),
      },
      userAgent: {
        type: 'string',
        description: 'Custom user agent',
      },
      cookie: {
        type: 'array',
        description: 'Cookie list',
        items: { type: 'object' },
      },
      searchEngine: {
        type: 'string',
        enum: ['Google', 'Microsoft Bing', 'Yahoo', 'Yandex', 'DuckDuckGo'],
        description: 'Default search engine',
      },
      labelIds: {
        type: 'array',
        items: { type: 'number' },
        description: 'Label IDs to assign',
      },
      defaultOpenUrl: {
        type: 'array',
        items: { type: 'string' },
        description: 'URLs to open by default',
      },
      windowRemark: {
        type: 'string',
        description: 'Window remarks/notes',
      },
      projectId: {
        type: 'number',
        description: 'Project ID',
      },
      windowPlatformList: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            // 平台账号id，非必传，通过平台账号列表接口【roxy_list_accounts】获取，可以判定已在平台账号列表中的账号，有该参数时其他参数不需要传。
            id: { type: 'number', description: 'Platform account ID, which can be obtained from [roxy_list_accounts] (field: id). Used to bind an account that already exists in the platform account list. If this parameter is provided, other parameters do not need to be passed.' },
            platformUrl: { type: 'string', description: 'Platform URL' },
            platformUserName: { type: 'string', description: 'Platform username' },
            platformPassword: { type: 'string', description: 'Platform password' },
            platformEfa: { type: 'string', description: 'Platform EFA' },
            platformRemarks: { type: 'string', description: 'Platform remarks' },
          },
        },
        description: 'Platform account information',
      },
      proxyInfo: {
        type: 'object',
        description: 'Complete proxy configuration object',
        properties: {
          // 如果有 moduleId ，则其他参数不可传递 (moduleId 可通过 roxy_list_proxies 或 roxy_store_proxies 获取) 优先使用该参数来绑定代理IP
          moduleId: { type: 'number', description: `If moduleId is provided, no other parameters may be passed. (moduleId can be obtained via ${proxyList.name} or ${proxyStore.name}. field: id) Priority to use this parameter to bind proxy IP` },
          proxyMethod: { type: 'string', enum: ['custom', 'choose', 'api'] },
          proxyCategory: { type: 'string', enum: ['noproxy', 'HTTP', 'HTTPS', 'SOCKS5', 'SSH'] },
          ipType: { type: 'string', enum: ['IPV4', 'IPV6'] },
          protocol: { type: 'string', enum: ['HTTP', 'HTTPS', 'SOCKS5'] },
          host: { type: 'string' },
          port: { type: 'string' },
          proxyUserName: { type: 'string' },
          proxyPassword: { type: 'string' },
          refreshUrl: { type: 'string' },
          checkChannel: { type: 'string', enum: ['IPRust.io', 'IP-API', 'IP123.in'] },
        },
      },
      fingerInfo: {
        type: 'object',
        description: 'Complete fingerprint configuration',
        properties: {
          // Language and timezone
          isLanguageBaseIp: { type: 'boolean', description: 'Follow IP for browser language' },
          language: { type: 'string', description: 'Custom browser language' },
          isDisplayLanguageBaseIp: { type: 'boolean', description: 'Follow IP for display language' },
          displayLanguage: { type: 'string', description: 'Custom display language' },
          isTimeZone: { type: 'boolean', description: 'Follow IP for timezone' },
          timeZone: { type: 'string', description: 'Custom timezone' },

          // Geolocation
          position: { type: 'number', enum: [0, 1, 2], description: 'Geolocation prompt: 0=ask, 1=allow, 2=deny' },
          isPositionBaseIp: { type: 'boolean', description: 'Follow IP for geolocation' },
          longitude: { type: 'string', description: 'Custom longitude' },
          latitude: { type: 'string', description: 'Custom latitude' },
          precisionPos: { type: 'string', description: 'Precision in meters' },

          // Media settings
          forbidAudio: { type: 'boolean', description: 'Enable/disable sound' },
          forbidImage: { type: 'boolean', description: 'Enable/disable image loading' },
          forbiddenPictureSize: { type: 'number', description: 'Image load size threshold (KB, positive integer). When forbidImage is false, set forbiddenPictureSize = 0 to disable all image loading. Default 0.' },
          forbidMedia: { type: 'boolean', description: 'Enable/disable video playback' },

          // Window settings
          openWidth: { type: 'string', description: 'Window width' },
          openHeight: { type: 'string', description: 'Window height' },
          openBookmarks: { type: 'boolean', description: 'Enable bookmarks' },
          positionSwitch: { type: 'boolean', description: 'Window position switch' },
          windowRatioPosition: { type: 'string', description: 'Window position ratio' },
          isDisplayName: { type: 'boolean', description: 'Show window name in title bar' },

          // Sync settings
          syncBookmark: { type: 'boolean', description: 'Sync bookmarks' },
          syncHistory: { type: 'boolean', description: 'Sync history' },
          syncTab: { type: 'boolean', description: 'Sync tabs' },
          syncCookie: { type: 'boolean', description: 'Sync cookies' },
          syncExtensions: { type: 'boolean', description: 'Sync extensions' },
          syncPassword: { type: 'boolean', description: 'Sync saved passwords' },
          syncIndexedDb: { type: 'boolean', description: 'Sync IndexedDB' },
          syncLocalStorage: { type: 'boolean', description: 'Sync LocalStorage' },

          // Cleanup settings
          clearCacheFile: { type: 'boolean', description: 'Clear cache files on startup' },
          clearCookie: { type: 'boolean', description: 'Clear cookies on startup' },
          clearLocalStorage: { type: 'boolean', description: 'Clear LocalStorage on startup' },

          // Advanced settings
          randomFingerprint: { type: 'boolean', description: 'Generate random fingerprint' },
          forbidSavePassword: { type: 'boolean', description: 'Disable password save prompts' },
          stopOpenNet: { type: 'boolean', description: 'Stop opening if network fails' },
          stopOpenIP: { type: 'boolean', description: 'Stop opening if IP changes' },
          stopOpenPosition: { type: 'boolean', description: 'Stop opening if IP location changes' },
          openWorkbench: { type: 'number', enum: [0, 1, 2], description: 'Open workbench: 0=close, 1=open, 2=follow app' },

          // Display settings
          resolutionType: { type: 'boolean', description: 'Custom resolution vs follow system' },
          resolutionX: { type: 'string', description: 'Custom resolution width' },
          resolutionY: { type: 'string', description: 'Custom resolution height' },
          fontType: { type: 'boolean', description: 'Random fonts vs system fonts' },

          // Browser fingerprint settings
          webRTC: { type: 'number', enum: [0, 1, 2], description: 'WebRTC: 0=replace, 1=real, 2=disable' },
          webGL: { type: 'boolean', description: 'WebGL: random vs real' },
          webGLInfo: { type: 'boolean', description: 'WebGL info: custom vs real' },
          webGLManufacturer: { type: 'string', description: 'Custom WebGL manufacturer' },
          webGLRender: { type: 'string', description: 'Custom WebGL renderer' },
          webGpu: { type: 'string', enum: ['webgl', 'real', 'block'], description: 'WebGPU setting' },
          canvas: { type: 'boolean', description: 'Canvas: random vs real' },
          audioContext: { type: 'boolean', description: 'AudioContext: random vs real' },
          speechVoices: { type: 'boolean', description: 'Speech Voices: random vs real' },
          doNotTrack: { type: 'boolean', description: 'Enable Do Not Track' },
          clientRects: { type: 'boolean', description: 'ClientRects: random vs real' },
          deviceInfo: { type: 'boolean', description: 'Media devices: random vs real' },
          deviceNameSwitch: { type: 'boolean', description: 'Device names: random vs real' },
          macInfo: { type: 'boolean', description: 'MAC address: custom vs real' },

          // Hardware settings
          hardwareConcurrent: { type: 'string', description: 'Hardware concurrency' },
          deviceMemory: { type: 'string', description: 'Device memory' },

          // Security settings
          disableSsl: { type: 'boolean', description: 'SSL fingerprint settings' },
          disableSslList: { type: 'array', items: { type: 'string' }, description: 'SSL feature list' },
          portScanProtect: { type: 'boolean', description: 'Port scan protection' },
          portScanList: { type: 'string', description: 'Port scan whitelist' },
          useGpu: { type: 'boolean', description: 'Use GPU acceleration' },
          sandboxPermission: { type: 'boolean', description: 'Disable sandbox' },
          startupParam: { type: 'string', description: 'Browser startup parameters (--headless=new startup headless)' },
        },
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
    const result = await request('/browser/create', {
      method: 'POST',
      body: JSON.stringify(params),
    })

    const data = result.data

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Failed to create browser:**\n\n error message: ${result.msg}`
    }
    else {
      text = `✅ **Simple Browser Created**\n\n`
        + `**Browser ID:** \`${data.dirId}\`\n`
        + `*Use this browser ID with \`roxy_open_browsers\` to start the browser and get CDP endpoints for automation.*`
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

export const createBrowser = new CreateBrowser()

class BatchCreateBrowsers {
  name = 'roxy_batch_create_browsers'
  description = 'Create multiple browsers in batch by passing an array of browser configurations'
  inputSchema = {
    type: 'object',
    properties: {
      browsers: {
        type: 'array',
        description: 'Array of browser configuration objects to create',
        items: {
          type: 'object',
          properties: createBrowser.inputSchema.properties,
          required: ['workspaceId'],
        },
      },
    },
    required: ['browsers'],
  }

  get schema() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  async handle(params: any) {
    if (!Array.isArray(params.browsers) || params.browsers.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ **Failed to create browsers:**\n\n browsers array is required and must not be empty',
          },
        ],
      }
    }

    const results: Array<{
      index: number
      success: boolean
      dirId?: string
      error?: string
    }> = []

    const createPromises = params.browsers.map(async (browserParams: any, index: number) => {
      try {
        const result = await request('/browser/create', {
          method: 'POST',
          body: JSON.stringify(browserParams),
        })

        if (result.code !== 0) {
          return {
            index,
            success: false,
            error: result.msg,
          }
        }

        return {
          index,
          success: true,
          dirId: result.data?.dirId,
        }
      }
      catch (error: any) {
        return {
          index,
          success: false,
          error: error.message || 'Unknown error',
        }
      }
    })

    const createResults = await Promise.all(createPromises)
    results.push(...createResults)

    const successResults = results.filter(r => r.success)
    const failureResults = results.filter(r => !r.success)

    const successText = successResults.length > 0
      ? `✅ **Successfully created ${successResults.length} browsers**\n\n${
        successResults.map(r =>
          `  - #${r.index + 1}${r.dirId ? ` (ID: \`${r.dirId}\`)` : ''}`,
        ).join('\n')}`
      : ''

    const failureText = failureResults.length > 0
      ? `❌ **Failed to create ${failureResults.length} browsers:**\n\n${
        failureResults.map(r =>
          `  - #${r.index + 1}: ${r.error}`,
        ).join('\n')}`
      : ''

    const summaryLines = [
      `**Total Requests:** ${results.length}`,
      `**Success:** ${successResults.length}`,
      `**Failed:** ${failureResults.length}`,
      '',
      ...[successText, failureText].filter(Boolean),
    ]

    const summaryText = summaryLines.join('\n')

    return {
      content: [
        {
          type: 'text',
          text: summaryText,
        },
      ],
    }
  }
}

export const batchCreateBrowsers = new BatchCreateBrowsers()

class UpdateBrowser {
  name = 'roxy_update_browser'
  description = 'Update a browser with complete configuration control - for expert users needing full parameter access'
  inputSchema = {
    type: 'object',
    properties: {
      ...createBrowser.inputSchema.properties,
    },
    required: ['workspaceId', 'dirId'],
  }

  get schema() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  async handle(params: any) {
    const result = await request('/browser/mdf', {
      method: 'POST',
      body: JSON.stringify(params),
    })

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Failed to update browser:**\n\n error message: ${result.msg}`
    }
    else {
      text = '✅ **Browser Updated Successfully**'
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

class OpenBrowser {
  name = 'roxy_open_browsers'
  description = 'Open one or multiple browsers and return their CDP WebSocket endpoints for automation'

  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
      },
      dirIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of browser directory IDs to open',
      },
      forceOpen: {
        type: 'boolean',
        // 即使浏览器已被其他用户打开，还是强制打开
        description: 'Force open browser even if it is already opened by other users (default: true)',
        default: true,
      },
      args: {
        type: 'array',
        items: { type: 'string' },
        description: 'Optional browser startup arguments (--headless=new startup headless)',
      },
    },
    required: ['workspaceId', 'dirIds'],
  }

  get schema() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  async handle(params: any) {
    const { workspaceId, dirIds, forceOpen = true, args } = params

    if (!workspaceId || !Array.isArray(dirIds) || dirIds.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ **Failed to open browsers:**\n\n workspaceId and dirIds are required, and dirIds must not be empty',
          },
        ],
      }
    }

    const results: Array<{
      dirId: string
      success: boolean
      data?: any
      error?: string
    }> = []

    const openPromises = dirIds.map(async (dirId: string) => {
      try {
        const result = await request('/browser/open', {
          method: 'POST',
          body: JSON.stringify({
            workspaceId,
            dirId,
            forceOpen,
            args,
          }),
        })

        if (result.code !== 0) {
          return {
            dirId,
            success: false,
            error: result.msg,
          }
        }

        return {
          dirId,
          success: true,
          data: result.data,
        }
      }
      catch (error: any) {
        return {
          dirId,
          success: false,
          error: error.message || 'Unknown error',
        }
      }
    })

    const openResults = await Promise.all(openPromises)
    results.push(...openResults)

    const successResults = results.filter(r => r.success)
    const failureResults = results.filter(r => !r.success)

    const successText = successResults.length > 0
      ? [
          `✅ **Successfully opened ${successResults.length} browser(s):**`,
          '',
          ...successResults.map((r) => {
            const data = r.data || {}
            return [
              `**Browser ${data.dirId || r.dirId || 'Unknown'}** (PID:${data.pid ?? 'Unknown'})`,
              `  - CDP WebSocket: \`${data.ws ?? 'N/A'}\``,
              `  - HTTP Endpoint: \`${data.http ?? 'N/A'}\``,
              `  - Core Version: ${data.coreVersion ?? 'Unknown'}`,
            ].join('\n')
          }),
        ].join('\n')
      : ''

    const failureText = failureResults.length > 0
      ? [
          `❌ **Failed to open ${failureResults.length} browser(s):**`,
          '',
          ...failureResults.map(r =>
            `  - ${r.dirId}: ${r.error}`,
          ),
        ].join('\n')
      : ''

    const summaryLines = [
      `**Workspace:** ${workspaceId}`,
      `**Total Requests:** ${results.length}`,
      `**Success:** ${successResults.length}`,
      `**Failed:** ${failureResults.length}`,
      '',
      ...[successText, failureText].filter(Boolean),
    ]

    const summaryText = summaryLines.join('\n')

    return {
      content: [
        {
          type: 'text',
          text: summaryText,
        },
      ],
    }
  }
}

class ListBrowsers {
  name = 'roxy_list_browsers'
  description = 'Get list of browsers in specified workspace/project'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
      },
      projectIds: {
        type: 'string',
        description: 'Comma-separated project IDs',
      },
      windowName: {
        type: 'string',
        description: 'Filter by browser window name',
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
    if (params.projectIds)
      searchParams.append('projectIds', params.projectIds)
    if (params.windowName)
      searchParams.append('windowName', params.windowName)
    if (params.pageIndex)
      searchParams.append('page_index', params.pageIndex.toString())
    if (params.pageSize)
      searchParams.append('page_size', params.pageSize.toString())

    const result = await request(`/browser/list_v3?${searchParams}`, {
      method: 'GET',
    })

    const data = result.data

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Failed to list browsers:**\n\n error message: ${result.msg}`
    }
    else {
      text = `Found ${data.total} browsers in workspace ${params.workspaceId}:\n\n${
        data.rows.map((browser: any) =>
          `**${browser.windowName || 'Unnamed'}** (ID: ${browser.dirId})\n`
          + `  - Project: ${browser.projectId}\n`
          + `  - Sort: ${browser.sortNum}\n`
          + `  - OS: ${browser.os}\n`
          + `  - Status: ${browser.status}`,
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

class CloseBrowsers {
  name = 'roxy_close_browsers'
  description = 'Close multiple browsers by their directory IDs'
  inputSchema = {
    type: 'object',
    properties: {
      dirIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of browser directory IDs to close',
      },
    },
    required: ['dirIds'],
  }

  get schema() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  async handle(params: any) {
    if (!params.dirIds || params.dirIds.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ **Failed to close browsers:**\n\n dirIds are required',
          },
        ],
      }
    }

    const results: Array<{ dirId: string, success: boolean, error?: string }> = []

    // Close browsers in parallel
    const closePromises = params.dirIds.map(async (dirId: string) => {
      try {
        const result = await request('/browser/close', {
          method: 'POST',
          body: JSON.stringify({ dirId }),
        })

        if (result.code !== 0) {
          return { dirId, success: false, error: result.msg }
        }
        return { dirId, success: true }
      }
      catch (error: any) {
        return { dirId, success: false, error: error.message || 'Unknown error' }
      }
    })

    const closeResults = await Promise.all(closePromises)
    results.push(...closeResults)

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    const successText = successCount > 0
      ? `✅ Successfully closed ${successCount} browsers`
      : ''

    const failureText = failureCount > 0
      ? `❌ Failed to close ${failureCount} browsers:\n${
        results.filter(r => !r.success).map(r =>
          `  - ${r.dirId}: ${r.error}`,
        ).join('\n')}`
      : ''

    return {
      content: [
        {
          type: 'text',
          text: [successText, failureText].filter(Boolean).join('\n\n'),
        },
      ],
    }
  }
}

class DeleteBrowsers {
  name = 'roxy_delete_browsers'
  description = 'Delete multiple browsers permanently by their directory IDs'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
      },
      dirIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of browser directory IDs to delete',
      },
    },
    required: ['workspaceId', 'dirIds'],
  }

  get schema() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  async handle(params: any) {
    if (!params.workspaceId || !params.dirIds || params.dirIds.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ **Failed to delete browsers:**\n\n workspaceId and dirIds are required',
          },
        ],
      }
    }

    const result = await request('/browser/delete', {
      method: 'POST',
      body: JSON.stringify({
        workspaceId: params.workspaceId,
        dirIds: params.dirIds,
        isSoftDelete: true,
      }),
    })

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Browser Deletion Failed**\n\n`
        + `**Error:** ${result.msg}\n`
        + `**Workspace:** ${params.workspaceId}\n`
        + `**Failed Browsers:** ${params.dirIds.length}\n\n`
        + `**Browser IDs:**\n${
          params.dirIds.map((dirId: string, index: number) => `  ${index + 1}. \`${dirId}\``).join('\n')}`
    }
    else {
      text = `✅ **Browsers Deleted Successfully**\n\n`
        + `**Count:** ${params.dirIds.length} browser(s)\n`
        + `**Workspace:** ${params.workspaceId}\n\n`
        + `**Deleted Browsers:**\n${
          params.dirIds.map((dirId: string, index: number) => `  ${index + 1}. \`${dirId}\``).join('\n')
        }`
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

class GetBrowserDetail {
  name = 'roxy_get_browser_detail'
  description = 'Get detailed information for a specific browser window'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
      },
      dirId: {
        type: 'string',
        description: 'Browser directory ID',
      },
    },
    required: ['workspaceId', 'dirId'],
  }

  get schema() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  async handle(params: any) {
    if (!params.workspaceId || !params.dirId) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ **Failed to get browser detail:**\n\n workspaceId and dirId are required',
          },
        ],
      }
    }

    const searchParams = new URLSearchParams()
    searchParams.append('workspaceId', params.workspaceId.toString())
    searchParams.append('dirId', params.dirId)

    const result = await request(`/browser/detail?${searchParams}`, {
      method: 'GET',
    })

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Failed to get browser detail:**\n\n error message: ${result.msg}`
    }
    else {
      const detail = result.data.rows && result.data.rows.length > 0 ? result.data.rows[0] : null

      if (!detail) {
        text = '❌ **Browser not found or no data returned**'
      }
      else {
        // Save cookie count before removing cookies to save tokens
        const cookieCount = detail.cookie?.length || 0

        // Create a copy without cookies (cookies can be very large)
        const { cookie: _cookie, ...detailWithoutCookies } = detail

        // Create summary
        text = `**Browser Details Summary**\n\n`
          + `**ID:** \`${detail.dirId}\`\n`
          + `**Name:** ${detail.windowName}\n`
          + `**Sort Number:** ${detail.windowSortNum}\n`
          + `**Project:** ${detail.projectName} (ID: ${detail.projectId})\n`
          + `**OS:** ${detail.os} ${detail.osVersion}\n`
          + `**Core Version:** ${detail.coreVersion}\n`
          + `**Search Engine:** ${detail.searchEngine}\n`
          + `**Open Status:** ${detail.openStatus ? '✅ Opened' : '❌ Closed'}\n`
          + `**Cookies:** ${cookieCount} stored (excluded from response to save tokens)\n\n`
          + `**Full Details (JSON):**\n`
          + `\`\`\`json\n${
            JSON.stringify(detailWithoutCookies, null, 2)
          }\n\`\`\``
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

class ClearLocalCache {
  name = 'roxy_clear_local_cache'
  description = 'Clear local cache for specified browsers'
  inputSchema = {
    type: 'object',
    properties: {
      dirIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of browser directory IDs',
      },
    },
    required: ['dirIds'],
  }

  get schema() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  async handle(params: any) {
    if (!params.dirIds || params.dirIds.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ **Failed to clear local cache:**\n\n dirIds are required',
          },
        ],
      }
    }

    const result = await request('/browser/clear_local_cache', {
      method: 'POST',
      body: JSON.stringify({ dirIds: params.dirIds }),
    })

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Failed to clear local cache:**\n\n error message: ${result.msg}`
    }
    else {
      text = `✅ **Local Cache Cleared**

**Browser Count:** ${params.dirIds.length}

**Browser IDs:**
${params.dirIds.map((id: string, index: number) => `  ${index + 1}. \`${id}\``).join('\n')}`
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

class ClearServerCache {
  name = 'roxy_clear_server_cache'
  description = 'Clear server-side cache for specified browsers'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
      },
      dirIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of browser directory IDs',
      },
    },
    required: ['workspaceId', 'dirIds'],
  }

  get schema() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  async handle(params: any) {
    if (!params.workspaceId || !params.dirIds || params.dirIds.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ **Failed to clear server cache:**\n\n workspaceId and dirIds are required',
          },
        ],
      }
    }

    const result = await request('/browser/clear_server_cache', {
      method: 'POST',
      body: JSON.stringify({
        workspaceId: params.workspaceId,
        dirIds: params.dirIds,
      }),
    })

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Failed to clear server cache:**\n\n error message: ${result.msg}`
    }
    else {
      text = `✅ **Server Cache Cleared**

**Workspace:** ${params.workspaceId}
**Browser Count:** ${params.dirIds.length}

**Browser IDs:**
${params.dirIds.map((id: string, index: number) => `  ${index + 1}. \`${id}\``).join('\n')}`
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

class RandomFingerprint {
  name = 'roxy_random_fingerprint'
  description = 'Randomize browser fingerprint for a specific browser'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
      },
      dirId: {
        type: 'string',
        description: 'Browser directory ID',
      },
    },
    required: ['workspaceId', 'dirId'],
  }

  get schema() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  async handle(params: any) {
    if (!params.workspaceId || !params.dirId) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ **Failed to randomize fingerprint:**\n\n workspaceId and dirId are required',
          },
        ],
      }
    }

    const result = await request('/browser/random_env', {
      method: 'POST',
      body: JSON.stringify({
        workspaceId: params.workspaceId,
        dirId: params.dirId,
      }),
    })

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Failed to randomize fingerprint:**\n\n error message: ${result.msg}`
    }
    else {
      text = `✅ **Browser Fingerprint Randomized**

**Browser ID:** \`${params.dirId}\`
**Workspace:** ${params.workspaceId}

*Browser fingerprint has been randomized. Restart the browser to apply changes.*`
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

class ListLabels {
  name = 'roxy_list_labels'
  description = 'Get list of labels in specified workspace'
  inputSchema = {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'number',
        description: 'Workspace ID',
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
            text: '❌ **Failed to list labels:**\n\n workspaceId is required',
          },
        ],
      }
    }

    const searchParams = new URLSearchParams()
    searchParams.append('workspaceId', params.workspaceId.toString())

    const result = await request(`/browser/label?${searchParams}`, {
      method: 'GET',
    })

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Failed to list labels:**\n\n error message: ${result.msg}`
    }
    else {
      const labels = result.data || []
      text = `Found ${labels.length} labels in workspace ${params.workspaceId}:\n\n${
        labels.map((label: any) =>
          `**${label.name}** (ID: ${label.id})\n`
          + `  - Color: ${label.color}`,
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

class GetConnectionInfo {
  name = 'roxy_get_connection_info'
  description = 'Get connection information (CDP endpoints, PIDs) for currently opened browsers'
  inputSchema = {
    type: 'object',
    properties: {
      dirIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of browser directory IDs to query (optional, returns all if not specified)',
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
    const searchParams = new URLSearchParams()
    if (params.dirIds && params.dirIds.length > 0) {
      searchParams.append('dirIds', params.dirIds.join(','))
    }

    const queryString = searchParams.toString()
    const endpoint = queryString
      ? `/browser/connection_info?${queryString}`
      : '/browser/connection_info'

    const result = await request(endpoint, {
      method: 'GET',
    })

    let text = ''
    if (result.code !== 0) {
      text = `❌ **Failed to get connection info:**\n\n error message: ${result.msg}`
    }
    else {
      const connections = result.data || []

      if (connections.length === 0) {
        text = '⚠️ No opened browsers found.\n\nUse `roxy_open_browsers` to open browsers first.'
      }
      else {
        text = `Found ${connections.length} opened browser(s):\n\n${
          connections.map((conn: any) =>
            `**${conn.windowName || 'Unnamed'}** (${conn.dirId})\n`
            + `  - PID: ${conn.pid}\n`
            + `  - CDP WebSocket: \`${conn.ws}\`\n`
            + `  - HTTP Endpoint: \`${conn.http}\`\n`
            + `  - Core Version: ${conn.coreVersion}\n`
            + `  - Driver: ${conn.driver}`,
          ).join('\n\n')}`
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

export const openBrowser = new OpenBrowser()
export const updateBrowser = new UpdateBrowser()
export const listBrowsers = new ListBrowsers()
export const closeBrowsers = new CloseBrowsers()
export const deleteBrowsers = new DeleteBrowsers()
export const getBrowserDetail = new GetBrowserDetail()
export const clearLocalCache = new ClearLocalCache()
export const clearServerCache = new ClearServerCache()
export const randomFingerprint = new RandomFingerprint()
export const listLabels = new ListLabels()
export const getConnectionInfo = new GetConnectionInfo()
