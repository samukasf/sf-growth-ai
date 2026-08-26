import { NextResponse } from "next/server";
import { listIcpProfiles, saveIcpProfile, type IcpInput } from "@/apps/web/src/features/revenue/revenue-repository";

export async function GET(request: Request) {
  try {
    const companyId = new URL(request.url).searchParams.get("companyId")?.trim();
    if (!companyId) return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    return NextResponse.json({ profiles: await listIcpProfiles(companyId) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<IcpInput>;
    if (!body.companyId?.trim() || !body.productService?.trim()) return NextResponse.json({ error: "companyId and productService are required" }, { status: 400 });
    const profile = await saveIcpProfile(body as IcpInput);
    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
