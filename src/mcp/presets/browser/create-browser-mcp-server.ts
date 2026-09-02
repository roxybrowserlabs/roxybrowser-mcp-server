import { RoxyBrowserClient } from "../../../sdk/index.js";
import { RoxyPresetMcpServer, withToolVersions } from "../../runtime/index.js";
import { BROWSER_MCP_TOOLS } from "./tools.js";
import type { CreateMcpServerOptions, McpContext } from "../../runtime/index.js";
import { hostWithPort } from "./workspace-utils.js";

export interface CreateRoxyBrowserMcpServerOptions extends Partial<CreateMcpServerOptions> {
  /** Roxy HTTP request timeout in milliseconds. Overrides roxy.timeout. */
  timeout?: number;
  /** Only expose MCP tools whose public names are listed. */
  includeTools?: readonly string[];
  /** Hide MCP tools whose public names are listed. Applied after includeTools. */
  excludeTools?: readonly string[];
}

export function createRoxyBrowserMcpServer(
  options: CreateRoxyBrowserMcpServerOptions = {},
): RoxyPresetMcpServer {
  const browserOptions = {
    ...options.roxy,
    timeout: options.timeout ?? options.roxy?.timeout,
    workspaceId: undefined,
  };
  const initialApiHost =
    browserOptions.apiHost ?? browserOptions.baseUrl ?? "http://127.0.0.1:50000";
  const createBrowser = (overrides: ConstructorParameters<typeof RoxyBrowserClient>[0] = {}) =>
    new RoxyBrowserClient({ ...browserOptions, ...overrides });
  let tools = options.tools ? options.tools : BROWSER_MCP_TOOLS;
  if (options.includeTools) {
    const included = new Set(options.includeTools);
    tools = tools.filter((tool) => included.has(tool.name));
  }
  if (options.excludeTools) {
    const excluded = new Set(options.excludeTools);
    tools = tools.filter((tool) => !excluded.has(tool.name));
  }
  const browser = createBrowser();
  const shouldInitialize = !options.tools;
  return new RoxyPresetMcpServer(
    {
      name: options.name ?? "roxybrowser-mcp",
      version: options.version,
      roxyBrowserVersion: options.roxyBrowserVersion,
      roxy: options.roxy,
      context: options.context,
      tools: withToolVersions(tools),
    },
    {
      browser,
      createBrowser,
      apiHost: initialApiHost,
      ...(shouldInitialize
        ? {
            initialize: async (context: McpContext) => {
              const active = await context.browser!.workspaces.getActive();
              context.workspaceId = active.id;
              const apiHost = hostWithPort(initialApiHost, active.port);
              if (apiHost) {
                context.apiHost = apiHost;
                context.browser = createBrowser({
                  workspaceId: active.id,
                  apiHost,
                  baseUrl: apiHost,
                });
              } else {
                context.browser = createBrowser({ workspaceId: active.id });
              }
            },
          }
        : {}),
    },
  );
}
