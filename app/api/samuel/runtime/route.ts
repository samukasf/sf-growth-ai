import { NextResponse } from "next/server";

import { runSamuelRuntime } from "@/features/samuel-runtime";
import {
  buildExecutiveContext,
  getFirstCompany,
} from "@/services/executive-context.service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      query?: string;
      companyId?: string;
      organizationId?: string;
      companyName?: string;
    };

    const query = body.query?.trim();
    if (!query) {
      return NextResponse.json({ error: "query é obrigatório" }, { status: 400 });
    }

    let companyId = body.companyId;
    let companyName = body.companyName;
    let companyContext = null;

    if (companyId) {
      try {
        companyContext = await buildExecutiveContext(companyId);
        companyName = companyName ?? companyContext.company.name;
      } catch {
        companyContext = null;
      }
    } else {
      try {
        const company = await getFirstCompany();
        if (company) {
          companyId = company.id;
          companyName = company.name;
          companyContext = await buildExecutiveContext(company.id);
        }
      } catch {
        companyContext = null;
      }
    }

    const result = await runSamuelRuntime({
      query,
      companyId,
      organizationId: body.organizationId ?? "default-org",
      companyName,
      companyContext,
      animate: false,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
