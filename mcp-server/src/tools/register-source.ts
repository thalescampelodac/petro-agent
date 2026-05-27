import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { createPetroAgentSupabaseClient } from "../db/supabase.js";

type RegisterSourceParams = {
  processed?: boolean;
  published_at?: string | null;
  raw_content: string;
  source_type: string;
  title?: string | null;
  url?: string | null;
};

type RegisterSourceResult = {
  id: number;
  source: "petroagent.sources";
};

const registerSourceInputSchema = {
  processed: z.boolean().optional().describe("Indica se a fonte já foi processada."),
  published_at: z.string().datetime().nullable().optional(),
  raw_content: z.string().min(1).max(50_000),
  source_type: z.string().min(2).max(80),
  title: z.string().min(1).max(300).nullable().optional(),
  url: z.string().url().nullable().optional(),
};

export async function registerSource(
  params: RegisterSourceParams,
): Promise<RegisterSourceResult> {
  const client = createPetroAgentSupabaseClient();
  const row = {
    processed: params.processed ?? false,
    published_at: params.published_at ?? null,
    raw_content: params.raw_content,
    source_type: params.source_type,
    title: params.title ?? null,
    url: params.url ?? null,
  };
  const query = params.url
    ? client
        .schema("petroagent")
        .from("sources")
        .upsert(row, { onConflict: "url" })
    : client.schema("petroagent").from("sources").insert(row);

  const { data, error } = await query.select("id").single();

  if (error) {
    throw error;
  }

  return {
    id: (data as { id: number }).id,
    source: "petroagent.sources",
  };
}

export function registerRegisterSourceTool(server: McpServer) {
  server.registerTool(
    "register_source",
    {
      annotations: {
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
        readOnlyHint: false,
      },
      description:
        "Registra ou atualiza uma fonte pública em petroagent.sources para uso do agente.",
      inputSchema: registerSourceInputSchema,
      title: "Registrar fonte PetroAgent",
    },
    async (args) => {
      const result = await registerSource(args);

      return {
        content: [{ text: `Fonte registrada em petroagent.sources:${result.id}.`, type: "text" }],
        structuredContent: result,
      };
    },
  );
}
