import { NextResponse } from "next/server";

import { runSamuelRuntimeWithExecutionMemory } from "@/features/samuel-execution-memory";
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
      /** Aceito apenas como fallback de desenvolvimento — ver resolve-execution-user.ts */
      userId?: string;
      /** Identifica a conversa ativa para a Conversation Memory (Sprint 81). */
      conversationId?: string;
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

    const result = await runSamuelRuntimeWithExecutionMemory({
      query,
      companyId,
      organizationId: body.organizationId ?? "default-org",
      companyName,
      companyContext,
      animate: false,
      userId: body.userId,
      authorizationHeader: request.headers.get("authorization"),
      conversationId: body.conversationId,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
