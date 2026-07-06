import type { ExecutiveLearningEngineDependencies } from "../../application";
import { ExecutiveLearningEngine } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import { NoopCompanyBrainAdapter } from "../integration/noop-company-brain.adapter";
import { NoopExecutiveCEOAdapter } from "../integration/noop-executive-ceo.adapter";
import { NoopExecutiveMemoryAdapter } from "../integration/noop-executive-memory.adapter";
import { NoopExecutiveRecommendationAdapter } from "../integration/noop-executive-recommendation.adapter";
import { NoopExecutiveWisdomAdapter } from "../integration/noop-executive-wisdom.adapter";
import { InMemoryLearningRepository } from "../persistence/in-memory-learning.repository";
import { DefaultExperienceAggregator } from "../services/default-experience-aggregator";
import { DefaultFeedbackProcessor } from "../services/default-feedback-processor";
import { DefaultLearningAnalyzer } from "../services/default-learning-analyzer";
import { DefaultLearningScoreCalculator } from "../services/default-learning-score-calculator";
import { DefaultOutcomeEvaluator } from "../services/default-outcome-evaluator";
import { DefaultPatternDetector } from "../services/default-pattern-detector";

export type CreateExecutiveLearningEngineOptions = {
  dependencies?: Partial<ExecutiveLearningEngineDependencies>;
};

export function createExecutiveLearningEngine(
  options: CreateExecutiveLearningEngineOptions = {},
): ExecutiveLearningEngine {
  const dependencies: ExecutiveLearningEngineDependencies = {
    repository: options.dependencies?.repository ?? new InMemoryLearningRepository(),
    analyzer: options.dependencies?.analyzer ?? new DefaultLearningAnalyzer(),
    patternDetector: options.dependencies?.patternDetector ?? new DefaultPatternDetector(),
    outcomeEvaluator: options.dependencies?.outcomeEvaluator ?? new DefaultOutcomeEvaluator(),
    experienceAggregator:
      options.dependencies?.experienceAggregator ?? new DefaultExperienceAggregator(),
    feedbackProcessor: options.dependencies?.feedbackProcessor ?? new DefaultFeedbackProcessor(),
    scoreCalculator:
      options.dependencies?.scoreCalculator ?? new DefaultLearningScoreCalculator(),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    executiveMemory:
      options.dependencies?.executiveMemory ?? new NoopExecutiveMemoryAdapter(),
    executiveWisdom:
      options.dependencies?.executiveWisdom ?? new NoopExecutiveWisdomAdapter(),
    companyBrain: options.dependencies?.companyBrain ?? new NoopCompanyBrainAdapter(),
    executiveCeo: options.dependencies?.executiveCeo ?? new NoopExecutiveCEOAdapter(),
    executiveRecommendation:
      options.dependencies?.executiveRecommendation ??
      new NoopExecutiveRecommendationAdapter(),
  };

  return new ExecutiveLearningEngine(dependencies);
}
