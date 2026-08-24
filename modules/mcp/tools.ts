import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export interface RecordOperations {
  listModels(): Promise<unknown>;
  readRecords(input: { model: string; domain: unknown[]; fields?: string[]; limit: number; offset: number }): Promise<unknown>;
  createRecord(input: { model: string; values: Record<string, unknown> }): Promise<unknown>;
  updateRecords(input: { model: string; ids: number[]; values: Record<string, unknown> }): Promise<unknown>;
  deleteRecords(input: { model: string; ids: number[] }): Promise<unknown>;
}

const domainSchema = z.array(z.tuple([
  z.string(),
  z.enum(["=", "!=", ">", ">=", "<", "<=", "ilike"]),
  z.unknown()
])).default([]);

export function createMcpServer(operations: RecordOperations) {
  const server = new McpServer({ name: "record-platform", version: "0.1.0" });

  server.registerTool("list_models", {
    description: "List available Record Platform models and their fields.",
    inputSchema: {}
  }, async () => textResult(await operations.listModels()));

  server.registerTool("read_records", {
    description: "Search and read records from a Record Platform model.",
    inputSchema: {
      model: z.string().describe("Technical model name, for example sale.order"),
      domain: domainSchema.describe("Filter clauses"),
      fields: z.array(z.string()).optional().describe("Fields to return"),
      limit: z.number().int().min(1).max(100).default(30),
      offset: z.number().int().min(0).default(0)
    }
  }, async (input) => textResult(await operations.readRecords(input)));

  server.registerTool("create_record", {
    description: "Create one record in a Record Platform model.",
    inputSchema: { model: z.string(), values: z.record(z.string(), z.unknown()) }
  }, async (input) => textResult(await operations.createRecord(input)));

  server.registerTool("update_records", {
    description: "Update one or more records in a Record Platform model.",
    inputSchema: {
      model: z.string(),
      ids: z.array(z.number().int().positive()).min(1),
      values: z.record(z.string(), z.unknown())
    }
  }, async (input) => textResult(await operations.updateRecords(input)));

  server.registerTool("delete_records", {
    description: "Delete one or more records from a Record Platform model.",
    inputSchema: {
      model: z.string(),
      ids: z.array(z.number().int().positive()).min(1)
    }
  }, async (input) => textResult(await operations.deleteRecords(input)));

  return server;
}

function textResult(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}
