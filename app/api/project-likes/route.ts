import {
  getProjectLikesCount,
  registerProjectLike,
} from "@/services/project-likes";

function getSafeErrorReason(error: unknown) {
  if (!(error instanceof Error)) {
    return "unknown_error";
  }

  return error.message;
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
