import type { KnowledgeEvaluation, KnowledgeScores } from "../executive-knowledge.types";

const DEFAULT_SCORES: KnowledgeScores = {
  knowledgeScore: 40,
  experienceScore: 20,
  confidenceScore: 50,
  reuseScore: 0,
  qualityScore: 50,
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function buildInitialKnowledgeScores(
  confidenceScore: number,
  evaluation: KnowledgeEvaluation = null,
): KnowledgeScores {
  const normalizedConfidence = clampScore(confidenceScore);
  const evaluationBoost =
    evaluation === "positive" ? 15 : evaluation === "negative" ? -20 : 0;

  return {
    knowledgeScore: clampScore(normalizedConfidence * 0.6 + 20 + evaluationBoost),
    experienceScore: 20,
    confidenceScore: normalizedConfidence,
    reuseScore: 0,
    qualityScore: clampScore(normalizedConfidence * 0.7 + evaluationBoost),
  };
}

export function applyKnowledgeReuse(scores: KnowledgeScores, reuseCount: number): KnowledgeScores {
  const reuseBoost = Math.min(30, reuseCount * 5);

  return {
    knowledgeScore: clampScore(scores.knowledgeScore + reuseBoost * 0.4),
    experienceScore: clampScore(scores.experienceScore + reuseBoost * 0.6),
    confidenceScore: clampScore(scores.confidenceScore + reuseBoost * 0.2),
    reuseScore: clampScore(reuseBoost),
    qualityScore: clampScore(scores.qualityScore + reuseBoost * 0.3),
  };
}

export function applyKnowledgeEvaluation(
  scores: KnowledgeScores,
  evaluation: KnowledgeEvaluation,
): KnowledgeScores {
  const delta =
    evaluation === "positive" ? 10 : evaluation === "negative" ? -15 : 0;

  return {
    knowledgeScore: clampScore(scores.knowledgeScore + delta),
    experienceScore: scores.experienceScore,
    confidenceScore: clampScore(scores.confidenceScore + delta * 0.5),
    reuseScore: scores.reuseScore,
    qualityScore: clampScore(scores.qualityScore + delta),
  };
}

export function aggregateKnowledgeConfidence(scores: KnowledgeScores[]): number {
  if (scores.length === 0) return 0;

  const total = scores.reduce(
    (sum, score) =>
      sum +
      score.knowledgeScore * 0.3 +
      score.confidenceScore * 0.3 +
      score.qualityScore * 0.2 +
      score.reuseScore * 0.1 +
      score.experienceScore * 0.1,
    0,
  );

  return clampScore(total / scores.length);
}

export { DEFAULT_SCORES };
