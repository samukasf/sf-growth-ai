import type { AnalyzePrioritiesInput, PriorityAnalyzer, PrioritizedItem } from "../../domain";

const PRIORITY_WEIGHTS: Record<string, number> = {
  critical: 100,
  high: 75,
  medium: 50,
  low: 25,
  strategic: 90,
};

const EFFORT_PENALTY: Record<string, number> = {
  low: 0,
  medium: -10,
  high: -20,
};

const HORIZON_BONUS: Record<string, number> = {
  "30_days": 15,
  "90_days": 10,
  "180_days": 5,
  "365_days": 0,
};

export class DefaultPriorityAnalyzer implements PriorityAnalyzer {
  analyze(input: AnalyzePrioritiesInput): PrioritizedItem[] {
    const scored = input.recommendations.map((recommendation) => {
      const priorityScore =
        (PRIORITY_WEIGHTS[recommendation.priority] ?? 50) +
        (EFFORT_PENALTY[recommendation.effort] ?? 0) +
        (HORIZON_BONUS[recommendation.horizon] ?? 0);

      return { recommendation, priorityScore, rank: 0 };
    });

    scored.sort((a, b) => b.priorityScore - a.priorityScore);

    return scored.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }
}
