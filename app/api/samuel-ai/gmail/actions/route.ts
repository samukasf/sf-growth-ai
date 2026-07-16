import { NextResponse } from "next/server";

import {
  executeGmailTool,
  verifyGmailConfirmation,
  type GmailActionArgs,
  type GmailActionId,
} from "@/features/gmail";

export const dynamic = "force-dynamic";

type Body = {
  companyId?: string;
  actionId?: GmailActionId;
  args?: GmailActionArgs;
  confirmationToken?: string;
  confirm?: boolean;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.confirm) {
    return NextResponse.json(
      { error: "Confirmação explícita obrigatória (confirm: true)." },
      { status: 400 },
    );
  }

  if (!body.confirmationToken) {
    return NextResponse.json({ error: "confirmationToken em falta." }, { status: 400 });
  }

  try {
    const payload = verifyGmailConfirmation(body.confirmationToken);
    if (body.companyId && body.companyId !== payload.companyId) {
      return NextResponse.json({ error: "Empresa não corresponde ao token." }, { status: 403 });
    }
    if (body.actionId && body.actionId !== payload.actionId) {
      return NextResponse.json({ error: "Ação não corresponde ao token." }, { status: 403 });
    }

    const result = await executeGmailTool(
      payload.companyId,
      payload.actionId,
      body.args ?? payload.args,
    );

    return NextResponse.json(result, {
      status: result.ok ? 200 : 502,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao executar ação Gmail" },
      { status: 400 },
    );
  }
}
