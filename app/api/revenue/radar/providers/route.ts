import { NextResponse } from "next/server";
import { getLeadDiscoveryStatus } from "@/apps/web/src/features/revenue/lead-discovery";
import { RevenueAuthError, requireRevenueCompanyAccess } from "@/apps/web/src/features/revenue/revenue-auth";

export async function GET(request: Request) {
  try {
    const companyId = new URL(request.url).searchParams.get("companyId")?.trim();
    if (!companyId) return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    await requireRevenueCompanyAccess(request, companyId);
    return NextResponse.json({ providers: getLeadDiscoveryStatus() });
  } catch (error) {
    const status = error instanceof RevenueAuthError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status });
  }
}
