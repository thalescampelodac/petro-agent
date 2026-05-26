import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { agentProfiles, getDefaultAgentProfile } from "../agents/registry.js";

export function registerGetAgentProfileTool(server: McpServer) {
  server.registerTool(
    "get_agent_profile",
    {
      annotations: {
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
        readOnlyHint: true,
      },
      description:
        "Retorna o perfil modular do agente monitorado e a abstração inicial de empresa/ativo.",
      title: "Perfil modular do agente",
    },
    async () => {
      const result = {
        active_profile: getDefaultAgentProfile(),
        available_profiles: agentProfiles,
      };

      return {
        content: [
          {
            text: `Perfil ativo: ${result.active_profile.name} para ${result.active_profile.asset.companyName}.`,
            type: "text",
          },
        ],
        structuredContent: result,
      };
    },
  );
}
