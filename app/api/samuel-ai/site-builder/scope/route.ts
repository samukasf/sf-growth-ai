import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { authorizeCompanyRequest } from "@/features/auth/server/authorization";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const companyId = new URL(request.url).searchParams.get("companyId")?.trim();
  if (!companyId) {
    return NextResponse.json({ error: "Empresa obrigatória." }, { status: 400 });
  }

  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;

  const scope = createHash("sha256")
    .update(`${auth.user.id}:${companyId}:site-builder-v2`)
    .digest("hex")
    .slice(0, 32);

  return NextResponse.json(
    { ok: true, scope },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
