import { executeManualPetroAgent } from "@/services/agent-executor";

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return request.headers.get("x-petroagent-agent-token")?.trim();
}

function getManualRunToken() {
  return process.env.PETROAGENT_AGENT_RUN_TOKEN?.trim();
}

function getCronSecret() {
  return process.env.CRON_SECRET?.trim();
}

function unauthorized() {
  return Response.json(
    {
      reason: "unauthorized",
      source: "petroagent-agent-runner",
    },
    { status: 401 },
  );
}

function disabled(reason = "agent_runner_disabled") {
  return Response.json(
    {
      reason,
      source: "petroagent-agent-runner",
    },
    { status: 503 },
  );
}

async function runAgent(origin: string) {
  try {
    const result = await executeManualPetroAgent({ origin });
    const status = result.status === "disabled" ? 503 : 200;

    return Response.json(result, { status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";

    return Response.json(
      {
        detail: message,
        reason: "agent_execution_failed",
        source: "petroagent-agent-runner",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const expectedToken = getManualRunToken();

  if (!expectedToken) {
    return disabled();
  }

  if (getBearerToken(request) !== expectedToken) {
    return unauthorized();
  }

  return runAgent("manual-api");
}

export async function GET(request: Request) {
  const expectedToken = getCronSecret();

  if (!expectedToken) {
    return disabled("cron_disabled");
  }

  if (getBearerToken(request) !== expectedToken) {
    return unauthorized();
  }

  return runAgent("vercel-cron");
}
