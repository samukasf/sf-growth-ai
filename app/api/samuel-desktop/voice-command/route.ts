import { createHash } from "node:crypto";

import {
  listDesktopDevices,
  queueDesktopCommand,
} from "@/features/samuel-desktop/server/desktop-agent.server";
import { authorizeAuthenticatedRequest } from "@/features/auth/server/authorization";
import { getSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jsonError(message: string, status: number, code: string) {
  return Response.json(
    { error: message, code },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}

function approvalReference(userId: string, goal: string) {
  const digest = createHash("sha256").update(goal).digest("hex").slice(0, 24);
  return `voice:${userId}:${Date.now()}:${digest}`;
}

export async function POST(request: Request) {
  const auth = await authorizeAuthenticatedRequest();
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("JSON inválido.", 400, "INVALID_JSON");
  }

  const goal = String(body.goal ?? "").trim().slice(0, 4000);
  const requestedCompanyId =
    typeof body.companyId === "string" && UUID_PATTERN.test(body.companyId)
      ? body.companyId
      : null;

  if (!goal) return jsonError("O objetivo do comando de voz está vazio.", 400, "VOICE_GOAL_REQUIRED");

  try {
    const devices = await listDesktopDevices(auth.user.id);
    const paired = devices
      .filter((device) => device.status === "paired")
      .filter((device) => !requestedCompanyId || !device.company_id || device.company_id === requestedCompanyId)
      .sort((a, b) => Date.parse(b.last_seen_at ?? b.created_at) - Date.parse(a.last_seen_at ?? a.created_at));

    const device = paired[0];
    if (!device) {
      return jsonError(
        "Nenhum Samuel Desktop está conectado. Abra o aplicativo no Windows e faça o pareamento primeiro.",
        409,
        "DESKTOP_NOT_CONNECTED",
      );
    }

    if (device.last_seen_at && Date.now() - Date.parse(device.last_seen_at) > 45_000) {
      return jsonError(
        `O computador ${device.device_name} parece offline. Abra o Samuel Desktop e tente novamente.`,
        409,
        "DESKTOP_OFFLINE",
      );
    }

    const command = await queueDesktopCommand({
      userId: auth.user.id,
      deviceId: device.id,
      companyId: requestedCompanyId,
      action: "computer.task",
      args: { goal },
      risk: "sensitive",
      approved: true,
      approvalReference: approvalReference(auth.user.id, goal),
    });

    return Response.json(
      {
        ok: true,
        commandId: command.id,
        status: command.status,
        deviceId: device.id,
        deviceName: device.device_name,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Não foi possível enviar o comando de voz ao computador.",
      400,
      "VOICE_COMMAND_FAILED",
    );
  }
}

export async function GET(request: Request) {
  const auth = await authorizeAuthenticatedRequest();
  if (!auth.ok) return auth.response;

  const commandId = new URL(request.url).searchParams.get("commandId")?.trim() ?? "";
  if (!UUID_PATTERN.test(commandId)) {
    return jsonError("commandId inválido.", 400, "COMMAND_ID_INVALID");
  }

  const { data, error } = await getSupabaseServiceClient()
    .from("samuel_desktop_commands")
    .select("id,device_id,action,status,result,evidence,error_message,created_at,started_at,completed_at")
    .eq("id", commandId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) return jsonError(error.message, 500, "COMMAND_LOOKUP_FAILED");
  if (!data) return jsonError("Comando não encontrado.", 404, "COMMAND_NOT_FOUND");

  return Response.json(
    {
      command: data,
      terminal: ["verified", "failed", "cancelled"].includes(data.status),
      verified: data.status === "verified" && Boolean(data.evidence),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
