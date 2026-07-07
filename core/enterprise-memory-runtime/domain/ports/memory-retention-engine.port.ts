import type { EnterpriseMemory } from "../entities";
import type { RelevanceScore } from "../../shared";

export type RetentionPolicy = {
  maxAgeDays?: number;
  minImportance?: number;
  archiveAfterDays?: number;
};

export interface MemoryRetentionEngine {
  evaluate(memory: EnterpriseMemory, policy?: RetentionPolicy): {
    shouldArchive: boolean;
    shouldRetain: boolean;
    reason: string;
  };
  scoreRelevance(memory: EnterpriseMemory): RelevanceScore;
  applyRetentionPolicy(
    memories: EnterpriseMemory[],
    policy?: RetentionPolicy,
  ): EnterpriseMemory[];
}
