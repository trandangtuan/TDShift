type ProviderType = "openai" | "anthropic" | "openrouter";

export type AiProviderConfig = {
  id: number;
  name: string;
  provider_type: ProviderType;
  base_url?: string | null;
  api_key_env: string;
  model_name: string;
  temperature?: number | null;
};

export type AiTool = {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
};

export type AiToolCall = {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
};

export type AiMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  toolCalls?: AiToolCall[];
  toolCallId?: string;
};

export type AiResponse = {
  content: string;
  toolCalls: AiToolCall[];
};

export async function callLlm(provider: AiProviderConfig, messages: AiMessage[], tools: AiTool[] = []): Promise<AiResponse> {
  if (provider.provider_type === "anthropic") return callAnthropic(provider, messages, tools);
  return callOpenAiCompatible(provider, messages, tools);
}

async function callOpenAiCompatible(provider: AiProviderConfig, messages: AiMessage[], tools: AiTool[]) {
  const payload = {
    model: provider.model_name,
    temperature: Number(provider.temperature ?? 0.1),
    messages: messages.map(toOpenAiMessage),
    tools: tools.map((tool) => ({ type: "function", function: { name: tool.name, description: tool.description ?? "", parameters: tool.inputSchema } })),
    tool_choice: tools.length ? "auto" : undefined
  };
  const response = await providerFetch(provider, `${baseUrl(provider)}/chat/completions`, payload);
  const message = response.choices?.[0]?.message ?? {};
  return {
    content: String(message.content ?? ""),
    toolCalls: (message.tool_calls ?? []).map((call: any) => ({
      id: String(call.id),
      name: String(call.function?.name ?? ""),
      arguments: parseJsonObject(call.function?.arguments)
    })).filter((call: AiToolCall) => call.name)
  };
}

async function callAnthropic(provider: AiProviderConfig, messages: AiMessage[], tools: AiTool[]) {
  const system = messages.find((message) => message.role === "system")?.content;
  const payload = {
    model: provider.model_name,
    max_tokens: 2048,
    temperature: Number(provider.temperature ?? 0.1),
    system,
    messages: toAnthropicMessages(messages.filter((message) => message.role !== "system")),
    tools: tools.map((tool) => ({ name: tool.name, description: tool.description ?? "", input_schema: tool.inputSchema }))
  };
  const response = await providerFetch(provider, `${baseUrl(provider)}/messages`, payload, { "anthropic-version": "2023-06-01" });
  const content = response.content ?? [];
  return {
    content: content.filter((block: any) => block.type === "text").map((block: any) => block.text).join("\n"),
    toolCalls: content.filter((block: any) => block.type === "tool_use").map((block: any) => ({
      id: String(block.id),
      name: String(block.name),
      arguments: block.input && typeof block.input === "object" ? block.input : {}
    }))
  };
}

function toOpenAiMessage(message: AiMessage) {
  if (message.role === "tool") return { role: "tool", tool_call_id: message.toolCallId, content: message.content };
  if (message.toolCalls?.length) {
    return {
      role: "assistant",
      content: message.content || null,
      tool_calls: message.toolCalls.map((call) => ({ id: call.id, type: "function", function: { name: call.name, arguments: JSON.stringify(call.arguments) } }))
    };
  }
  return { role: message.role, content: message.content };
}

function toAnthropicMessages(messages: AiMessage[]) {
  const result: any[] = [];
  for (const message of messages) {
    if (message.role === "tool") {
      result.push({ role: "user", content: [{ type: "tool_result", tool_use_id: message.toolCallId, content: message.content }] });
    } else if (message.toolCalls?.length) {
      result.push({
        role: "assistant",
        content: [
          ...(message.content ? [{ type: "text", text: message.content }] : []),
          ...message.toolCalls.map((call) => ({ type: "tool_use", id: call.id, name: call.name, input: call.arguments }))
        ]
      });
    } else {
      result.push({ role: message.role === "assistant" ? "assistant" : "user", content: message.content });
    }
  }
  return result;
}

async function providerFetch(provider: AiProviderConfig, url: string, payload: unknown, extraHeaders: Record<string, string> = {}) {
  const apiKey = resolveApiKey(provider.api_key_env);
  if (!apiKey) throw new Error(`Missing API key. Set environment variable ${provider.api_key_env} or enter a provider API key.`);
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(payload)
  });
  const data = await response.json() as any;
  if (!response.ok) throw new Error(`AI provider ${response.status}: ${JSON.stringify(data)}`);
  return data;
}

function resolveApiKey(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return process.env[trimmed] || (looksLikeApiKey(trimmed) ? trimmed : undefined);
}

function looksLikeApiKey(value: string) {
  return /^(sk-|sk_|or-|pk-|api-|key-)/i.test(value) || value.length >= 32 && /^[A-Za-z0-9._-]+$/.test(value);
}

function baseUrl(provider: AiProviderConfig) {
  const fallback = provider.provider_type === "anthropic" ? "https://api.anthropic.com/v1" : provider.provider_type === "openrouter" ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1";
  return String(provider.base_url || fallback).replace(/\/$/, "");
}

function parseJsonObject(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  try {
    const parsed = JSON.parse(String(value ?? "{}"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
