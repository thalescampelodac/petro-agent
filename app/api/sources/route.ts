import {
  registerManualSource,
  type ManualSourceInput,
} from "@/services/petroagent-sources";

function getCollectorToken() {
  return process.env.PETROAGENT_COLLECTOR_TOKEN?.trim();
}

function getRequestToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return request.headers.get("x-petroagent-collector-token")?.trim();
}

function parseTextField(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseOptionalTextField(value: unknown) {
  const parsed = parseTextField(value);

  return parsed.length > 0 ? parsed : undefined;
}

function parseManualSourceInput(body: Record<string, unknown>): ManualSourceInput {
  const sourceType = parseTextField(body.sourceType);
  const rawContent = parseTextField(body.rawContent);

  if (!sourceType || !rawContent) {
    throw new Error("sourceType_and_rawContent_are_required");
  }

  return {
    publishedAt: parseOptionalTextField(body.publishedAt),
    rawContent,
    sourceType,
    title: parseOptionalTextField(body.title),
    url: parseOptionalTextField(body.url),
  };
}

export async function POST(request: Request) {
  const expectedToken = getCollectorToken();

  if (!expectedToken) {
    return Response.json(
      {
        reason: "collector_disabled",
        source: "disabled",
      },
      { status: 503 },
    );
  }

  if (getRequestToken(request) !== expectedToken) {
    return Response.json(
      {
        reason: "unauthorized",
        source: "manual-collector",
      },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const input = parseManualSourceInput(body);
    const result = await registerManualSource(input);
    const status = result.source === "disabled" ? 503 : 201;

    return Response.json(result, { status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";

    return Response.json(
      {
        detail: message,
        reason: "invalid_manual_source",
        source: "manual-collector",
      },
      { status: message.endsWith("_required") ? 400 : 500 },
    );
  }
}
