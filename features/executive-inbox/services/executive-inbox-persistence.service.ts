import type {
  ExecutiveInboxActionRecord,
  ExecutiveInboxActionsState,
  ExecutiveInboxItem,
  InboxActionType,
  InboxStatus,
} from "../executive-inbox.types";

const STORAGE_PREFIX = "sf-executive-inbox-actions";

const ACTION_STATUS: Record<InboxActionType, InboxStatus> = {
  approve: "executing",
  complete: "resolved",
  dismiss: "archived",
  defer: "delegated",
};

export const INBOX_ACTION_LABELS: Record<InboxActionType, string> = {
  approve: "Aprovar",
  complete: "Concluir",
  dismiss: "Dispensar",
  defer: "Adiar",
};

function storageKey(companyId: string) {
  return `${STORAGE_PREFIX}:${companyId}`;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function createActionId() {
  return `inbox-action-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function mapInboxActionToStatus(action: InboxActionType): InboxStatus {
  return ACTION_STATUS[action];
}

export function loadExecutiveInboxActions(companyId: string): ExecutiveInboxActionRecord[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(storageKey(companyId));
    if (!raw) return [];

    const parsed = JSON.parse(raw) as ExecutiveInboxActionsState;
    return parsed.actions ?? [];
  } catch {
    return [];
  }
}

function saveExecutiveInboxActionsLocal(
  companyId: string,
  actions: ExecutiveInboxActionRecord[],
): ExecutiveInboxActionsState {
  const state: ExecutiveInboxActionsState = {
    companyId,
    actions,
    updatedAt: new Date().toISOString(),
  };

  if (isBrowser()) {
    try {
      window.localStorage.setItem(storageKey(companyId), JSON.stringify(state));
    } catch {
      // Private browsing or storage quotas may disable the local fallback.
    }
  }

  return state;
}

async function persistExecutiveInboxActionRemote(
  companyId: string,
  record: ExecutiveInboxActionRecord,
) {
  const response = await fetch("/api/executive-inbox/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyId, record }),
  });
  if (!response.ok) throw new Error("A Executive Inbox remota não respondeu.");
}

function mergeActions(
  remote: ExecutiveInboxActionRecord[],
  local: ExecutiveInboxActionRecord[],
) {
  const actions = new Map<string, ExecutiveInboxActionRecord>();
  for (const action of [...remote, ...local]) actions.set(action.id, action);
  return [...actions.values()].sort(
    (left, right) =>
      new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
  );
}

export async function hydrateExecutiveInboxActions(
  companyId: string,
  signal?: AbortSignal,
): Promise<ExecutiveInboxActionRecord[]> {
  const local = loadExecutiveInboxActions(companyId);

  try {
    const response = await fetch(
      `/api/executive-inbox/actions?companyId=${encodeURIComponent(companyId)}`,
      { cache: "no-store", signal },
    );
    if (!response.ok) return local;
    const payload = await response.json() as {
      actions?: ExecutiveInboxActionRecord[];
      persistence?: "supabase" | "client";
    };
    const remote = Array.isArray(payload.actions) ? payload.actions : [];
    const merged = mergeActions(remote, local);
    saveExecutiveInboxActionsLocal(companyId, merged);

    if (payload.persistence === "supabase") {
      const remoteIds = new Set(remote.map((action) => action.id));
      await Promise.allSettled(
        local
          .filter((action) => !remoteIds.has(action.id))
          .map((action) => persistExecutiveInboxActionRemote(companyId, action)),
      );
    }

    return merged;
  } catch {
    return local;
  }
}

export function createExecutiveInboxActionRecord(
  item: ExecutiveInboxItem,
  action: InboxActionType,
): ExecutiveInboxActionRecord {
  return {
    id: createActionId(),
    itemId: item.id,
    itemTitle: item.title,
    itemType: item.type,
    action,
    status: mapInboxActionToStatus(action),
    timestamp: new Date().toISOString(),
    origin: item.origin,
    area: item.area,
  };
}

export async function persistExecutiveInboxAction(
  companyId: string,
  item: ExecutiveInboxItem,
  action: InboxActionType,
  existingActions: ExecutiveInboxActionRecord[] = [],
): Promise<ExecutiveInboxActionRecord[]> {
  const record = createExecutiveInboxActionRecord(item, action);
  const nextActions = [...existingActions, record];

  saveExecutiveInboxActionsLocal(companyId, nextActions);
  try {
    await persistExecutiveInboxActionRemote(companyId, record);
  } catch {
    // The local record will be synchronized during the next hydration.
  }

  return nextActions;
}

export function getLatestInboxStatusByItem(
  actions: ExecutiveInboxActionRecord[],
  itemId: string,
): InboxStatus | null {
  const latest = [...actions]
    .filter((action) => action.itemId === itemId)
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
    )[0];

  return latest?.status ?? null;
}
