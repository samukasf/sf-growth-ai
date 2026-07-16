import { NextResponse } from "next/server";

import { buildGoogleWorkspaceSummary } from "@/features/google-workspace/google-workspace-summary.server";
import { getCompanyById } from "@/services/executive-context.service";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const companyId = new URL(request.url).searchParams.get("companyId")?.trim();

  if (!companyId || !UUID_PATTERN.test(companyId)) {
    return NextResponse.json({ error: "Empresa inválida" }, { status: 400 });
  }

  try {
    const company = await getCompanyById(companyId);
    if (!company) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    const summary = await buildGoogleWorkspaceSummary(companyId);
    return NextResponse.json(summary, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao consultar o Google Workspace";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
