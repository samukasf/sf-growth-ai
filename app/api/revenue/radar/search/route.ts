import { NextResponse } from "next/server";
import { getLeadDiscoveryProvider, type LeadDiscoveryQuery } from "@/apps/web/src/features/revenue/lead-discovery";
import { RevenueAuthError, requireRevenueCompanyAccess } from "@/apps/web/src/features/revenue/revenue-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { companyId?: string; provider?: string; query?: Partial<LeadDiscoveryQuery> };
    if (!body.companyId?.trim() || !body.query?.sector?.trim()) return NextResponse.json({ error: "companyId and query.sector are required" }, { status: 400 });
    await requireRevenueCompanyAccess(request, body.companyId);
    const provider = getLeadDiscoveryProvider(body.provider || "google_places");
    if (!provider) return NextResponse.json({ error: "Unknown discovery provider" }, { status: 400 });
    if (!provider.configured()) return NextResponse.json({ error: `${provider.id} is not connected`, connectRequired: true }, { status: 409 });
    const leads = await provider.discover(body.query as LeadDiscoveryQuery);
    return NextResponse.json({ provider: provider.id, count: leads.length, leads });
  } catch (error) {
    const status = error instanceof RevenueAuthError ? error.status : 502;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status });
  }
}
