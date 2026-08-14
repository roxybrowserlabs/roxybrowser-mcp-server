import type { RoxyApiClientOptions } from "../../api/index.js";
import type { RoxyBrowserClient, RoxyCommerceClient } from "../../sdk/index.js";

export interface McpContext {
  browser?: RoxyBrowserClient;
  commerce?: RoxyCommerceClient;
  workspaceId?: number;
  roxyBrowserVersion?: string;
  /** @deprecated Use roxyBrowserVersion. */
  agentVersion?: string;
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  operationId: string;
  endpoint?: string;
  sinceRoxyBrowserVersion?: string;
  handler: (args: Record<string, any>, context: McpContext) => Promise<string>;
}

export interface CreateMcpServerOptions {
  name: string;
  version?: string;
  /** Hide tools and schema fields added after this RoxyBrowser app version. */
  roxyBrowserVersion?: string;
  /** @deprecated Use roxyBrowserVersion. */
  agentVersion?: string;
  roxy?: RoxyApiClientOptions;
  context?: {
    workspaceId?: number;
  };
  tools: McpTool[];
}
