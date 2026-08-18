import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { CreateMcpServerOptions, McpContext, McpTool } from "./types.js";
import { getRoxyCapability, isVersionAtLeast, ROXY_OPENAPI_VERSION } from "../../version.js";

export class RoxyPresetMcpServer {
  private readonly server: Server;
  private readonly tools: Map<string, McpTool>;
  private readonly context: McpContext;
  private readonly roxyBrowserVersion?: string;

  constructor(options: CreateMcpServerOptions, context: McpContext) {
    this.roxyBrowserVersion =
      options.roxyBrowserVersion ??
      options.agentVersion ??
      context.roxyBrowserVersion ??
      context.agentVersion;
    this.context = {
      ...context,
      roxyBrowserVersion: this.roxyBrowserVersion,
      agentVersion: this.roxyBrowserVersion,
    };
    const tools = filterToolsByVersion(options.tools, this.roxyBrowserVersion);
    this.tools = new Map(tools.map((tool) => [tool.name, tool]));
    this.server = new Server(
      {
        name: options.name,
        version: options.version ?? ROXY_OPENAPI_VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [...this.tools.values()].map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: filterSchemaByVersion(tool.inputSchema, this.roxyBrowserVersion),
        ...(tool.annotations ? { annotations: tool.annotations } : {}),
        _meta: {
          "roxybrowser/openapiPackageVersion": ROXY_OPENAPI_VERSION,
          "roxybrowser/operationId": tool.operationId,
          ...(this.roxyBrowserVersion
            ? { "roxybrowser/roxyBrowserVersion": this.roxyBrowserVersion }
            : {}),
          ...(tool.endpoint ? { "roxybrowser/endpoint": tool.endpoint } : {}),
          ...(tool.sinceRoxyBrowserVersion
            ? { "roxybrowser/sinceRoxyBrowserVersion": tool.sinceRoxyBrowserVersion }
            : {}),
        },
      })),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const tool = this.tools.get(request.params.name);
      if (!tool) {
        return textResult(`Unknown tool: ${request.params.name}`);
      }

      try {
        const text = await tool.handler(request.params.arguments ?? {}, this.context);
        return textResult(text);
      } catch (error) {
        return textResult(error instanceof Error ? error.message : "Unknown error");
      }
    });
  }

  connect(transport: Transport): Promise<void> {
    return this.server.connect(transport);
  }

  run(): Promise<void> {
    return this.connect(new StdioServerTransport());
  }
}

export function withToolVersions<TTool extends McpTool>(tools: TTool[]): TTool[] {
  return tools.map((tool) => ({
    ...tool,
    sinceRoxyBrowserVersion:
      tool.sinceRoxyBrowserVersion ?? getRoxyCapability(tool.operationId)?.sinceRoxyBrowserVersion,
  }));
}

export function filterToolsByVersion<TTool extends McpTool>(
  tools: TTool[],
  roxyBrowserVersion?: string,
): TTool[] {
  if (!roxyBrowserVersion) return tools;
  return tools.filter(
    (tool) =>
      !tool.sinceRoxyBrowserVersion ||
      isVersionAtLeast(roxyBrowserVersion, tool.sinceRoxyBrowserVersion),
  );
}

export function filterSchemaByVersion(schema: unknown, roxyBrowserVersion?: string): unknown {
  if (!roxyBrowserVersion || !schema || typeof schema !== "object") return schema;

  if (Array.isArray(schema)) {
    return schema.map((item) => filterSchemaByVersion(item, roxyBrowserVersion));
  }

  const source = schema as Record<string, unknown>;
  if (
    typeof source.sinceRoxyBrowserVersion === "string" &&
    !isVersionAtLeast(roxyBrowserVersion, source.sinceRoxyBrowserVersion)
  ) {
    return undefined;
  }

  const next: Record<string, unknown> = {};
  const removedProperties = new Set<string>();
  let required: string[] | undefined;

  for (const [key, value] of Object.entries(source)) {
    if (key === "sinceRoxyBrowserVersion") continue;

    if (key === "properties" && value && typeof value === "object" && !Array.isArray(value)) {
      const properties: Record<string, unknown> = {};
      for (const [propertyName, propertySchema] of Object.entries(
        value as Record<string, unknown>,
      )) {
        const filtered = filterSchemaByVersion(propertySchema, roxyBrowserVersion);
        if (filtered === undefined) {
          removedProperties.add(propertyName);
        } else {
          properties[propertyName] = filtered;
        }
      }
      next.properties = properties;
      continue;
    }

    if (key === "required" && Array.isArray(value)) {
      required = value.filter((property): property is string => typeof property === "string");
      continue;
    }

    const filtered = filterSchemaByVersion(value, roxyBrowserVersion);
    if (filtered !== undefined) {
      next[key] = filtered;
    }
  }

  if (required) {
    next.required = required.filter((property) => !removedProperties.has(property));
  }

  return next;
}

function textResult(text: string) {
  return {
    content: [
      {
        type: "text",
        text,
      },
    ],
  };
}
