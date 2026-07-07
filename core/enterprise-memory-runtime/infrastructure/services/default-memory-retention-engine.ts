import type { EnterpriseMemory } from "../../domain/entities/enterprise-memory";
import { clampScore, type RelevanceScore } from "../../shared";
import type {
  MemoryRetentionEngine,
  RetentionPolicy,
} from "../../domain/ports/memory-retention-engine.port";

export class DefaultMemoryRetentionEngine implements MemoryRetentionEngine {
  evaluate(memory: EnterpriseMemory, policy?: RetentionPolicy) {
    const archiveAfterDays = policy?.archiveAfterDays ?? 365;
    const minImportance = policy?.minImportance ?? 20;
    const ageDays =
      (Date.now() - new Date(memory.updatedAt).getTime()) / (1000 * 60 * 60 * 24);

    const shouldArchive =
      memory.importance < minImportance && ageDays > archiveAfterDays && memory.isActive();

    return {
      shouldArchive,
      shouldRetain: !shouldArchive,
      reason: shouldArchive
        ? `Low importance (${memory.importance}) after ${Math.floor(ageDays)} days`
        : "Within retention policy",
    };
  }

  scoreRelevance(memory: EnterpriseMemory): RelevanceScore {
    const factors: string[] = [];
    let score = memory.importance * 0.4 + memory.confidence * 0.3;

    factors.push(`importance:${memory.importance}`);
    factors.push(`confidence:${memory.confidence}`);

    if (memory.tags.length > 0) {
      score += Math.min(15, memory.tags.length * 3);
      factors.push(`tags:${memory.tags.length}`);
    }

    if (memory.relationships.length > 0) {
      score += Math.min(15, memory.relationships.length * 5);
      factors.push(`relationships:${memory.relationships.length}`);
    }

    const ageDays =
      (Date.now() - new Date(memory.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays < 30) {
      score += 10;
      factors.push("recent");
    }

    return { value: clampScore(score), factors };
  }

  applyRetentionPolicy(memories: EnterpriseMemory[], policy?: RetentionPolicy) {
    return memories.filter((memory) => this.evaluate(memory, policy).shouldRetain);
  }
}
