import { RoxyBrowserClient } from "../../../sdk/index.js";
import { RoxyPresetMcpServer, withToolVersions } from "../../runtime/index.js";
import { BROWSER_MCP_TOOLS } from "./tools.js";
import type { CreateMcpServerOptions, McpContext } from "../../runtime/index.js";

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
      ...(shouldInitialize
        ? {
            initialize: async (context: McpContext) => {
              const active = await context.browser!.workspaces.getActive();
              context.workspaceId = active.id;
              context.browser = createBrowser({ workspaceId: active.id });
            },
          }
        : {}),
    },
  );
}
