import { NextResponse } from "next/server";

import { runSuperbrain } from "@/apps/web/src/core/superbrain";

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

    const result = await runSuperbrain({
      query,
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
