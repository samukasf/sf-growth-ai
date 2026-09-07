import { NextResponse } from "next/server";

import { getVercelDeploymentStatus } from "@/features/vercel-deployment/vercel-deployment.server";
import { authorizeAuthenticatedRequest } from "@/features/auth/server/authorization";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await authorizeAuthenticatedRequest();
  if (!auth.ok) return auth.response;
  try {
    const status = await getVercelDeploymentStatus();
    return NextResponse.json(status, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao consultar o deploy";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
