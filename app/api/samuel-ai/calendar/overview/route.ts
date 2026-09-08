import { NextResponse } from "next/server";

import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { executeCalendarTool } from "@/features/google-calendar";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const companyId = url.searchParams.get("companyId")?.trim();
  const view = url.searchParams.get("view") === "today" ? "today" : "week";

  if (!companyId || !UUID_PATTERN.test(companyId)) {
    return NextResponse.json({ error: "Empresa inválida" }, { status: 400 });
  }

  const auth = await authorizeCompanyRequest(companyId);
  if (!auth.ok) return auth.response;

  const result = await executeCalendarTool(
    companyId,
    view === "today" ? "calendar_today" : "calendar_week",
    { maxResults: view === "today" ? 12 : 30 },
  );

  return NextResponse.json(result, {
    status: result.ok ? 200 : 502,
    headers: { "Cache-Control": "private, no-store" },
  });
}
