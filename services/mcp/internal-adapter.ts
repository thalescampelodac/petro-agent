export const PETROAGENT_MCP_TOOLS = {
  compareReports: "compare_reports",
  generateInformativeAnalysis: "generate_informative_analysis",
  getAgentProfile: "get_agent_profile",
  getLatestReport: "get_latest_report",
  getMarketSnapshot: "get_market_snapshot",
  listMarketEvents: "list_market_events",
  registerMarketEvent: "register_market_event",
  registerSource: "register_source",
  saveAgentReport: "save_agent_report",
  searchAgentMemory: "search_agent_memory",
  summarizeContext: "summarize_context",
  upsertMarketSnapshot: "upsert_market_snapshot",
} as const;

export type PetroAgentMcpToolName =
  (typeof PETROAGENT_MCP_TOOLS)[keyof typeof PETROAGENT_MCP_TOOLS];

export type McpTextContent = {
  text: string;
  type: "text";
};

export type McpToolResult<TStructuredContent> = {
  content: McpTextContent[];
  structuredContent: TStructuredContent;
};

export type McpToolClient = {
  callTool<TStructuredContent>(
    name: PetroAgentMcpToolName,
    args?: Record<string, unknown>,
  ): Promise<McpToolResult<TStructuredContent>>;
};

export class PetroAgentMcpToolError extends Error {
  constructor(
    public readonly toolName: PetroAgentMcpToolName,
    cause: unknown,
  ) {
    super(`PetroAgent MCP tool failed: ${toolName}`);
    this.name = "PetroAgentMcpToolError";
    this.cause = cause;
  }
}

export type AgentProfileResult = {
  active_profile: unknown;
  available_profiles: unknown[];
};

export type LatestReportResult =
  | {
      found: true;
      report: unknown;
    }
  | {
      found: false;
      reason: "not_found";
      report: null;
    };

export type MarketSnapshotResult =
  | {
      found: true;
      snapshot: unknown;
      ticker: string;
    }
  | {
      found: false;
      reason: "not_found";
      snapshot: null;
      ticker: string;
    };

export type ListMarketEventsParams = {
  date_from?: string;
  date_to?: string;
  event_type?: string;
  limit?: number;
};

export type ListMarketEventsResult = {
  count: number;
  events: unknown[];
  filters: {
    date_from: string | null;
    date_to: string | null;
    event_type: string | null;
    limit: number;
  };
};

export type SearchAgentMemoryParams = {
  limit?: number;
  query: string;
};

export type SearchAgentMemoryResult = {
  count: number;
  items: unknown[];
  query: string;
};

export type CompareReportsParams = {
  limit?: number;
};

export type CompareReportsResult = {
  changes: unknown;
  count: number;
  reports?: unknown[];
  summary?: string;
};

export type SummarizeContextParams = {
  limit?: number;
  query?: string;
};

export type SummarizeContextResult = {
  citations: string[];
  events: unknown[];
  sources: unknown[];
  summary: string;
};

export type RegisterSourceParams = {
  processed?: boolean;
  published_at?: string | null;
  raw_content: string;
  source_type: string;
  title?: string | null;
  url?: string | null;
};

export type RegisterMarketEventParams = {
  event_date?: string | null;
  event_type: string;
  relevance_score?: number | null;
  source_id?: number | null;
  summary?: string | null;
  title: string;
};

export type UpsertMarketSnapshotParams = {
  price?: number | null;
  snapshot_time: string;
  source?: string | null;
  ticker?: string;
  variation?: number | null;
  volume?: number | null;
};

export type AgentReportPayload = {
  attention_points?: string[];
  model_used?: string | null;
  sentiment?: string | null;
  sentiment_basis?: string | null;
  sentiment_confidence?: "baixa" | "media" | "alta" | null;
  sentiment_score?: number | null;
  source_count?: number;
  summary: string;
  title?: string;
};

export type WriteToolResult = {
  id: number;
  source: string;
};

export type GenerateInformativeAnalysisParams = {
  context_limit?: number;
  query?: string;
  scope?: string;
  ticker?: string;
};

export type GenerateInformativeAnalysisResult = {
  citations: string[];
  payload: AgentReportPayload;
};

export function createPetroAgentMcpAdapter(client: McpToolClient) {
  async function call<TStructuredContent>(
    name: PetroAgentMcpToolName,
    args?: Record<string, unknown>,
  ) {
    try {
      return await client.callTool<TStructuredContent>(name, args);
    } catch (error) {
      throw new PetroAgentMcpToolError(name, error);
    }
  }

  return {
    compareReports(params: CompareReportsParams = {}) {
      return call<CompareReportsResult>(PETROAGENT_MCP_TOOLS.compareReports, params);
    },
    getAgentProfile() {
      return call<AgentProfileResult>(PETROAGENT_MCP_TOOLS.getAgentProfile);
    },
    generateInformativeAnalysis(params: GenerateInformativeAnalysisParams = {}) {
      return call<GenerateInformativeAnalysisResult>(
        PETROAGENT_MCP_TOOLS.generateInformativeAnalysis,
        params,
      );
    },
    getLatestReport() {
      return call<LatestReportResult>(PETROAGENT_MCP_TOOLS.getLatestReport);
    },
    getMarketSnapshot(ticker = "PETR4") {
      return call<MarketSnapshotResult>(PETROAGENT_MCP_TOOLS.getMarketSnapshot, {
        ticker,
      });
    },
    listMarketEvents(params: ListMarketEventsParams = {}) {
      return call<ListMarketEventsResult>(
        PETROAGENT_MCP_TOOLS.listMarketEvents,
        params,
      );
    },
    registerMarketEvent(params: RegisterMarketEventParams) {
      return call<WriteToolResult>(PETROAGENT_MCP_TOOLS.registerMarketEvent, params);
    },
    registerSource(params: RegisterSourceParams) {
      return call<WriteToolResult>(PETROAGENT_MCP_TOOLS.registerSource, params);
    },
    saveAgentReport(params: AgentReportPayload) {
      return call<WriteToolResult>(PETROAGENT_MCP_TOOLS.saveAgentReport, params);
    },
    searchAgentMemory(params: SearchAgentMemoryParams) {
      return call<SearchAgentMemoryResult>(
        PETROAGENT_MCP_TOOLS.searchAgentMemory,
        params,
      );
    },
    summarizeContext(params: SummarizeContextParams = {}) {
      return call<SummarizeContextResult>(PETROAGENT_MCP_TOOLS.summarizeContext, params);
    },
    upsertMarketSnapshot(params: UpsertMarketSnapshotParams) {
      return call<WriteToolResult>(PETROAGENT_MCP_TOOLS.upsertMarketSnapshot, params);
    },
  };
}

export type PetroAgentMcpAdapter = ReturnType<typeof createPetroAgentMcpAdapter>;

export function getMcpText(result: Pick<McpToolResult<unknown>, "content">) {
  return result.content
    .filter((item) => item.type === "text")
    .map((item) => item.text)
    .join("\n");
}
