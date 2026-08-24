import { Bot, ChevronDown, Send, User, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Alert, Button, Collapse, Input, Select, Spin } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ApiClient, StreamClient } from "./types";

type AiChatProps = {
  api: ApiClient;
  streamApi: StreamClient;
};

type AiClient = {
  id: number;
  name?: string;
  provider_id?: number;
  mcp_server_id?: number;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  trace?: TraceEvent[];
};

type TraceEvent = {
  event: string;
  message?: string;
  name?: string;
  arguments?: unknown;
  result?: unknown;
  tools?: unknown;
  error?: string;
};

export default function AiChat({ api, streamApi }: AiChatProps) {
  const [clients, setClients] = useState<AiClient[]>([]);
  const [clientId, setClientId] = useState<number | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function loadClients() {
    const data = await api<{ records: AiClient[] }>("/api/model/search_read", {
      method: "POST",
      body: { model: "ai.mcp.client", domain: [["active", "=", 1]], fields: ["name", "provider_id", "mcp_server_id"], limit: 50 }
    });
    setClients(data.records);
    setClientId((current) => current ?? Number(data.records[0]?.id));
  }

  async function send() {
    const text = prompt.trim();
    if (!text || loading) return;
    setPrompt("");
    setError(null);
    setMessages((current) => [...current, { role: "user", content: text }]);
    setLoading(true);
    const assistantIndex = messages.length + 1;
    setMessages((current) => [...current, { role: "assistant", content: "", trace: [{ event: "status", message: "Starting request" }] }]);
    try {
      try {
        await streamApi("/api/ai/chat/stream", {
          method: "POST",
          body: { prompt: text, mcpClientId: clientId },
          onEvent: (event) => {
            setMessages((current) => current.map((message, index) => {
              if (index !== assistantIndex || message.role !== "assistant") return message;
              if (event.event === "answer_delta") return { ...message, content: `${message.content}${String(event.delta ?? "")}` };
              if (event.event === "done") return { ...message, content: message.content || String(event.answer ?? "") };
              return { ...message, trace: [...(message.trace ?? []), event as TraceEvent] };
            }));
          }
        });
      } catch (streamError) {
        const result = await api<{ answer: string; toolCalls?: Array<Record<string, unknown>> }>("/api/ai/chat", {
        method: "POST",
          body: { prompt: text, mcpClientId: clientId }
        });
        setMessages((current) => current.map((message, index) => index === assistantIndex && message.role === "assistant"
          ? { ...message, content: result.answer || "(No answer)", trace: [...(message.trace ?? []), { event: "status", message: `Stream unavailable; used non-stream response. ${streamError instanceof Error ? streamError.message : String(streamError)}` }, ...(result.toolCalls ?? []).map((call) => ({ event: "tool_call", ...call }))] }
          : message));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-chat">
      <div className="ai-chat-toolbar">
        <Select
          value={clientId}
          onChange={setClientId}
          options={clients.map((client) => ({ label: client.name ?? `Client ${client.id}`, value: Number(client.id) }))}
          placeholder="MCP Client"
        />
      </div>
      <div className="ai-chat-main">
        <div className="ai-chat-messages">
          {!messages.length ? (
            <div className="ai-chat-empty">
              <Bot size={34} />
              <h2>AI Chat</h2>
              <p>Ask about records, models, sales, contacts, inventory, or any data exposed through MCP tools.</p>
            </div>
          ) : null}
          {messages.map((message, index) => (
            <div className={`ai-message ${message.role}`} key={`${message.role}-${index}`}>
              <div className="ai-message-icon">{message.role === "assistant" ? <Bot size={17} /> : <User size={17} />}</div>
              <div className="ai-message-body">
                {message.role === "assistant" ? (
                  <div className="ai-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content || "Working..."}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
                {message.trace?.length ? <TraceDetails trace={message.trace} /> : null}
              </div>
            </div>
          ))}
          {loading ? <div className="ai-message assistant"><div className="ai-message-icon"><Bot size={17} /></div><div className="ai-message-body"><Spin size="small" /></div></div> : null}
          <div ref={endRef} />
        </div>
        <TraceSidebar trace={latestTrace(messages)} />
      </div>
      {error ? <Alert type="error" showIcon message="AI request failed" description={error} /> : null}
      <div className="ai-chat-composer">
        <Input.TextArea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onPressEnter={(event) => {
            if (!event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          placeholder="Ask AI to search records..."
          autoSize={{ minRows: 2, maxRows: 6 }}
        />
        <Button type="primary" icon={<Send size={17} />} loading={loading} onClick={send} />
      </div>
    </div>
  );
}

function TraceSidebar({ trace }: { trace: TraceEvent[] }) {
  const toolCount = trace.filter((item) => item.event === "tool_call").length;
  return (
    <aside className="ai-chat-sidebar">
      <div className="ai-chat-sidebar-header">
        <span><Wrench size={14} /> Trace</span>
        <small>{toolCount} tools</small>
      </div>
      <div className="ai-chat-sidebar-body">
        {trace.length ? trace.map((item, index) => (
          <div className={`ai-trace-item ${item.event}`} key={`${item.event}-${index}`}>
            <strong>{traceTitle(item)}</strong>
            <pre>{formatTrace(item)}</pre>
          </div>
        )) : <div className="ai-trace-empty">No trace yet.</div>}
      </div>
    </aside>
  );
}

function latestTrace(messages: ChatMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role === "assistant" && message.trace?.length) return message.trace;
  }
  return [];
}

function TraceDetails({ trace }: { trace: TraceEvent[] }) {
  const toolCount = trace.filter((item) => item.event === "tool_call").length;
  return (
    <Collapse
      className="ai-trace"
      size="small"
      bordered={false}
      expandIcon={({ isActive }) => <ChevronDown className={isActive ? "open" : ""} size={14} />}
      items={[{
        key: "trace",
        label: <span><Wrench size={13} /> Details {toolCount ? `(${toolCount} tool calls)` : ""}</span>,
        children: (
          <div className="ai-trace-list">
            {trace.map((item, index) => (
              <div className={`ai-trace-item ${item.event}`} key={`${item.event}-${index}`}>
                <strong>{traceTitle(item)}</strong>
                <pre>{formatTrace(item)}</pre>
              </div>
            ))}
          </div>
        )
      }]}
    />
  );
}

function traceTitle(item: TraceEvent) {
  if (item.event === "status") return item.message ?? "Status";
  if (item.event === "thought") return "Planning note";
  if (item.event === "tools") return "Available tools";
  if (item.event === "tool_call") return `Call tool: ${item.name}`;
  if (item.event === "tool_result") return `Tool result: ${item.name}`;
  if (item.event === "error") return "Error";
  return item.event;
}

function formatTrace(item: TraceEvent) {
  if (item.event === "status" || item.event === "thought") return item.message ?? "";
  const { event, ...rest } = item;
  return JSON.stringify(rest, null, 2);
}
