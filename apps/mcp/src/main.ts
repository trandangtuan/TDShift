import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const apiUrl = (process.env.RECORD_PLATFORM_API_URL ?? "http://localhost:3100").replace(/\/$/, "");
const token = process.env.RECORD_PLATFORM_TOKEN;

if (!token) throw new Error("RECORD_PLATFORM_TOKEN is required");

const domainSchema = z.array(z.tuple([
  z.string(),
  z.enum(["=", "!=", ">", ">=", "<", "<=", "ilike"]),
  z.unknown()
])).default([]);
const fieldsSchema = z.array(z.string()).optional();

const server = new McpServer({
  name: "record-platform",
  version: "0.1.0"
});

server.registerTool(
  "list_models",
  {
    description: "List available Record Platform models and their fields.",
    inputSchema: {}
  },
  async () => textResult(await request("/api/models"))
);

server.registerTool(
  "read_records",
  {
    description: "Search and read records from a Record Platform model.",
    inputSchema: {
      model: z.string().describe("Technical model name, for example sale.order"),
      domain: domainSchema.describe("Filter clauses"),
      fields: fieldsSchema.describe("Fields to return"),
      limit: z.number().int().min(1).max(100).default(30),
      offset: z.number().int().min(0).default(0)
    }
  },
  async ({ model, domain, fields, limit, offset }) => textResult(await request("/api/model/search_read", {
    method: "POST",
    body: { model, domain, fields, limit, offset }
  }))
);

server.registerTool(
  "create_record",
  {
    description: "Create one record in a Record Platform model.",
    inputSchema: {
      model: z.string(),
      values: z.record(z.string(), z.unknown())
    }
  },
  async ({ model, values }) => textResult(await request("/api/model/create", {
    method: "POST",
    body: { model, values }
  }))
);

server.registerTool(
  "update_records",
  {
    description: "Update one or more records in a Record Platform model.",
    inputSchema: {
      model: z.string(),
      ids: z.array(z.number().int().positive()).min(1),
      values: z.record(z.string(), z.unknown())
    }
  },
  async ({ model, ids, values }) => textResult(await request("/api/model/write", {
    method: "POST",
    body: { model, ids, values }
  }))
);

server.registerTool(
  "delete_records",
  {
    description: "Delete one or more records from a Record Platform model.",
    inputSchema: {
      model: z.string(),
      ids: z.array(z.number().int().positive()).min(1)
    }
  },
  async ({ model, ids }) => textResult(await request("/api/model/unlink", {
    method: "POST",
    body: { model, ids }
  }))
);

await server.connect(new StdioServerTransport());

async function request(path: string, options: { method?: string; body?: unknown } = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    method: options.method ?? "GET",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const payload = await response.json() as unknown;
  if (!response.ok) throw new Error(`Record Platform API ${response.status}: ${JSON.stringify(payload)}`);
  return payload;
}

function textResult(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}
