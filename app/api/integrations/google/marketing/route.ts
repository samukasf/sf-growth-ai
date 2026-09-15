import { NextResponse } from "next/server";

import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { getGoogleMarketingOverview } from "@/features/google-integrations/google-marketing.server";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const companyId = new URL(request.url).searchParams.get("companyId")?.trim();
  if (!companyId || !UUID_PATTERN.test(companyId)) {
    return NextResponse.json({ error: "Empresa inválida" }, { status: 400 });
  }

  const auth = await authorizeCompanyRequest(companyId);
  if (!auth.ok) return auth.response;

  try {
    const overview = await getGoogleMarketingOverview(companyId);
    return NextResponse.json(overview, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível consultar as integrações de marketing do Google.",
      },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
