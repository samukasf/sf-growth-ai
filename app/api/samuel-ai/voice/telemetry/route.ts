import { authorizeCompanyRequest } from "@/features/auth/server/authorization";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VoiceTelemetryBody = {
  companyId?: string;
  event?: string;
  details?: Record<string, unknown>;
  at?: string;
};

const ALLOWED_EVENTS = new Set([
  "session_started",
  "session_ended",
  "speech_started",
  "barge_in",
  "speech_ended",
  "transcription_ok",
  "transcription_error",
  "echo_rejected",
  "turn_routed",
  "confirmation_routed",
  "microphone_error",
]);

function sanitizeDetails(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const output: Record<string, string | number | boolean | null> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>).slice(0, 16)) {
    if (typeof raw === "string") output[key.slice(0, 64)] = raw.slice(0, 240);
    else if (typeof raw === "number" && Number.isFinite(raw)) output[key.slice(0, 64)] = raw;
    else if (typeof raw === "boolean" || raw === null) output[key.slice(0, 64)] = raw;
  }
  return output;
}

export async function POST(request: Request) {
  let body: VoiceTelemetryBody;
  try {
    body = (await request.json()) as VoiceTelemetryBody;
  } catch {
    return Response.json({ ok: false, error: "JSON inválido." }, { status: 400 });
  }

  const companyId = body.companyId?.trim() || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;

  const event = body.event?.trim() ?? "";
  if (!ALLOWED_EVENTS.has(event)) {
    return Response.json({ ok: false, error: "Evento de voz inválido." }, { status: 400 });
  }

  console.info("Samuel voice telemetry", {
    event,
    companyId,
    userId: auth.user.id,
    clientAt: body.at?.slice(0, 64) ?? null,
    details: sanitizeDetails(body.details),
  });

  return Response.json(
    { ok: true },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
