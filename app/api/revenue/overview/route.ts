import { NextResponse } from "next/server";
import { RevenueAuthError, requireRevenueCompanyAccess } from "@/apps/web/src/features/revenue/revenue-auth";
import { getRevenueOverview } from "@/apps/web/src/features/revenue/revenue-repository";

export async function GET(request: Request) {
  try {
    const companyId = new URL(request.url).searchParams.get("companyId")?.trim();
    if (!companyId) return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    await requireRevenueCompanyAccess(request, companyId);
    return NextResponse.json(await getRevenueOverview(companyId));
  } catch (error) {
    const status = error instanceof RevenueAuthError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status });
  }
}
