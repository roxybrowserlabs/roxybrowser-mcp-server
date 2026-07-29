import { RoxyBrowserClient } from "../../../sdk/index.js";
import { RoxyPresetMcpServer } from "../../runtime/index.js";
import { BROWSER_MCP_TOOLS } from "./tools.js";
import type { CreateMcpServerOptions } from "../../runtime/index.js";

export function createRoxyBrowserMcpServer(
  options: Partial<CreateMcpServerOptions> = {},
): RoxyPresetMcpServer {
  const browser = new RoxyBrowserClient({
    ...options.roxy,
    workspaceId: options.roxy?.workspaceId ?? options.context?.workspaceId,
  });
  return new RoxyPresetMcpServer(
    {
      name: options.name ?? "roxybrowser-mcp",
      version: options.version,
      roxy: options.roxy,
      context: options.context,
      tools: options.tools ?? BROWSER_MCP_TOOLS,
    },
    {
      browser,
      workspaceId: options.context?.workspaceId,
    },
  );
}
