import { NextResponse } from "next/server";

import { runSuperbrain } from "@/apps/web/src/core/superbrain";
import {
  authorizeAuthenticatedRequest,
  authorizeCompanyRequest,
} from "@/features/auth/server/authorization";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      query?: string;
      tenantId?: string;
      companyId?: string;
      userId?: string;
    };

    const query = body.query?.trim();
    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const auth = body.companyId
      ? await authorizeCompanyRequest(body.companyId)
      : await authorizeAuthenticatedRequest();
    if (!auth.ok) return auth.response;

    const result = await runSuperbrain({
      query,
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
