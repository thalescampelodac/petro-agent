import type { SupabaseClient } from "@supabase/supabase-js";

import {
  PETROAGENT_MCP_TOOLS,
  type AgentReportPayload,
  type McpToolResult,
  type McpToolClient,
  type PetroAgentMcpToolName,
} from "./internal-adapter";

const PETROAGENT_SCHEMA = "petroagent";

function textResult<TStructuredContent>(
  text: string,
  structuredContent: TStructuredContent,
) {
  return {
    content: [{ text, type: "text" as const }],
    structuredContent,
  };
}

export function createLocalMcpToolClient(client: SupabaseClient): McpToolClient {
  return {
    async callTool<TStructuredContent>(
      name: PetroAgentMcpToolName,
      args: Record<string, unknown> = {},
    ) {
      const castResult = (result: McpToolResult<unknown>) =>
        result as McpToolResult<TStructuredContent>;

      if (name === PETROAGENT_MCP_TOOLS.getMarketSnapshot) {
        const ticker = String(args.ticker ?? "PETR4").trim().toUpperCase();
        const { data, error } = await client
          .schema(PETROAGENT_SCHEMA)
          .from("market_snapshots")
          .select("ticker, price, variation, volume, source, snapshot_time")
          .eq("ticker", ticker)
          .order("snapshot_time", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        return castResult(
          textResult(
            data
              ? `Snapshot encontrado para ${ticker}.`
              : `Nenhum snapshot para ${ticker}.`,
            data
              ? { found: true, snapshot: data, ticker }
              : { found: false, reason: "not_found", snapshot: null, ticker },
          ),
        );
      }

      if (name === PETROAGENT_MCP_TOOLS.listMarketEvents) {
        const limit =
          typeof args.limit === "number" ? Math.min(Math.max(args.limit, 1), 50) : 8;
        const { data, error } = await client
          .schema(PETROAGENT_SCHEMA)
          .from("market_events")
          .select("id, created_at, event_date, event_type, title, summary, relevance_score")
          .order("event_date", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) throw error;

        const events = data ?? [];

        return castResult(
          textResult(`Eventos encontrados: ${events.length}.`, {
            count: events.length,
            events,
            filters: {
              date_from: null,
              date_to: null,
              event_type: null,
              limit,
            },
          }),
        );
      }

      if (name === PETROAGENT_MCP_TOOLS.getLatestReport) {
        const { data, error } = await client
          .schema(PETROAGENT_SCHEMA)
          .from("agent_reports")
          .select(
            "created_at, title, summary, sentiment, sentiment_score, sentiment_confidence, sentiment_basis, source_count, model_used",
          )
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        return castResult(
          textResult(
            data ? `Relatório encontrado: ${data.title}.` : "Nenhum relatório encontrado.",
            data
              ? { found: true, report: data }
              : { found: false, reason: "not_found", report: null },
          ),
        );
      }

      if (name === PETROAGENT_MCP_TOOLS.searchAgentMemory) {
        const limit =
          typeof args.limit === "number" ? Math.min(Math.max(args.limit, 1), 20) : 8;
        const { data, error } = await client
          .schema(PETROAGENT_SCHEMA)
          .from("sources")
          .select("id, created_at, published_at, source_type, title, url, raw_content")
          .order("published_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) throw error;

        const items = data ?? [];

        return castResult(
          textResult(`Memória encontrada: ${items.length}.`, {
            count: items.length,
            items,
            query: String(args.query ?? ""),
          }),
        );
      }

      if (name === PETROAGENT_MCP_TOOLS.summarizeContext) {
        const eventsResult = await this.callTool(PETROAGENT_MCP_TOOLS.listMarketEvents, {
          limit: args.limit,
        });
        const memoryResult = await this.callTool(PETROAGENT_MCP_TOOLS.searchAgentMemory, {
          limit: args.limit,
          query: String(args.query ?? "Petrobras"),
        });
        const events = (eventsResult.structuredContent as { events: unknown[] }).events;
        const sources = (memoryResult.structuredContent as { items: unknown[] }).items;
        const citations = sources.map((source) => {
          const record = source as { id: number; url: string | null };
          return record.url ?? `petroagent.sources:${record.id}`;
        });

        return castResult(
          textResult(
            `Foram consideradas ${sources.length} fontes e ${events.length} eventos persistidos.`,
            {
              citations,
              events,
              sources,
              summary: `Foram consideradas ${sources.length} fontes e ${events.length} eventos persistidos.`,
            },
          ),
        );
      }

      if (name === PETROAGENT_MCP_TOOLS.saveAgentReport) {
        const payload = args as AgentReportPayload;
        const { data, error } = await client
          .schema(PETROAGENT_SCHEMA)
          .from("agent_reports")
          .insert({
            attention_points: payload.attention_points ?? [],
            model_used: payload.model_used ?? "mcp",
            sentiment: payload.sentiment ?? null,
            sentiment_basis: payload.sentiment_basis ?? null,
            sentiment_confidence: payload.sentiment_confidence ?? null,
            sentiment_score: payload.sentiment_score ?? null,
            source_count: payload.source_count ?? 0,
            summary: payload.summary,
            title: payload.title ?? "Relatório PetroAgent",
          })
          .select("id")
          .single();

        if (error) throw error;

        const id = (data as { id: number }).id;

        return castResult(
          textResult(`Relatório salvo em agent_reports:${id}.`, {
            id,
            source: "petroagent.agent_reports",
          }),
        );
      }

      if (name === PETROAGENT_MCP_TOOLS.generateInformativeAnalysis) {
        const context = await this.callTool(PETROAGENT_MCP_TOOLS.summarizeContext, {
          limit: args.context_limit,
          query: args.query,
        });
        const structured = context.structuredContent as {
          citations: string[];
          summary: string;
        };
        const ticker = String(args.ticker ?? "PETR4").trim().toUpperCase();
        const payload: AgentReportPayload = {
          attention_points: [
            "Análise informativa baseada apenas no contexto persistido.",
            "Não representa recomendação de compra, venda ou manutenção.",
          ],
          model_used: "fallback",
          sentiment: "Neutro",
          sentiment_basis:
            "Contexto persistido insuficiente para indicar pressão informativa clara.",
          sentiment_confidence: "baixa",
          sentiment_score: 50,
          source_count: structured.citations.length,
          summary: `${ticker}: ${structured.summary}`,
          title: `Radar informativo ${ticker}`,
        };

        return castResult(
          textResult(payload.summary, {
            citations: structured.citations,
            payload,
          }),
        );
      }

      throw new Error(`Unsupported local MCP tool: ${name}`);
    },
  };
}
