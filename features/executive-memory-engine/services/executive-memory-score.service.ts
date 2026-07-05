import type { MemoryLifecycleStatus, MemoryScores } from "../executive-memory-engine.types";

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function buildInitialMemoryScores(
  importanceLevel: number,
  confidenceLevel: number,
): MemoryScores {
  const importance = clampScore(importanceLevel);
  const confidence = clampScore(confidenceLevel);

  return {
    memoryScore: clampScore(importance * 0.45 + confidence * 0.35 + 10),
    confidenceScore: confidence,
    importanceScore: importance,
    reuseScore: 0,
    freshnessScore: 100,
  };
}

export function computeFreshnessScore(lastAccessedAt: string, timestamp: string): number {
  const reference = new Date(lastAccessedAt || timestamp).getTime();
  const ageHours = (Date.now() - reference) / 3_600_000;

  if (ageHours <= 24) return 100;
  if (ageHours <= 72) return 85;
  if (ageHours <= 168) return 70;
  if (ageHours <= 720) return 50;
  return 30;
}

export function applyMemoryReuse(scores: MemoryScores, reuseCount: number): MemoryScores {
  const reuseBoost = Math.min(35, reuseCount * 6);

  return {
    memoryScore: clampScore(scores.memoryScore + reuseBoost * 0.35),
    confidenceScore: clampScore(scores.confidenceScore + reuseBoost * 0.15),
    importanceScore: clampScore(scores.importanceScore + reuseBoost * 0.2),
    reuseScore: clampScore(reuseBoost),
    freshnessScore: 100,
  };
}

export function refreshMemoryScores(
  scores: MemoryScores,
  importanceLevel: number,
  confidenceLevel: number,
  lastAccessedAt: string,
  timestamp: string,
  reuseCount: number,
): MemoryScores {
  const base = buildInitialMemoryScores(importanceLevel, confidenceLevel);
  const withReuse = applyMemoryReuse(base, reuseCount);

  return {
    ...withReuse,
    memoryScore: clampScore(
      withReuse.memoryScore * 0.7 +
        scores.memoryScore * 0.3,
    ),
    freshnessScore: computeFreshnessScore(lastAccessedAt, timestamp),
  };
}

export function resolveLifecycleFromUsage(
  status: MemoryLifecycleStatus,
  reuseCount: number,
): MemoryLifecycleStatus {
  if (status === "archived" || status === "obsolete") return status;
  if (reuseCount >= 3) return "recurring";
  if (status === "new" && reuseCount > 0) return "active";
  return status;
}

export function rankMemoryMatchScore(input: {
  similarityScore: number;
  recencyScore: number;
  priorityScore: number;
  reuseScore: number;
  preferRecency?: boolean;
  preferPriority?: boolean;
}): number {
  const recencyWeight = input.preferRecency ? 0.3 : 0.2;
  const priorityWeight = input.preferPriority ? 0.35 : 0.25;

  return clampScore(
    input.similarityScore * 0.35 +
      input.recencyScore * recencyWeight +
      input.priorityScore * priorityWeight +
      input.reuseScore * 0.1,
  );
}
