import { NextResponse } from "next/server";

import {
  executeCalendarTool,
  verifyCalendarConfirmation,
  type CalendarActionArgs,
  type CalendarActionId,
} from "@/features/google-calendar";

export const dynamic = "force-dynamic";

type Body = {
  companyId?: string;
  actionId?: CalendarActionId;
  args?: CalendarActionArgs;
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
    const payload = verifyCalendarConfirmation(body.confirmationToken);
    if (body.companyId && body.companyId !== payload.companyId) {
      return NextResponse.json({ error: "Empresa não corresponde ao token." }, { status: 403 });
    }
    if (body.actionId && body.actionId !== payload.actionId) {
      return NextResponse.json({ error: "Ação não corresponde ao token." }, { status: 403 });
    }

    const result = await executeCalendarTool(
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
      { error: error instanceof Error ? error.message : "Falha ao executar ação Google Agenda" },
      { status: 400 },
    );
  }
}
