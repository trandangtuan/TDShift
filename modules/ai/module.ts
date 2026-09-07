import { defineModule } from "@record-platform/core";
import { aiConfigData } from "./data";
import { aiMcpClientModel, aiMcpServerModel, aiProviderModel, aiRequestLogModel } from "./models";
import { aiRoutes } from "./routes";
import { aiMcpClientView, aiMcpServerView, aiProviderView, aiRequestLogView } from "./views";

export default defineModule({
  technicalName: "ai",
  displayName: "AI",
  version: "1.0.0",
  description: "AI providers and MCP client orchestration for record-aware assistants.",
  depends: ["base"],
  sequence: 80,
  models: [aiProviderModel, aiMcpServerModel, aiMcpClientModel, aiRequestLogModel],
  views: [...aiProviderView, ...aiMcpServerView, ...aiMcpClientView, ...aiRequestLogView],
  actions: [
    { technicalName: "ai.action_chat", name: "Chat AI", type: "client", target: "current" },
    { technicalName: "ai.action_providers", name: "Provider AI", type: "window", model: "ai.provider", viewModes: ["list", "form"] },
    { technicalName: "ai.action_mcp_servers", name: "Máy chủ MCP", type: "window", model: "ai.mcp.server", viewModes: ["list", "form"] },
    { technicalName: "ai.action_mcp_clients", name: "MCP client", type: "window", model: "ai.mcp.client", viewModes: ["list", "form"] },
    { technicalName: "ai.action_request_logs", name: "AI Nhật ký yêu cầu", type: "window", model: "ai.request.log", viewModes: ["list", "form"] }
  ],
  menus: [
    { technicalName: "ai.menu_root", name: "AI", icon: "sparkles", sequence: 80 },
    { technicalName: "ai.menu_chat", name: "Chat", parent: "ai.menu_root", action: "ai.action_chat", sequence: 10 },
    { technicalName: "ai.menu_providers", name: "Providers", parent: "ai.menu_root", action: "ai.action_providers", sequence: 20 },
    { technicalName: "ai.menu_mcp_servers", name: "Máy chủ MCP", parent: "ai.menu_root", action: "ai.action_mcp_servers", sequence: 30 },
    { technicalName: "ai.menu_mcp_clients", name: "MCP client", parent: "ai.menu_root", action: "ai.action_mcp_clients", sequence: 40 },
    { technicalName: "ai.menu_request_logs", name: "Nhật ký yêu cầu", parent: "ai.menu_root", action: "ai.action_request_logs", sequence: 50 }
  ],
  data: aiConfigData,
  routes: aiRoutes
});
