import { defineModule } from "@record-platform/core";
import { mcpRoutes } from "./routes";

export default defineModule({
  technicalName: "mcp",
  displayName: "Model Context Protocol",
  version: "1.0.0",
  description: "MCP tools for authenticated Record Platform data access.",
  depends: ["base"],
  sequence: 90,
  routes: mcpRoutes
});
