import type { MemoryLifecycleStatus } from "../executive-memory-engine.types";

const LIFECYCLE_RANK: Record<MemoryLifecycleStatus, number> = {
  new: 1,
  active: 2,
  recurring: 3,
  archived: 4,
  obsolete: 5,
};

export function isRetrievableStatus(status: MemoryLifecycleStatus): boolean {
  return status !== "obsolete";
}

export function promoteMemoryLifecycle(
  status: MemoryLifecycleStatus,
  reuseCount: number,
): MemoryLifecycleStatus {
  if (status === "obsolete") return "obsolete";
  if (status === "archived") return "archived";
  if (reuseCount >= 5) return "recurring";
  if (reuseCount >= 1 || status === "new") return "active";
  return status;
}

export function archiveMemoryLifecycle(status: MemoryLifecycleStatus): MemoryLifecycleStatus {
  if (status === "obsolete") return "obsolete";
  return "archived";
}

export function markMemoryObsolete(): MemoryLifecycleStatus {
  return "obsolete";
}

export function compareLifecyclePriority(
  left: MemoryLifecycleStatus,
  right: MemoryLifecycleStatus,
): number {
  return LIFECYCLE_RANK[left] - LIFECYCLE_RANK[right];
}

export const MEMORY_LIFECYCLE_LABELS: Record<MemoryLifecycleStatus, string> = {
  new: "Novo",
  active: "Ativo",
  recurring: "Recorrente",
  archived: "Arquivado",
  obsolete: "Obsoleto",
};
