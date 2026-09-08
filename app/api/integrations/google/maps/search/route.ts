import { NextResponse } from "next/server";

import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { searchGooglePlaces } from "@/features/google-integrations/google-capabilities.server";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Body = {
  companyId?: string;
  query?: string;
  maxResults?: number;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const companyId = body.companyId?.trim();
  const query = body.query?.trim();
  if (!companyId || !UUID_PATTERN.test(companyId)) {
    return NextResponse.json({ error: "Empresa inválida" }, { status: 400 });
  }
  if (!query) {
    return NextResponse.json({ error: "Pesquisa obrigatória" }, { status: 400 });
  }

  const auth = await authorizeCompanyRequest(companyId);
  if (!auth.ok) return auth.response;

  try {
    const places = await searchGooglePlaces(companyId, query, body.maxResults ?? 10);
    return NextResponse.json(
      { ok: true, places },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao pesquisar Google Maps";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
