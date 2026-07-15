import { createServerSupabaseAdmin, hasServerSupabaseConfiguration } from "@/lib/supabase/server";
import type {
  ExecutiveInboxActionRecord,
  InboxActionType,
  InboxItemType,
  InboxStatus,
} from "@/features/executive-inbox/executive-inbox.types";
import { getWorkspaceSessionIdentity } from "@/features/samuel-ai/server/workspace-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS = new Set<InboxActionType>(["approve", "complete", "dismiss", "defer"]);
const TYPES = new Set<InboxItemType>([
  "alert",
  "recommendation",
  "priority",
  "watcher",
  "action",
  "decision",
  "timeline",
  "ceo",
]);
const STATUSES = new Set<InboxStatus>([
  "pending",
  "urgent",
  "resolved",
  "archived",
  "delegated",
  "executing",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function companyIdFrom(value: unknown) {
  const companyId = typeof value === "string" ? value.trim() : "";
  if (!companyId || companyId.length > 160) throw new Error("Empresa inválida.");
  return companyId;
}

function shortString(record: Record<string, unknown>, key: string, max = 500) {
  const value = typeof record[key] === "string" ? record[key].trim() : "";
  if (!value || value.length > max) throw new Error(`Campo ${key} inválido.`);
  return value;
}

function parseActionRecord(value: unknown): ExecutiveInboxActionRecord {
  if (!isRecord(value)) throw new Error("Ação inválida.");

  const action = value.action;
  const itemType = value.itemType;
  const status = value.status;
  const timestamp = shortString(value, "timestamp", 40);

  if (!ACTIONS.has(action as InboxActionType)) throw new Error("Ação inválida.");
  if (!TYPES.has(itemType as InboxItemType)) throw new Error("Tipo de item inválido.");
  if (!STATUSES.has(status as InboxStatus)) throw new Error("Estado inválido.");
  if (Number.isNaN(Date.parse(timestamp))) throw new Error("Data inválida.");

  return {
    id: shortString(value, "id", 160),
    itemId: shortString(value, "itemId", 300),
    itemTitle: shortString(value, "itemTitle", 500),
    itemType: itemType as InboxItemType,
    action: action as InboxActionType,
    status: status as InboxStatus,
    timestamp,
    origin: shortString(value, "origin", 300),
    area: shortString(value, "area", 160),
  };
}

function rowToRecord(row: Record<string, unknown>): ExecutiveInboxActionRecord {
  return {
    id: String(row.id),
    itemId: String(row.item_id),
    itemTitle: String(row.item_title),
    itemType: row.item_type as InboxItemType,
    action: row.action as InboxActionType,
    status: row.status as InboxStatus,
    timestamp: String(row.action_at),
    origin: String(row.origin),
    area: String(row.area),
  };
}

export async function GET(request: Request) {
  let companyId: string;
  try {
    companyId = companyIdFrom(new URL(request.url).searchParams.get("companyId"));
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Empresa inválida." },
      { status: 400 },
    );
  }

  if (!hasServerSupabaseConfiguration()) {
    return Response.json(
      { actions: [], persistence: "client" },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const { sessionHash } = await getWorkspaceSessionIdentity();
  const { data, error } = await createServerSupabaseAdmin()
    .from("executive_inbox_actions")
    .select("id, item_id, item_title, item_type, action, status, action_at, origin, area")
    .eq("session_hash", sessionHash)
    .eq("company_ref", companyId)
    .order("action_at", { ascending: true })
    .limit(1000);

  if (error) {
    return Response.json(
      { actions: [], persistence: "client" },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  return Response.json(
    {
      actions: (data ?? []).map((row) => rowToRecord(row as Record<string, unknown>)),
      persistence: "supabase",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  let companyId: string;
  let record: ExecutiveInboxActionRecord;
  try {
    const body = await request.json();
    if (!isRecord(body)) throw new Error("Requisição inválida.");
    companyId = companyIdFrom(body.companyId);
    record = parseActionRecord(body.record);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Requisição inválida." },
      { status: 400 },
    );
  }

  if (!hasServerSupabaseConfiguration()) {
    return Response.json({ record, persistence: "client" });
  }

  const { sessionHash } = await getWorkspaceSessionIdentity();
  const { error } = await createServerSupabaseAdmin()
    .from("executive_inbox_actions")
    .upsert(
      {
        session_hash: sessionHash,
        company_ref: companyId,
        company_id: isUuid(companyId) ? companyId : null,
        id: record.id,
        item_id: record.itemId,
        item_title: record.itemTitle,
        item_type: record.itemType,
        action: record.action,
        status: record.status,
        action_at: record.timestamp,
        origin: record.origin,
        area: record.area,
      },
      { onConflict: "session_hash,company_ref,id" },
    );

  return Response.json({
    record,
    persistence: error ? "client" : "supabase",
  });
}
