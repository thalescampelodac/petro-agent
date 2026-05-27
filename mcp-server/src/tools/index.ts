import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerCompareReportsTool } from "./compare-reports.js";
import { registerGenerateInformativeAnalysisTool } from "./generate-informative-analysis.js";
import { registerGetAgentProfileTool } from "./get-agent-profile.js";
import { registerGetLatestReportTool } from "./get-latest-report.js";
import { registerGetMarketSnapshotTool } from "./get-market-snapshot.js";
import { registerListMarketEventsTool } from "./list-market-events.js";
import { registerRegisterMarketEventTool } from "./register-market-event.js";
import { registerRegisterSourceTool } from "./register-source.js";
import { registerSaveAgentReportTool } from "./save-agent-report.js";
import { registerSearchAgentMemoryTool } from "./search-agent-memory.js";
import { registerSummarizeContextTool } from "./summarize-context.js";
import { registerUpsertMarketSnapshotTool } from "./upsert-market-snapshot.js";

export function registerTools(_server: McpServer) {
  registerGetAgentProfileTool(_server);
  registerGetLatestReportTool(_server);
  registerGetMarketSnapshotTool(_server);
  registerListMarketEventsTool(_server);
  registerSearchAgentMemoryTool(_server);
  registerCompareReportsTool(_server);
  registerSummarizeContextTool(_server);
  registerRegisterSourceTool(_server);
  registerRegisterMarketEventTool(_server);
  registerUpsertMarketSnapshotTool(_server);
  registerGenerateInformativeAnalysisTool(_server);
  registerSaveAgentReportTool(_server);
}
