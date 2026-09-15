import { NextResponse } from "next/server";
import { RevenueAuthError, requireRevenueCompanyAccess } from "@/apps/web/src/features/revenue/revenue-auth";
import { listIcpProfiles, saveIcpProfile, type IcpInput } from "@/apps/web/src/features/revenue/revenue-repository";

function failure(error: unknown) {
  const status = error instanceof RevenueAuthError ? error.status : 500;
  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  try {
    const companyId = new URL(request.url).searchParams.get("companyId")?.trim();
    if (!companyId) return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    await requireRevenueCompanyAccess(request, companyId);
    return NextResponse.json({ profiles: await listIcpProfiles(companyId) });
  } catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<IcpInput>;
    if (!body.companyId?.trim() || !body.productService?.trim()) return NextResponse.json({ error: "companyId and productService are required" }, { status: 400 });
    await requireRevenueCompanyAccess(request, body.companyId);
    return NextResponse.json({ profile: await saveIcpProfile(body as IcpInput) }, { status: 201 });
  } catch (error) { return failure(error); }
}
