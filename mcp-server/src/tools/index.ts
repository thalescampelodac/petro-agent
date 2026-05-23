import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerGetLatestReportTool } from "./get-latest-report.js";

export function registerTools(_server: McpServer) {
  registerGetLatestReportTool(_server);
}
