import { NextResponse } from "next/server";

import { runDiscovery } from "@/apps/web/src/core/discovery";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      companyName?: string;
      website?: string;
      instagram?: string;
      facebook?: string;
      city?: string;
      tenantId?: string;
      companyId?: string;
      userId?: string;
    };

    const companyName = body.companyName?.trim();
    if (!companyName) {
      return NextResponse.json({ error: "companyName is required" }, { status: 400 });
    }

    const result = await runDiscovery({
      companyName,
      website: body.website,
      instagram: body.instagram,
      facebook: body.facebook,
      city: body.city,
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
