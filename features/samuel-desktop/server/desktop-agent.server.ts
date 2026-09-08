import "server-only";

import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  randomUUID,
} from "node:crypto";

import { userCanAccessCompany } from "@/features/auth/server/authorization";
import { getSupabaseServiceClient } from "@/lib/supabase/service-client";

export type DesktopRisk = "read" | "draft" | "mutate" | "sensitive";
export type DesktopDeviceStatus = "pending" | "paired" | "paused" | "revoked";

export const DESKTOP_ACTIONS = [
  "system.apps.list",
  "system.app.open",
  "system.windows.list",
  "system.window.focus",
  "system.screenshot",
  "browser.open",
  "files.read",
  "files.write",
  "pointer.click",
  "pointer.double_click",
  "pointer.scroll",
  "keyboard.type",
  "keyboard.shortcut",
  "computer.task",
] as const;

export type DesktopAction = (typeof DESKTOP_ACTIONS)[number];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DEVICE_TOKEN_BYTES = 32;
const COMMAND_SECRET_BYTES = 32;
const PAIRING_TTL_MS = 10 * 60 * 1000;
const COMMAND_TTL_MS = 10 * 60 * 1000;

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function randomSecret(bytes: number) {
  return base64Url(randomBytes(bytes));
}

function cleanDeviceName(value: unknown) {
  const name = String(value ?? "Samuel Desktop").trim().slice(0, 120);
  return name || "Samuel Desktop";
}

function cleanCapabilities(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, 80))
    .filter(Boolean)
    .slice(0, 40);
}

export function isDesktopAction(value: unknown): value is DesktopAction {
  return DESKTOP_ACTIONS.includes(value as DesktopAction);
}

export function isDesktopRisk(value: unknown): value is DesktopRisk {
  return ["read", "draft", "mutate", "sensitive"].includes(String(value));
}

export async function registerDesktopDevice(input: {
  deviceName?: unknown;
  platform?: unknown;
  capabilities?: unknown;
}) {
  const client = getSupabaseServiceClient();
  const deviceId = randomUUID();
  const token = randomSecret(DEVICE_TOKEN_BYTES);
  const commandSecret = randomSecret(COMMAND_SECRET_BYTES);
  const pairingCode = String(randomInt(10_000_000, 100_000_000));
  const expiresAt = new Date(Date.now() + PAIRING_TTL_MS).toISOString();
  const platform = String(input.platform ?? "windows").trim().slice(0, 40) || "windows";

  const { error } = await client.from("samuel_desktop_devices").insert({
    id: deviceId,
    device_name: cleanDeviceName(input.deviceName),
    platform,
    status: "pending",
    token_hash: sha256(token),
    command_secret: commandSecret,
    pairing_code_hash: sha256(pairingCode),
    pairing_expires_at: expiresAt,
    capabilities: cleanCapabilities(input.capabilities),
    last_seen_at: new Date().toISOString(),
  });

  if (error) throw new Error(`Não foi possível registrar o dispositivo: ${error.message}`);

  await appendDesktopEvent(deviceId, null, "device_registered", { platform });
  return { deviceId, token, commandSecret, pairingCode, expiresAt };
}

export async function authenticateDesktopDevice(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!token || token.length > 256) return null;

  const client = getSupabaseServiceClient();
  const { data, error } = await client
    .from("samuel_desktop_devices")
    .select(
      "id,user_id,company_id,device_name,platform,status,command_secret,capabilities,last_seen_at,paired_at,pairing_expires_at",
    )
    .eq("token_hash", sha256(token))
    .maybeSingle();

  if (error || !data || data.status === "revoked") return null;
  return data as {
    id: string;
    user_id: string | null;
    company_id: string | null;
    device_name: string;
    platform: string;
    status: DesktopDeviceStatus;
    command_secret: string;
    capabilities: unknown;
    last_seen_at: string | null;
    paired_at: string | null;
    pairing_expires_at: string | null;
  };
}

export async function heartbeatDesktopDevice(deviceId: string) {
  const client = getSupabaseServiceClient();
  await client
    .from("samuel_desktop_devices")
    .update({ last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", deviceId);
}

export async function claimDesktopDevice(input: {
  pairingCode: string;
  userId: string;
  companyId?: string | null;
}) {
  const pairingCode = input.pairingCode.trim();
  if (!/^\d{8}$/.test(pairingCode)) throw new Error("Código de pareamento inválido.");

  let companyId: string | null = null;
  if (input.companyId && UUID_PATTERN.test(input.companyId)) {
    if (!(await userCanAccessCompany(input.userId, input.companyId))) {
      throw new Error("Acesso negado à empresa selecionada.");
    }
    companyId = input.companyId;
  }

  const client = getSupabaseServiceClient();
  const { data, error } = await client
    .from("samuel_desktop_devices")
    .select("id,device_name,platform,status,pairing_expires_at")
    .eq("pairing_code_hash", sha256(pairingCode))
    .eq("status", "pending")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Código não encontrado ou já utilizado.");
  if (!data.pairing_expires_at || Date.parse(data.pairing_expires_at) <= Date.now()) {
    throw new Error("O código de pareamento expirou. Gere um novo no Samuel Desktop.");
  }

  const now = new Date().toISOString();
  const { error: updateError } = await client
    .from("samuel_desktop_devices")
    .update({
      user_id: input.userId,
      company_id: companyId,
      status: "paired",
      paired_at: now,
      last_seen_at: now,
      pairing_code_hash: null,
      pairing_expires_at: null,
      updated_at: now,
    })
    .eq("id", data.id)
    .eq("status", "pending");

  if (updateError) throw new Error(updateError.message);
  await appendDesktopEvent(data.id, null, "device_paired", { userId: input.userId, companyId });
  return { id: data.id, name: data.device_name, platform: data.platform, companyId };
}

export async function listDesktopDevices(userId: string) {
  const client = getSupabaseServiceClient();
  const { data, error } = await client
    .from("samuel_desktop_devices")
    .select("id,company_id,device_name,platform,status,capabilities,last_seen_at,paired_at,created_at")
    .eq("user_id", userId)
    .neq("status", "revoked")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listRecentDesktopCommands(userId: string, limit = 30) {
  const client = getSupabaseServiceClient();
  const { data, error } = await client
    .from("samuel_desktop_commands")
    .select("id,device_id,company_id,action,risk,status,result,evidence,error_message,created_at,started_at,completed_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(Math.min(50, Math.max(1, limit)));
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function queueDesktopCommand(input: {
  userId: string;
  deviceId: string;
  companyId?: string | null;
  action: DesktopAction;
  args?: Record<string, unknown>;
  risk: DesktopRisk;
  approved?: boolean;
  approvalReference?: string | null;
}) {
  if ((input.risk === "mutate" || input.risk === "sensitive") && !input.approved) {
    throw new Error("Esta ação exige confirmação explícita antes da execução.");
  }

  const client = getSupabaseServiceClient();
  const { data: device, error: deviceError } = await client
    .from("samuel_desktop_devices")
    .select("id,user_id,company_id,status")
    .eq("id", input.deviceId)
    .eq("user_id", input.userId)
    .maybeSingle();
  if (deviceError) throw new Error(deviceError.message);
  if (!device || device.status !== "paired") throw new Error("Dispositivo não está conectado e pareado.");

  let companyId = device.company_id as string | null;
  if (input.companyId && UUID_PATTERN.test(input.companyId)) {
    if (!(await userCanAccessCompany(input.userId, input.companyId))) {
      throw new Error("Acesso negado à empresa selecionada.");
    }
    companyId = input.companyId;
  }

  const expiresAt = new Date(Date.now() + COMMAND_TTL_MS).toISOString();
  const { data, error } = await client
    .from("samuel_desktop_commands")
    .insert({
      device_id: input.deviceId,
      user_id: input.userId,
      company_id: companyId,
      action: input.action,
      args: input.args ?? {},
      risk: input.risk,
      status: "queued",
      approval_reference:
        input.approvalReference ??
        (input.approved ? `manual:${input.userId}:${Date.now()}` : null),
      expires_at: expiresAt,
    })
    .select("id,device_id,action,args,risk,status,expires_at,created_at")
    .single();

  if (error) throw new Error(error.message);
  await appendDesktopEvent(input.deviceId, data.id, "command_queued", {
    action: input.action,
    risk: input.risk,
  });
  return data;
}

function signCommand(commandSecret: string, payload: string) {
  return createHmac("sha256", commandSecret).update(payload).digest("base64url");
}

export async function pollDesktopCommand(device: Awaited<ReturnType<typeof authenticateDesktopDevice>>) {
  if (!device || device.status !== "paired" || !device.user_id) return null;
  const client = getSupabaseServiceClient();
  const now = new Date().toISOString();

  await client
    .from("samuel_desktop_commands")
    .update({ status: "cancelled", error_message: "Comando expirado.", completed_at: now, updated_at: now })
    .eq("device_id", device.id)
    .eq("status", "queued")
    .lt("expires_at", now);

  const { data: command, error } = await client
    .from("samuel_desktop_commands")
    .select("id,device_id,user_id,company_id,action,args,risk,approval_reference,expires_at,created_at")
    .eq("device_id", device.id)
    .eq("status", "queued")
    .gt("expires_at", now)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!command) return null;

  const { data: claimed, error: claimError } = await client
    .from("samuel_desktop_commands")
    .update({ status: "running", started_at: now, updated_at: now })
    .eq("id", command.id)
    .eq("status", "queued")
    .select("id")
    .maybeSingle();
  if (claimError || !claimed) return null;

  const body = {
    id: command.id,
    action: command.action,
    args: command.args ?? {},
    risk: command.risk,
    approvalReference: command.approval_reference,
    expiresAt: command.expires_at,
  };
  const payload = base64Url(JSON.stringify(body));
  await appendDesktopEvent(device.id, command.id, "command_dispatched", { action: command.action });
  return { payload, signature: signCommand(device.command_secret, payload) };
}

export async function completeDesktopCommand(input: {
  deviceId: string;
  commandId: string;
  success: boolean;
  verified: boolean;
  result?: unknown;
  evidence?: unknown;
  errorMessage?: string | null;
}) {
  const client = getSupabaseServiceClient();
  const { data: command, error: commandError } = await client
    .from("samuel_desktop_commands")
    .select("id,device_id,status")
    .eq("id", input.commandId)
    .eq("device_id", input.deviceId)
    .maybeSingle();
  if (commandError) throw new Error(commandError.message);
  if (!command) throw new Error("Comando não pertence a este dispositivo.");
  if (["verified", "failed", "cancelled"].includes(command.status)) return command;

  const trulyVerified = input.success && input.verified && Boolean(input.evidence);
  const status = trulyVerified ? "verified" : "failed";
  const now = new Date().toISOString();
  const errorMessage = trulyVerified
    ? null
    : input.errorMessage || (input.success ? "Execução sem evidência verificável." : "A execução falhou.");

  const { data, error } = await client
    .from("samuel_desktop_commands")
    .update({
      status,
      result: input.result ?? null,
      evidence: input.evidence ?? null,
      error_message: errorMessage,
      completed_at: now,
      updated_at: now,
    })
    .eq("id", input.commandId)
    .select("id,status,result,evidence,error_message,completed_at")
    .single();
  if (error) throw new Error(error.message);

  await appendDesktopEvent(input.deviceId, input.commandId, `command_${status}`, {
    success: input.success,
    verified: input.verified,
    errorMessage,
  });
  return data;
}

export async function cancelDesktopCommand(userId: string, commandId: string) {
  const client = getSupabaseServiceClient();
  const now = new Date().toISOString();
  const { data, error } = await client
    .from("samuel_desktop_commands")
    .update({ status: "cancelled", completed_at: now, updated_at: now, error_message: "Cancelado pelo usuário." })
    .eq("id", commandId)
    .eq("user_id", userId)
    .in("status", ["queued", "running"])
    .select("id,device_id,status")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data) await appendDesktopEvent(data.device_id, data.id, "command_cancelled", { userId });
  return data;
}

export async function setDesktopDeviceStatus(userId: string, deviceId: string, status: "paired" | "paused" | "revoked") {
  const client = getSupabaseServiceClient();
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { status, updated_at: now };
  if (status === "revoked") patch.revoked_at = now;
  const { data, error } = await client
    .from("samuel_desktop_devices")
    .update(patch)
    .eq("id", deviceId)
    .eq("user_id", userId)
    .select("id,status")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Dispositivo não encontrado.");
  await appendDesktopEvent(deviceId, null, `device_${status}`, { userId });
  return data;
}

export async function appendDesktopEvent(
  deviceId: string,
  commandId: string | null,
  eventType: string,
  payload: Record<string, unknown>,
) {
  try {
    await getSupabaseServiceClient().from("samuel_desktop_events").insert({
      device_id: deviceId,
      command_id: commandId,
      event_type: eventType.slice(0, 120),
      payload,
    });
  } catch {
    // Audit telemetry must not block the primary control path.
  }
}
