import { buildAutonomousImprovementReport } from "@/features/samuel-ai/autonomous-improvement";
import { authorizeAuthenticatedRequest } from "@/features/auth/server/authorization";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function modeFromRequest(request: Request) {
  const url = new URL(request.url);
  const requestedMode = url.searchParams.get("mode");
  if (requestedMode === "cron" || request.headers.get("user-agent")?.includes("vercel-cron")) {
    return "cron" as const;
  }
  return "status" as const;
}

function isAuthorizedCron(request: Request) {
  const secret = process.env.CRON_SECRET ?? process.env.SAMUEL_AUTONOMY_CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  const mode = modeFromRequest(request);
  if (mode === "cron") {
    if (!isAuthorizedCron(request)) {
      return Response.json({ error: "Cron não autorizado." }, { status: 401 });
    }
  } else {
    const auth = await authorizeAuthenticatedRequest();
    if (!auth.ok) return auth.response;
  }

  const report = buildAutonomousImprovementReport({
    mode,
  });

  return Response.json(report, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST() {
  const auth = await authorizeAuthenticatedRequest();
  if (!auth.ok) return auth.response;

  const report = buildAutonomousImprovementReport({
    mode: "manual",
  });

  return Response.json(report, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
