import {
  getProjectLikesCount,
  registerProjectLike,
} from "@/services/project-likes";

function getSafeErrorReason(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
    };
  }

  if (error && typeof error === "object") {
    const safeFields = ["code", "message", "details", "hint", "status"] as const;
    const details = safeFields.reduce<Record<string, string>>((acc, field) => {
      const value = (error as Record<string, unknown>)[field];

      if (typeof value === "string" || typeof value === "number") {
        acc[field] = String(value);
      }

      return acc;
    }, {});

    const constructorName = error.constructor?.name;

    if (constructorName && constructorName !== "Object") {
      details.name = constructorName;
    }

    const stringValue = String(error);

    if (stringValue !== "[object Object]") {
      details.value = stringValue;
    }

    if (Object.keys(details).length > 0) {
      return details;
    }
  }

  return "unknown_error";
}

export async function GET() {
  try {
    return Response.json(await getProjectLikesCount());
  } catch (error) {
    return Response.json(
      {
        count: null,
        detail: getSafeErrorReason(error),
        reason: "supabase_unavailable",
        source: "local-fallback",
      },
      { status: 503 },
    );
  }
}

export async function POST() {
  try {
    return Response.json(await registerProjectLike());
  } catch (error) {
    return Response.json(
      {
        count: null,
        detail: getSafeErrorReason(error),
        reason: "supabase_unavailable",
        source: "local-fallback",
      },
      { status: 503 },
    );
  }
}
