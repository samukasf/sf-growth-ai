import { addMemory } from "@/services/executive-memory.service";

import type {
  ExecutiveInboxActionRecord,
  ExecutiveInboxActionsState,
  ExecutiveInboxItem,
  InboxActionType,
  InboxStatus,
} from "../executive-inbox.types";

const STORAGE_PREFIX = "sf-executive-inbox-actions";
const MEMORY_CATEGORY = "executive-inbox";
const MEMORY_SOURCE = "executive-inbox";

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
    window.localStorage.setItem(storageKey(companyId), JSON.stringify(state));
  }

  return state;
}

async function persistExecutiveInboxActionToMemory(
  companyId: string,
  record: ExecutiveInboxActionRecord,
) {
  try {
    await addMemory({
      company_id: companyId,
      category: MEMORY_CATEGORY,
      title: `${INBOX_ACTION_LABELS[record.action]} — ${record.itemTitle}`,
      content: JSON.stringify(record),
      importance: record.action === "complete" ? 8 : 7,
      source: MEMORY_SOURCE,
    });
  } catch {
    // Persistência local já garante continuidade da sessão.
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
  await persistExecutiveInboxActionToMemory(companyId, record);

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
