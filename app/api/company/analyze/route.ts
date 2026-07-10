import { NextResponse } from "next/server";

import { analyzeCompany } from "@/apps/web/src/features/company-analysis/company-analysis.service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      companyName?: string;
      tenantId?: string;
      companyId?: string;
      userId?: string;
    };

    const companyName = body.companyName?.trim();
    if (!companyName) {
      return NextResponse.json({ error: "companyName is required" }, { status: 400 });
    }

    const result = await analyzeCompany({
      companyName,
      tenantId: body.tenantId,
      companyId: body.companyId,
      userId: body.userId,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
