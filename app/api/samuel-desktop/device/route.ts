import { createHash } from "node:crypto";

import {
  authenticateDesktopDevice,
  completeDesktopCommand,
  heartbeatDesktopDevice,
  pollDesktopCommand,
  registerDesktopDevice,
} from "@/features/samuel-desktop/server/desktop-agent.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REGISTRATIONS = 8;

function clientKey(request: Request) {
  const ip =
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  return createHash("sha256").update(`samuel-desktop:${ip}`).digest("hex");
}

function registrationRateLimited(request: Request) {
  const key = clientKey(request);
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REGISTRATIONS;
}

function jsonError(message: string, status: number, code: string) {
  return Response.json(
    { error: message, code },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("JSON inválido.", 400, "INVALID_JSON");
  }

  const action = String(body.action ?? "");

  if (action === "register") {
    if (registrationRateLimited(request)) {
      return jsonError("Muitas tentativas de registro. Tente novamente em um minuto.", 429, "REGISTER_RATE_LIMITED");
    }
    try {
      const registration = await registerDesktopDevice({
        deviceName: body.deviceName,
        platform: body.platform,
        capabilities: body.capabilities,
      });
      return Response.json(registration, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      return jsonError(
        error instanceof Error ? error.message : "Falha ao registrar o dispositivo.",
        500,
        "REGISTER_FAILED",
      );
    }
  }

  const device = await authenticateDesktopDevice(request);
  if (!device) return jsonError("Dispositivo não autorizado.", 401, "DEVICE_UNAUTHORIZED");

  try {
    await heartbeatDesktopDevice(device.id);

    if (action === "pair_status") {
      return Response.json(
        {
          deviceId: device.id,
          name: device.device_name,
          status: device.status,
          paired: device.status === "paired" && Boolean(device.user_id),
          companyId: device.company_id,
          pairedAt: device.paired_at,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    if (action === "heartbeat") {
      return Response.json({ ok: true, status: device.status });
    }

    if (action === "poll") {
      if (device.status === "paused") {
        return Response.json({ command: null, paused: true }, { headers: { "Cache-Control": "no-store" } });
      }
      const command = await pollDesktopCommand(device);
      return Response.json({ command }, { headers: { "Cache-Control": "no-store" } });
    }

    if (action === "result") {
      const commandId = String(body.commandId ?? "").trim();
      if (!commandId) return jsonError("commandId obrigatório.", 400, "COMMAND_ID_REQUIRED");
      const result = await completeDesktopCommand({
        deviceId: device.id,
        commandId,
        success: body.success === true,
        verified: body.verified === true,
        result: body.result,
        evidence: body.evidence,
        errorMessage: typeof body.errorMessage === "string" ? body.errorMessage.slice(0, 2000) : null,
      });
      return Response.json({ ok: true, command: result }, { headers: { "Cache-Control": "no-store" } });
    }

    return jsonError("Ação de dispositivo desconhecida.", 400, "DEVICE_ACTION_UNKNOWN");
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Falha no transporte do dispositivo.",
      500,
      "DEVICE_TRANSPORT_FAILED",
    );
  }
}
