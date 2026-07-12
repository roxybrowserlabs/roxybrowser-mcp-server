import {
  batchCreateAccounts,
  createAccount,
  deleteAccounts,
  listAccounts,
  modifyAccount,
} from '../modules/account.js'
import {
  batchCreateBrowsers,
  clearLocalCache,
  clearServerCache,
  closeBrowsers,
  createBrowser,
  deleteBrowsers,
  getBrowserDetail,
  getConnectionInfo,
  listBrowsers,
  listLabels,
  openBrowser,
  updateBrowser,
} from '../modules/browser.js'
import { healthCheck, listProjects, listWorkspaces } from '../modules/other.js'
import {
  createProxies,
  deleteProxies,
  detectProxy,
  modifyProxy,
  proxyDetail,
  proxyList,
} from '../modules/proxy.js'
import type { ToolDefinition } from '../runtime/index.js'
import { adaptLegacyTool } from './adapters.js'

export const ROXY_TOOLS_V2: ToolDefinition[] = [
  adaptLegacyTool({
    name: 'workspace.list',
    scope: 'global',
    legacyTool: listWorkspaces,
    isAvailable: context => context.workspaceId === undefined,
  }),
  adaptLegacyTool({
    name: 'project.list',
    scope: 'workspace',
    legacyTool: listProjects,
    isAvailable: context => context.workspaceId !== undefined,
  }),
  adaptLegacyTool({ name: 'health.check', scope: 'global', legacyTool: healthCheck }),

  adaptLegacyTool({ name: 'browser.list', scope: 'workspace', legacyTool: listBrowsers }),
  adaptLegacyTool({ name: 'browser.create', scope: 'workspace', legacyTool: createBrowser }),
  adaptLegacyTool({
    name: 'browser.batch_create',
    scope: 'workspace',
    legacyTool: batchCreateBrowsers,
    contextBindings: [{ name: 'workspaceId', location: 'arrayItems', arrayProperty: 'browsers' }],
  }),
  adaptLegacyTool({ name: 'browser.open', scope: 'workspace', legacyTool: openBrowser }),
  adaptLegacyTool({ name: 'browser.close', scope: 'global', legacyTool: closeBrowsers }),
  adaptLegacyTool({ name: 'browser.update', scope: 'workspace', legacyTool: updateBrowser }),
  adaptLegacyTool({ name: 'browser.delete', scope: 'workspace', legacyTool: deleteBrowsers }),
  adaptLegacyTool({ name: 'browser.detail', scope: 'workspace', legacyTool: getBrowserDetail }),
  adaptLegacyTool({ name: 'browser.connection_info', scope: 'global', legacyTool: getConnectionInfo }),
  adaptLegacyTool({ name: 'browser.clear_local_cache', scope: 'global', legacyTool: clearLocalCache }),
  adaptLegacyTool({ name: 'browser.clear_server_cache', scope: 'workspace', legacyTool: clearServerCache }),
  adaptLegacyTool({ name: 'browser.list_labels', scope: 'workspace', legacyTool: listLabels }),

  adaptLegacyTool({ name: 'proxy.list', scope: 'workspace', legacyTool: proxyList }),
  adaptLegacyTool({ name: 'proxy.detail', scope: 'workspace', legacyTool: proxyDetail }),
  adaptLegacyTool({ name: 'proxy.create', scope: 'workspace', legacyTool: createProxies }),
  adaptLegacyTool({ name: 'proxy.detect', scope: 'workspace', legacyTool: detectProxy }),
  adaptLegacyTool({ name: 'proxy.modify', scope: 'workspace', legacyTool: modifyProxy }),
  adaptLegacyTool({ name: 'proxy.delete', scope: 'workspace', legacyTool: deleteProxies }),

  adaptLegacyTool({ name: 'account.list', scope: 'workspace', legacyTool: listAccounts }),
  adaptLegacyTool({ name: 'account.create', scope: 'workspace', legacyTool: createAccount }),
  adaptLegacyTool({ name: 'account.batch_create', scope: 'workspace', legacyTool: batchCreateAccounts }),
  adaptLegacyTool({ name: 'account.modify', scope: 'workspace', legacyTool: modifyAccount }),
  adaptLegacyTool({ name: 'account.delete', scope: 'workspace', legacyTool: deleteAccounts }),
]
