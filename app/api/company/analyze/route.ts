import { NextResponse } from "next/server";

import { analyzeCompany } from "@/apps/web/src/features/company-analysis/company-analysis.service";
import {
  authorizeAuthenticatedRequest,
  authorizeCompanyRequest,
} from "@/features/auth/server/authorization";

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

    const auth = body.companyId
      ? await authorizeCompanyRequest(body.companyId)
      : await authorizeAuthenticatedRequest();
    if (!auth.ok) return auth.response;

    const result = await analyzeCompany({
      companyName,
      tenantId: body.companyId ? `company-${body.companyId}` : `user-${auth.user.id}`,
      companyId: body.companyId,
      userId: auth.user.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
