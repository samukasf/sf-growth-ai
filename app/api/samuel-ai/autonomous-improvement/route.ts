import { buildAutonomousImprovementReport } from "@/features/samuel-ai/autonomous-improvement";

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

function isAuthorizedWrite(request: Request) {
  const secret = process.env.SAMUEL_AUTONOMY_CRON_SECRET;
  if (!secret) return true;
  return request.headers.get("x-samuel-autonomy-secret") === secret;
}

export async function GET(request: Request) {
  const report = buildAutonomousImprovementReport({
    mode: modeFromRequest(request),
  });

  return Response.json(report, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  if (!isAuthorizedWrite(request)) {
    return Response.json(
      { error: "A execução manual exige x-samuel-autonomy-secret." },
      { status: 401 },
    );
  }

  const report = buildAutonomousImprovementReport({
    mode: "manual",
  });

  return Response.json(report, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

