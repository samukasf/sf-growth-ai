import { NextResponse } from "next/server";

import { buildCompanyBrain } from "@/apps/web/src/core/company-brain";
import type { DiscoveryResult } from "@/apps/web/src/core/discovery";
import { runDiscovery } from "@/apps/web/src/core/discovery";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      discoveryResult?: DiscoveryResult;
      companyName?: string;
      website?: string;
      instagram?: string;
      facebook?: string;
      city?: string;
      tenantId?: string;
      companyId?: string;
      userId?: string;
    };

    let discoveryResult = body.discoveryResult;

    if (!discoveryResult) {
      const companyName = body.companyName?.trim();
      if (!companyName) {
        return NextResponse.json(
          { error: "discoveryResult or companyName is required" },
          { status: 400 },
        );
      }

      discoveryResult = await runDiscovery({
        companyName,
        website: body.website,
        instagram: body.instagram,
        facebook: body.facebook,
        city: body.city,
        tenantId: body.tenantId,
        companyId: body.companyId,
        userId: body.userId,
      });
    }

    const response = await buildCompanyBrain({
      discoveryResult,
      tenantId: body.tenantId,
      companyId: body.companyId,
    });

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
