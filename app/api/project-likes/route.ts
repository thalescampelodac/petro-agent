import {
  getProjectLikesCount,
  registerProjectLike,
} from "@/services/project-likes";

export async function GET() {
  try {
    return Response.json(await getProjectLikesCount());
  } catch {
    return Response.json(
      {
        count: null,
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
  } catch {
    return Response.json(
      {
        count: null,
        reason: "supabase_unavailable",
        source: "local-fallback",
      },
      { status: 503 },
    );
  }
}
