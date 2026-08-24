import type { ModuleRoute } from "@record-platform/core";
import { callLlm, type AiMessage, type AiProviderConfig, type AiTool } from "./llm";
import { parseEnabledTools, toolResultText, withMcpClient, type McpServerConfig } from "./mcp-client";

type AiChatRequest = {
  prompt?: string;
  mcpClientId?: number;
  providerId?: number;
  mcpServerId?: number;
  system?: string;
};

type AiMcpClientConfig = {
  id: number;
  name: string;
  provider_id: number;
  mcp_server_id: number;
  system_prompt?: string | null;
  enabled_tools?: string | null;
};

export const aiRoutes: ModuleRoute[] = [
  {
    register({ app, createRequestEnvironment }) {
      app.post("/api/ai/chat", async (request: any, reply: any) => {
        const body = normalizeBody(request.body);
        if (!body.prompt?.trim()) return reply.code(400).send({ error: "prompt is required" });
        const env = createRequestEnvironment(request);
        const mcpClient = await findMcpClient(env, body.mcpClientId);
        const provider = await findProvider(env, body.providerId ?? mcpClient?.provider_id);
        if (!provider) return reply.code(404).send({ error: "No active AI provider found" });
        const mcpServer = await findMcpServer(env, body.mcpServerId ?? mcpClient?.mcp_server_id);
        if (!mcpServer) return reply.code(404).send({ error: "No active MCP server found" });
        const systemPrompt = body.system ?? mcpClient?.system_prompt ?? defaultSystemPrompt();
        const enabledToolList = mcpClient?.enabled_tools || mcpServer.enabled_tools;
        const requestToken = bearerToken(request.headers.authorization);

        const toolCalls: Array<Record<string, unknown>> = [];
        try {
          const result = await withMcpClient(mcpServer, async (client) => {
            const enabledTools = parseEnabledTools(enabledToolList);
            const listedTools = (await client.listTools()).tools.filter((tool) => !enabledTools.size || enabledTools.has(tool.name));
            const tools: AiTool[] = listedTools.map((tool) => ({ name: tool.name, description: tool.description, inputSchema: tool.inputSchema }));
            const messages: AiMessage[] = [
              { role: "system", content: systemPrompt },
              { role: "user", content: body.prompt!.trim() }
            ];
            let answer = "";
            for (let step = 0; step < 6; step += 1) {
              const response = await callLlm(provider, messages, tools);
              const requestedToolCalls = normalizeToolCalls(response.content, response.toolCalls);
              answer = stripInlineToolCalls(response.content).trim();
              if (!requestedToolCalls.length) return { answer: answer || response.content, toolCalls };

              messages.push({ role: "assistant", content: answer, toolCalls: requestedToolCalls });
              for (const toolCall of requestedToolCalls) {
                const toolResult = await client.callTool({ name: toolCall.name, arguments: toolCall.arguments });
                const text = toolResultText(toolResult);
                toolCalls.push({ name: toolCall.name, arguments: toolCall.arguments, result: safeParseJson(text) ?? text });
                messages.push({ role: "tool", toolCallId: toolCall.id, content: text });
              }
            }
            const final = await callLlm(provider, [...messages, { role: "user", content: "Summarize the tool results and finish the answer now. Do not call more tools." }], []);
            return { answer: final.content || answer, toolCalls };
          }, requestToken);
          await createLog(env, provider.id, body.prompt, result.answer, toolCalls, "done");
          return result;
        } catch (error: any) {
          await createLog(env, provider.id, body.prompt, "", toolCalls, "failed", error?.message ?? String(error));
          return reply.code(500).send({ error: error?.message ?? String(error), toolCalls });
        }
      });

      app.post("/api/ai/chat/stream", async (request: any, reply: any) => {
        const body = normalizeBody(request.body);
        if (!body.prompt?.trim()) return reply.code(400).send({ error: "prompt is required" });
        const origin = typeof request.headers.origin === "string" ? request.headers.origin : "*";
        reply.raw.writeHead(200, {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive"
        });
        const send = (event: string, data: Record<string, unknown> = {}) => reply.raw.write(`${JSON.stringify({ event, ...data })}\n`);
        const env = createRequestEnvironment(request);
        const toolCalls: Array<Record<string, unknown>> = [];
        let provider: AiProviderConfig | undefined;
        try {
          send("status", { message: "Loading AI client configuration" });
          const mcpClient = await findMcpClient(env, body.mcpClientId);
          provider = await findProvider(env, body.providerId ?? mcpClient?.provider_id);
          if (!provider) throw new Error("No active AI provider found");
          const mcpServer = await findMcpServer(env, body.mcpServerId ?? mcpClient?.mcp_server_id);
          if (!mcpServer) throw new Error("No active MCP server found");
          const systemPrompt = body.system ?? mcpClient?.system_prompt ?? defaultSystemPrompt();
          const enabledToolList = mcpClient?.enabled_tools || mcpServer.enabled_tools;
          const requestToken = bearerToken(request.headers.authorization);

          const result = await withMcpClient(mcpServer, async (client) => {
            send("status", { message: `Connected to MCP server: ${mcpServer.name}` });
            const enabledTools = parseEnabledTools(enabledToolList);
            const listedTools = (await client.listTools()).tools.filter((tool) => !enabledTools.size || enabledTools.has(tool.name));
            send("tools", { tools: listedTools.map((tool) => ({ name: tool.name, description: tool.description })) });
            const tools: AiTool[] = listedTools.map((tool) => ({ name: tool.name, description: tool.description, inputSchema: tool.inputSchema }));
            const messages: AiMessage[] = [
              { role: "system", content: systemPrompt },
              { role: "user", content: body.prompt!.trim() }
            ];
            let answer = "";
            for (let step = 0; step < 6; step += 1) {
              send("status", { message: `Asking ${provider!.name}` });
              const response = await callLlm(provider!, messages, tools);
              const requestedToolCalls = normalizeToolCalls(response.content, response.toolCalls);
              answer = stripInlineToolCalls(response.content).trim();
              if (!requestedToolCalls.length) {
                streamText(send, answer || response.content);
                return { answer: answer || response.content, toolCalls };
              }
              if (answer) send("thought", { message: answer });
              messages.push({ role: "assistant", content: answer, toolCalls: requestedToolCalls });
              for (const toolCall of requestedToolCalls) {
                send("tool_call", { name: toolCall.name, arguments: toolCall.arguments });
                const toolResult = await client.callTool({ name: toolCall.name, arguments: toolCall.arguments });
                const text = toolResultText(toolResult);
                const parsed = safeParseJson(text) ?? text;
                toolCalls.push({ name: toolCall.name, arguments: toolCall.arguments, result: parsed });
                send("tool_result", { name: toolCall.name, result: parsed });
                messages.push({ role: "tool", toolCallId: toolCall.id, content: text });
              }
            }
            send("status", { message: "Summarizing tool results" });
            const final = await callLlm(provider!, [...messages, { role: "user", content: "Summarize the tool results and finish the answer now. Do not call more tools." }], []);
            streamText(send, final.content || answer);
            return { answer: final.content || answer, toolCalls };
          }, requestToken);
          await createLog(env, provider.id, body.prompt, result.answer, toolCalls, "done");
          send("done", { answer: result.answer, toolCalls });
        } catch (error: any) {
          if (provider) await createLog(env, provider.id, body.prompt, "", toolCalls, "failed", error?.message ?? String(error));
          send("error", { error: error?.message ?? String(error), toolCalls });
        } finally {
          reply.raw.end();
        }
      });
    }
  }
];

function normalizeBody(value: unknown): AiChatRequest {
  return value && typeof value === "object" ? value as AiChatRequest : {};
}

async function findProvider(env: any, id: number | undefined): Promise<AiProviderConfig | undefined> {
  const domain = id ? [["id", "=", id]] : [["active", "=", true]];
  const [record] = await env.model("ai.provider").searchRead(domain, undefined, { limit: 1 });
  return record as AiProviderConfig | undefined;
}

async function findMcpServer(env: any, id: number | undefined): Promise<McpServerConfig | undefined> {
  const domain = id ? [["id", "=", id]] : [["active", "=", true]];
  const [record] = await env.model("ai.mcp.server").searchRead(domain, undefined, { limit: 1 });
  return record as McpServerConfig | undefined;
}

async function findMcpClient(env: any, id: number | undefined): Promise<AiMcpClientConfig | undefined> {
  const domain = id ? [["id", "=", id]] : [["active", "=", true]];
  const [record] = await env.model("ai.mcp.client").searchRead(domain, undefined, { limit: 1 });
  return record as AiMcpClientConfig | undefined;
}

async function createLog(env: any, providerId: number, prompt: string | undefined, answer: string, toolCalls: Array<Record<string, unknown>>, state: "done" | "failed", error?: string) {
  await env.model("ai.request.log").create({
    name: `${state === "done" ? "AI" : "AI Failed"} ${new Date().toISOString()}`,
    provider_id: providerId,
    prompt,
    answer,
    tool_calls: toolCalls,
    state,
    error
  });
}

function defaultSystemPrompt() {
  return [
    "You are an AI assistant inside a record-driven Odoo-like application.",
    "Use the available MCP tools to inspect models and search/read records before answering questions about application data.",
    "Prefer precise model names, concise answers, and include record ids when they help the user act."
  ].join(" ");
}

function safeParseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeToolCalls(content: string, toolCalls: AiMessage["toolCalls"] = []) {
  const nativeCalls = toolCalls.map((call) => ({ ...call, name: normalizeToolName(call.name), arguments: normalizeToolArguments(call.name, call.arguments) }));
  return [...nativeCalls, ...parseInlineToolCalls(content)];
}

function parseInlineToolCalls(content: string) {
  const calls: NonNullable<AiMessage["toolCalls"]> = [];
  const pattern = /<tool_call>([\s\S]*?)<\/tool_call>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content))) {
    const body = match[1] ?? "";
    const name = normalizeToolName((body.match(/^\s*([a-zA-Z0-9_-]+)/)?.[1] || body.match(/<tool_name>([\s\S]*?)<\/tool_name>/i)?.[1] || "").trim());
    const args = parseInlineToolArgs(body);
    if (name) calls.push({ id: `inline-${calls.length}-${Date.now()}`, name, arguments: normalizeToolArguments(name, args) });
  }
  return calls;
}

function parseInlineToolArgs(body: string) {
  const args: Record<string, unknown> = {};
  const pattern = /<arg_key>([\s\S]*?)<\/arg_key>\s*<arg_value>([\s\S]*?)<\/arg_value>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(body))) {
    args[match[1].trim()] = parseArgValue(match[2].trim());
  }
  return args;
}

function parseArgValue(value: string) {
  const parsed = safeParseJson(value);
  return parsed ?? value;
}

function normalizeToolName(name: string) {
  if (name === "search_records") return "read_records";
  if (name === "search_read") return "read_records";
  return name;
}

function normalizeToolArguments(toolName: string, args: Record<string, unknown>) {
  if (toolName !== "read_records") return args;
  return {
    ...args,
    model: args.model ?? args.model_name,
    domain: args.domain ?? [],
    limit: args.limit ?? 30,
    offset: args.offset ?? 0
  };
}

function stripInlineToolCalls(content: string) {
  return content.replace(/<tool_call>[\s\S]*?<\/tool_call>/gi, "");
}

function streamText(send: (event: string, data?: Record<string, unknown>) => void, text: string) {
  for (const chunk of text.match(/.{1,80}(\s|$)/gs) ?? [text]) {
    if (chunk) send("answer_delta", { delta: chunk });
  }
}

function bearerToken(value: unknown) {
  const header = typeof value === "string" ? value : "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1];
}
