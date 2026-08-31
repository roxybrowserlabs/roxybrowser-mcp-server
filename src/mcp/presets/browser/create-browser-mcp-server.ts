import { RoxyBrowserClient } from "../../../sdk/index.js";
import { RoxyPresetMcpServer, withToolVersions } from "../../runtime/index.js";
import { BROWSER_MCP_TOOLS } from "./tools.js";
import type { CreateMcpServerOptions } from "../../runtime/index.js";

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
  const workspaceId = options.roxy?.workspaceId ?? options.context?.workspaceId;
  const browserOptions = {
    ...options.roxy,
    timeout: options.timeout ?? options.roxy?.timeout,
    workspaceId,
  };
  const browser = new RoxyBrowserClient(browserOptions);
  let tools = options.tools
    ? options.tools
    : workspaceId === undefined
      ? BROWSER_MCP_TOOLS
      : BROWSER_MCP_TOOLS.filter((tool) => tool.name !== "roxy_workspace_list");
  if (options.includeTools) {
    const included = new Set(options.includeTools);
    tools = tools.filter((tool) => included.has(tool.name));
  }
  if (options.excludeTools) {
    const excluded = new Set(options.excludeTools);
    tools = tools.filter((tool) => !excluded.has(tool.name));
  }
  // A configured workspace is only a default. Allow callers to select another
  // workspace per request without requiring ROXY_WORKSPACE_ID at startup.
  if (!options.tools) {
    tools = tools.map((tool) =>
      tool.name === "roxy_workspace_list" ? tool : withWorkspaceOverride(tool, browserOptions),
    );
  }
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
      workspaceId,
    },
  );
}

function withWorkspaceOverride(
  tool: (typeof BROWSER_MCP_TOOLS)[number],
  browserOptions: ConstructorParameters<typeof RoxyBrowserClient>[0],
) {
  const schema = tool.inputSchema as Record<string, unknown>;
  const properties = schema.properties;
  if (!properties || typeof properties !== "object" || Array.isArray(properties)) return tool;

  return {
    ...tool,
    inputSchema: {
      ...schema,
      properties: {
        ...(properties as Record<string, unknown>),
        workspaceId: {
          type: "number",
          description: "Workspace ID. Defaults to the configured workspace when omitted.",
        },
      },
    },
    handler: async (args: Record<string, any>, context: any) => {
      const requestedWorkspaceId = args.workspaceId;
      if (requestedWorkspaceId === undefined || requestedWorkspaceId === context.workspaceId) {
        return tool.handler(args, context);
      }
      const requestBrowser = new RoxyBrowserClient({
        ...browserOptions,
        workspaceId: requestedWorkspaceId,
      });
      return tool.handler(args, {
        ...context,
        browser: requestBrowser,
        workspaceId: requestedWorkspaceId,
      });
    },
  };
}
