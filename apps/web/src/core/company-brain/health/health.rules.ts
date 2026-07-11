import type { HealthDimension, HealthStatus } from "./health.types";
import { MAX_HEALTH_SCORE, MIN_HEALTH_SCORE } from "./health.types";

export function clampHealthScore(value: number): number {
  return Math.max(MIN_HEALTH_SCORE, Math.min(MAX_HEALTH_SCORE, Math.round(value)));
}

export function scaleToHealthRange(score0to100: number): number {
  return clampHealthScore(score0to100 * 10);
}

export function classifyHealthStatus(value: number): HealthStatus {
  if (value < 300) return "Critical";
  if (value < 500) return "Weak";
  if (value < 650) return "Stable";
  if (value < 800) return "Healthy";
  return "Excellent";
}

export function classifyIncompleteStatus(): HealthStatus {
  return "Weak";
}

const DEFAULT_WEIGHTS: Record<Exclude<HealthDimension, "overall">, number> = {
  marketing: 1.1,
  sales: 1.2,
  financial: 1.2,
  operations: 1.0,
  technology: 1.0,
  people: 0.9,
  digital_presence: 1.0,
  brand: 0.9,
  customer_experience: 1.1,
  automation: 0.8,
  ai_maturity: 0.8,
};

const SEGMENT_WEIGHT_OVERRIDES: Record<string, Partial<Record<Exclude<HealthDimension, "overall">, number>>> = {
  "saas b2b": {
    technology: 1.3,
    ai_maturity: 1.2,
    sales: 1.3,
    digital_presence: 1.1,
  },
  default: {},
};

export class HealthRulesEngine {
  resolveWeights(segment: string, overrides?: Partial<Record<Exclude<HealthDimension, "overall">, number>>) {
    const normalized = segment.trim().toLowerCase();
    const segmentOverride =
      SEGMENT_WEIGHT_OVERRIDES[normalized] ?? SEGMENT_WEIGHT_OVERRIDES.default ?? {};

    return {
      ...DEFAULT_WEIGHTS,
      ...segmentOverride,
      ...overrides,
    };
  }

  calculateWeightedOverall(
    dimensions: Array<{ dimension: Exclude<HealthDimension, "overall">; value: number; incomplete: boolean }>,
    weights: Record<Exclude<HealthDimension, "overall">, number>,
  ): number {
    let totalWeight = 0;
    let weightedSum = 0;

    for (const dimension of dimensions) {
      if (dimension.incomplete) continue;
      const weight = weights[dimension.dimension] ?? 1;
      totalWeight += weight;
      weightedSum += dimension.value * weight;
    }

    if (totalWeight === 0) return 0;
    return clampHealthScore(weightedSum / totalWeight);
  }

  requiresEvidence(evidenceCount: number): boolean {
    return evidenceCount > 0;
  }

  resolveConfidence(evidenceCount: number, incomplete: boolean, baseConfidence: number): number {
    if (incomplete || evidenceCount === 0) {
      return Math.max(15, Math.min(35, baseConfidence * 0.3));
    }
    const evidenceBoost = Math.min(20, evidenceCount * 4);
    return Math.max(0, Math.min(100, Math.round(baseConfidence + evidenceBoost)));
  }

  statusForScore(value: number, incomplete: boolean): HealthStatus {
    if (incomplete) return classifyIncompleteStatus();
    return classifyHealthStatus(value);
  }
}

export const healthRulesEngine = new HealthRulesEngine();
