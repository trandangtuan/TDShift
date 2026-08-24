import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { ModuleRoute } from "@record-platform/core";
import { randomUUID } from "node:crypto";
import { getUserFromRequest } from "../../apps/server/src/auth";
import { createMcpServer } from "./tools";

const transports = new Map<string, { transport: StreamableHTTPServerTransport; userId: number }>();

export const mcpRoutes: ModuleRoute[] = [{
  async register({ app, createRequestEnvironment, getRegistry }) {
    app.post("/mcp", async (request: any, reply: any) => {
      const user = getUserFromRequest(request);
      if (!user) return reply.code(401).send({ error: "Authentication required" });

      const sessionId = request.headers["mcp-session-id"] as string | undefined;
      const existingSession = sessionId ? transports.get(sessionId) : undefined;
      if (existingSession && existingSession.userId !== user.id) return reply.code(403).send({ error: "MCP session belongs to another user" });
      let transport = existingSession?.transport;
      if (!transport) {
        if (sessionId) return reply.code(404).send({ error: "MCP session not found" });
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (newSessionId) => {
            transports.set(newSessionId, { transport: transport!, userId: user.id });
          }
        });
        const server = createMcpServer({
          listModels: async () => [...getRegistry().models.values()].map(({ technicalName, name, tableName, fields }) => ({ technicalName, name, tableName, fields })),
          readRecords: async (input) => ({ records: await createRequestEnvironment(request).model(input.model).searchRead(input.domain as any, input.fields, { limit: input.limit, offset: input.offset }) }),
          createRecord: async (input) => ({ id: await createRequestEnvironment(request).model(input.model).create(input.values) }),
          updateRecords: async (input) => {
            await createRequestEnvironment(request).model(input.model).write(input.ids, input.values);
            return { ok: true };
          },
          deleteRecords: async (input) => {
            await createRequestEnvironment(request).model(input.model).unlink(input.ids);
            return { ok: true };
          }
        });
        transport.onclose = () => {
          if (transport?.sessionId) transports.delete(transport.sessionId);
        };
        await server.connect(transport);
      }

      await transport.handleRequest(request.raw, reply.raw, request.body);
      reply.hijack();
    });

    app.get("/mcp", async (request: any, reply: any) => handleExistingSession(request, reply));
    app.delete("/mcp", async (request: any, reply: any) => handleExistingSession(request, reply));
  }
}];

async function handleExistingSession(request: any, reply: any) {
  if (!getUserFromRequest(request)) return reply.code(401).send({ error: "Authentication required" });
  const sessionId = request.headers["mcp-session-id"] as string | undefined;
  const transport = sessionId ? transports.get(sessionId) : undefined;
  if (!transport) return reply.code(404).send({ error: "MCP session not found" });
  if (transport.userId !== getUserFromRequest(request)?.id) return reply.code(403).send({ error: "MCP session belongs to another user" });
  await transport.transport.handleRequest(request.raw, reply.raw);
  reply.hijack();
}
