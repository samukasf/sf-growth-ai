import {
  cancelDesktopCommand,
  claimDesktopDevice,
  isDesktopAction,
  isDesktopRisk,
  listDesktopDevices,
  listRecentDesktopCommands,
  queueDesktopCommand,
  setDesktopDeviceStatus,
  type DesktopAction,
  type DesktopRisk,
} from "@/features/samuel-desktop/server/desktop-agent.server";
import { authorizeAuthenticatedRequest } from "@/features/auth/server/authorization";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number, code: string) {
  return Response.json(
    { error: message, code },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}

const MINIMUM_RISK: Partial<Record<DesktopAction, DesktopRisk>> = {
  "system.app.open": "mutate",
  "system.window.focus": "mutate",
  "browser.open": "mutate",
  "files.write": "mutate",
  "pointer.click": "mutate",
  "pointer.double_click": "mutate",
  "pointer.scroll": "mutate",
  "keyboard.type": "mutate",
  "keyboard.shortcut": "mutate",
  "computer.task": "sensitive",
};

const RISK_WEIGHT: Record<DesktopRisk, number> = {
  read: 0,
  draft: 1,
  mutate: 2,
  sensitive: 3,
};

function effectiveRisk(action: DesktopAction, requested: DesktopRisk) {
  const minimum = MINIMUM_RISK[action];
  if (!minimum || RISK_WEIGHT[requested] >= RISK_WEIGHT[minimum]) return requested;
  return minimum;
}

export async function GET() {
  const auth = await authorizeAuthenticatedRequest();
  if (!auth.ok) return auth.response;

  try {
    const [devices, commands] = await Promise.all([
      listDesktopDevices(auth.user.id),
      listRecentDesktopCommands(auth.user.id),
    ]);
    return Response.json(
      { devices, commands },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Falha ao carregar o Samuel Desktop.",
      500,
      "DESKTOP_CONTROL_LOAD_FAILED",
    );
  }
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

  const operation = String(body.operation ?? "");

  try {
    if (operation === "claim") {
      const pairingCode = String(body.pairingCode ?? "").trim();
      const companyId = typeof body.companyId === "string" ? body.companyId.trim() : null;
      const device = await claimDesktopDevice({
        pairingCode,
        userId: auth.user.id,
        companyId,
      });
      return Response.json({ ok: true, device });
    }

    if (operation === "command") {
      const deviceId = String(body.deviceId ?? "").trim();
      const action = body.action;
      const requestedRisk = body.risk;
      if (!deviceId) return jsonError("deviceId obrigatório.", 400, "DEVICE_ID_REQUIRED");
      if (!isDesktopAction(action)) return jsonError("Ação desktop inválida.", 400, "DESKTOP_ACTION_INVALID");
      if (!isDesktopRisk(requestedRisk)) return jsonError("Risco desktop inválido.", 400, "DESKTOP_RISK_INVALID");

      const risk = effectiveRisk(action, requestedRisk);
      const command = await queueDesktopCommand({
        userId: auth.user.id,
        deviceId,
        companyId: typeof body.companyId === "string" ? body.companyId.trim() : null,
        action,
        args:
          body.args && typeof body.args === "object" && !Array.isArray(body.args)
            ? (body.args as Record<string, unknown>)
            : {},
        risk,
        approved: body.approved === true,
        approvalReference:
          typeof body.approvalReference === "string" ? body.approvalReference.slice(0, 500) : null,
      });
      return Response.json({ ok: true, command });
    }

    if (operation === "cancel") {
      const commandId = String(body.commandId ?? "").trim();
      if (!commandId) return jsonError("commandId obrigatório.", 400, "COMMAND_ID_REQUIRED");
      const command = await cancelDesktopCommand(auth.user.id, commandId);
      return Response.json({ ok: true, command });
    }

    if (operation === "device_status") {
      const deviceId = String(body.deviceId ?? "").trim();
      const status = String(body.status ?? "");
      if (!deviceId) return jsonError("deviceId obrigatório.", 400, "DEVICE_ID_REQUIRED");
      if (!["paired", "paused", "revoked"].includes(status)) {
        return jsonError("Estado do dispositivo inválido.", 400, "DEVICE_STATUS_INVALID");
      }
      const device = await setDesktopDeviceStatus(
        auth.user.id,
        deviceId,
        status as "paired" | "paused" | "revoked",
      );
      return Response.json({ ok: true, device });
    }

    return jsonError("Operação desconhecida.", 400, "DESKTOP_OPERATION_UNKNOWN");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha no controle do Samuel Desktop.";
    const status = /confirmação explícita/i.test(message) ? 409 : /acesso negado/i.test(message) ? 403 : 400;
    return jsonError(message, status, "DESKTOP_CONTROL_FAILED");
  }
}
