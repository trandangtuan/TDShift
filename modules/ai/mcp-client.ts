import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export type McpServerConfig = {
  id: number;
  name: string;
  url: string;
  auth_token_env?: string | null;
  enabled_tools?: string | null;
};

export async function withMcpClient<T>(server: McpServerConfig, run: (client: Client) => Promise<T>, fallbackToken?: string) {
  const headers: Record<string, string> = {};
  const token = server.auth_token_env ? process.env[server.auth_token_env] : undefined;
  const effectiveToken = token || fallbackToken;
  if (effectiveToken) headers.Authorization = `Bearer ${effectiveToken}`;
  const transport = new StreamableHTTPClientTransport(new URL(server.url), { requestInit: { headers } });
  const client = new Client({ name: "record-platform-ai", version: "0.1.0" });
  await client.connect(transport);
  try {
    return await run(client);
  } finally {
    await transport.close();
  }
}

export function parseEnabledTools(value: string | null | undefined) {
  return new Set(String(value ?? "").split(",").map((tool) => tool.trim()).filter(Boolean));
}

export function toolResultText(value: unknown) {
  const content = (value as any)?.content;
  if (!Array.isArray(content)) return JSON.stringify(value);
  return content.map((item) => item?.type === "text" ? item.text : JSON.stringify(item)).join("\n");
}
