import { loadEnvConfig } from "@next/env";

import { executeManualPetroAgent } from "../services/agent-executor";

loadEnvConfig(process.cwd());

async function main() {
  const result = await executeManualPetroAgent();

  if (result.status === "disabled") {
    console.error(
      "PetroAgent manual run disabled: configure NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    JSON.stringify(
      {
        engine: result.engine,
        logId: result.logId,
        reportId: result.reportId,
        sourceCount: result.sourceCount,
        status: result.status,
        summary: result.summary,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
