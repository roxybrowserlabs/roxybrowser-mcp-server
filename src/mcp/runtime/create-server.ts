import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  PingRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { AjvJsonSchemaValidator } from "@modelcontextprotocol/sdk/validation/ajv";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { CreateMcpServerOptions, McpContext, McpTool } from "./types.js";
import { getRoxyCapability, isVersionAtLeast, ROXY_OPENAPI_VERSION } from "../../version.js";

const CURRENT_PROTOCOL_VERSION = "2026-07-28";
const LEGACY_PROTOCOL_VERSION = "2025-11-25";
const SUPPORTED_PROTOCOL_VERSIONS = [CURRENT_PROTOCOL_VERSION, LEGACY_PROTOCOL_VERSION];

// The installed SDK exposes the legacy Zod-based handler API. This tiny schema
// keeps server/discover available without adding a second runtime schema stack.
const DiscoverRequestSchema = {
  shape: {
    method: { _def: { value: "server/discover" } },
  },
  safeParse(value: unknown) {
    if (
      value &&
      typeof value === "object" &&
      (value as Record<string, unknown>).method === "server/discover"
    ) {
      return { success: true as const, data: value };
    }
    return { success: false as const, error: new Error("Invalid server/discover request") };
  },
};

type JsonSchemaValidator = ((value: unknown) => boolean) & { errors?: string };

export class RoxyPresetMcpServer {
  private readonly server: Server;
  private readonly tools: Map<string, McpTool>;
  private readonly validators: Map<string, JsonSchemaValidator>;
  private readonly context: McpContext;
  private readonly roxyBrowserVersion?: string;
  private readonly serverInfo: { name: string; version: string };

  constructor(options: CreateMcpServerOptions, context: McpContext) {
    this.roxyBrowserVersion = options.roxyBrowserVersion ?? context.roxyBrowserVersion;
    this.context = {
      ...context,
      roxyBrowserVersion: this.roxyBrowserVersion,
    };
    const tools = filterToolsByVersion(options.tools, this.roxyBrowserVersion);
    assertToolCatalog(tools, this.roxyBrowserVersion);
    this.tools = new Map(tools.map((tool) => [tool.name, tool]));
    this.validators = new Map(
      tools.map((tool) => [
        tool.name,
        compileInputSchema(tool.inputSchema, this.roxyBrowserVersion),
      ]),
    );
    this.serverInfo = {
      name: options.name,
      version: options.version ?? ROXY_OPENAPI_VERSION,
    };
    this.server = new Server(
      {
        ...this.serverInfo,
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
    this.server.setRequestHandler(PingRequestSchema, async (request) => {
      assertRequestMetadata(request, this.server);
      return {
        resultType: "complete",
        _meta: this.serverResponseMeta(),
      };
    });

    this.server.setRequestHandler(DiscoverRequestSchema as any, async (request: any) => {
      assertRequestMetadata(request, this.server);
      return {
        resultType: "complete",
        supportedVersions: SUPPORTED_PROTOCOL_VERSIONS,
        capabilities: { tools: {} },
        _meta: this.serverResponseMeta(),
      };
    });

    this.server.setRequestHandler(ListToolsRequestSchema, async (request) => {
      assertRequestMetadata(request, this.server);
      return {
        resultType: "complete",
        tools: [...this.tools.values()].map((tool) => ({
          ...(tool.title ? { title: tool.title } : {}),
          name: tool.name,
          description: tool.description,
          icons: tool.icons,
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
        _meta: this.serverResponseMeta(),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      assertRequestMetadata(request, this.server);
      const tool = this.tools.get(request.params.name);
      if (!tool) {
        throw new McpError(ErrorCode.InvalidParams, `Unknown tool: ${request.params.name}`);
      }

      const args = request.params.arguments ?? {};
      const validate = this.validators.get(tool.name)!;
      if (!validate(args)) {
        return toolErrorResult(
          `Invalid arguments for ${tool.name}: ${validate.errors ?? "does not match inputSchema"}`,
          this.serverResponseMeta(),
        );
      }

      try {
        const text = await tool.handler(args, this.context);
        return textResult(text, this.serverResponseMeta());
      } catch (error) {
        return toolErrorResult(
          error instanceof Error ? error.message : "Unknown error",
          this.serverResponseMeta(),
        );
      }
    });
  }

  private serverResponseMeta() {
    return {
      "io.modelcontextprotocol/serverInfo": this.serverInfo,
    };
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

function textResult(text: string, meta?: Record<string, unknown>) {
  return {
    resultType: "complete",
    content: [
      {
        type: "text",
        text,
      },
    ],
    ...(meta ? { _meta: meta } : {}),
  };
}

function toolErrorResult(text: string, meta?: Record<string, unknown>) {
  return {
    ...textResult(text, meta),
    isError: true,
  };
}

function assertToolCatalog(tools: McpTool[], roxyBrowserVersion?: string): void {
  const names = new Set<string>();
  for (const tool of tools) {
    if (!/^[A-Za-z0-9_.-]{1,128}$/.test(tool.name)) {
      throw new Error(`Invalid MCP tool name: ${tool.name}`);
    }
    if (names.has(tool.name)) {
      throw new Error(`Duplicate MCP tool name: ${tool.name}`);
    }
    names.add(tool.name);
    if (!tool.description.trim()) {
      throw new Error(`MCP tool ${tool.name} must have a non-empty description`);
    }
    const schema = filterSchemaByVersion(tool.inputSchema, roxyBrowserVersion);
    if (!schema || typeof schema !== "object" || (schema as any).type !== "object") {
      throw new Error(`MCP tool ${tool.name} must declare an object inputSchema`);
    }
  }
}

function compileInputSchema(schema: Record<string, unknown>, roxyBrowserVersion?: string) {
  const normalized = stripInternalSchemaKeywords(filterSchemaByVersion(schema, roxyBrowserVersion));
  const validator = new AjvJsonSchemaValidator().getValidator(
    normalized as Record<string, unknown>,
  );
  const result = ((value: unknown) => {
    const outcome = validator(value);
    result.errors = outcome.errorMessage;
    return outcome.valid;
  }) as JsonSchemaValidator;
  return result;
}

function stripInternalSchemaKeywords(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(stripInternalSchemaKeywords);
  if (!schema || typeof schema !== "object") return schema;
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(schema as Record<string, unknown>)) {
    if (key === "sinceRoxyBrowserVersion") continue;
    next[key] = stripInternalSchemaKeywords(value);
  }
  return next;
}

function assertRequestMetadata(
  request: { params?: { _meta?: Record<string, unknown> } },
  server: Server,
) {
  const meta = request.params?._meta;
  if (!meta) {
    if (server.getClientCapabilities()) return;
    throw new McpError(ErrorCode.InvalidParams, "Missing required MCP request metadata");
  }
  const protocolVersion = meta["io.modelcontextprotocol/protocolVersion"];
  const clientCapabilities = meta["io.modelcontextprotocol/clientCapabilities"];
  if (
    typeof protocolVersion !== "string" ||
    !clientCapabilities ||
    typeof clientCapabilities !== "object" ||
    Array.isArray(clientCapabilities)
  ) {
    throw new McpError(ErrorCode.InvalidParams, "Missing required MCP request metadata");
  }
  if (!SUPPORTED_PROTOCOL_VERSIONS.includes(protocolVersion)) {
    throw new McpError(-32022 as ErrorCode, "Unsupported protocol version", {
      supported: SUPPORTED_PROTOCOL_VERSIONS,
      requested: protocolVersion,
    });
  }
}
