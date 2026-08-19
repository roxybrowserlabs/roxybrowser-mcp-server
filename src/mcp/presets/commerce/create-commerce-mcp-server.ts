import { RoxyCommerceClient } from "../../../sdk/index.js";
import {
  RoxyPresetMcpServer,
  withToolVersions,
  type CreateMcpServerOptions,
} from "../../runtime/index.js";
import { COMMERCE_MCP_TOOLS } from "./tools.js";

export function createRoxyCommerceMcpServer(
  options: Partial<CreateMcpServerOptions> = {},
): RoxyPresetMcpServer {
  const commerce = new RoxyCommerceClient({
    ...options.roxy,
    workspaceId: options.roxy?.workspaceId ?? options.context?.workspaceId,
  });
  return new RoxyPresetMcpServer(
    {
      name: options.name ?? "roxycommerce-mcp",
      version: options.version,
      roxyBrowserVersion: options.roxyBrowserVersion,
      roxy: options.roxy,
      context: options.context,
      tools: withToolVersions(options.tools ?? COMMERCE_MCP_TOOLS),
    },
    {
      commerce,
      workspaceId: options.context?.workspaceId,
    },
  );
}
