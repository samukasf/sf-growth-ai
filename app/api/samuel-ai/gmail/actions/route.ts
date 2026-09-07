import { NextResponse } from "next/server";

import {
  verifyGmailConfirmation,
  type GmailActionArgs,
  type GmailActionId,
} from "@/features/gmail";
import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import {
  executeSamuelGmailAction,
  SamuelActionDuplicateRequestError,
} from "@/features/samuel-ai/actions/samuel-tool-action-executor.server";

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

    const auth = await authorizeCompanyRequest(payload.companyId);
    if (!auth.ok) return auth.response;

    const execution = await executeSamuelGmailAction({
      identity: {
        companyId: payload.companyId,
        userId: auth.user.id,
        sessionId: `gmail-confirmation:${payload.companyId}`,
        turnId: `${payload.actionId}:${payload.issuedAt}`,
      },
      actionId: payload.actionId,
      args: payload.args,
      confirmation: {
        confirmationToken: body.confirmationToken,
      },
    });

    return NextResponse.json(execution.result, {
      status: execution.result.ok ? 200 : 502,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if (error instanceof SamuelActionDuplicateRequestError) {
      return NextResponse.json(
        { error: "Esta ação já foi processada e não será executada novamente." },
        { status: 409, headers: { "Cache-Control": "private, no-store" } },
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao executar ação Gmail" },
      { status: 400 },
    );
  }
}
