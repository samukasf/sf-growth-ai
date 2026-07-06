import type { ExecutiveExperienceEngineDependencies } from "../../application";
import { ExecutiveExperienceEngine } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import { NoopCompanyBrainAdapter } from "../integration/noop-company-brain.adapter";
import { NoopExecutiveCEOAdapter } from "../integration/noop-executive-ceo.adapter";
import { NoopExecutiveKnowledgeAdapter } from "../integration/noop-executive-knowledge.adapter";
import { NoopExecutiveLearningAdapter } from "../integration/noop-executive-learning.adapter";
import { NoopExecutiveMemoryAdapter } from "../integration/noop-executive-memory.adapter";
import { NoopExecutiveWisdomAdapter } from "../integration/noop-executive-wisdom.adapter";
import {
  InMemoryCaseRepository,
  InMemoryExperienceRepository,
} from "../persistence/in-memory-experience.repository";
import { DefaultExperienceAnalyzer } from "../services/default-experience-analyzer";
import { DefaultExperienceScoreCalculator } from "../services/default-experience-score-calculator";
import { DefaultFailureAnalyzer } from "../services/default-failure-analyzer";
import { DefaultPatternMatcher } from "../services/default-pattern-matcher";
import { DefaultScenarioMatcher } from "../services/default-scenario-matcher";
import { DefaultSuccessEvaluator } from "../services/default-success-evaluator";

export type CreateExecutiveExperienceEngineOptions = {
  dependencies?: Partial<ExecutiveExperienceEngineDependencies>;
};

export function createExecutiveExperienceEngine(
  options: CreateExecutiveExperienceEngineOptions = {},
): ExecutiveExperienceEngine {
  const dependencies: ExecutiveExperienceEngineDependencies = {
    experienceRepository:
      options.dependencies?.experienceRepository ?? new InMemoryExperienceRepository(),
    caseRepository: options.dependencies?.caseRepository ?? new InMemoryCaseRepository(),
    analyzer: options.dependencies?.analyzer ?? new DefaultExperienceAnalyzer(),
    scenarioMatcher: options.dependencies?.scenarioMatcher ?? new DefaultScenarioMatcher(),
    patternMatcher: options.dependencies?.patternMatcher ?? new DefaultPatternMatcher(),
    scoreCalculator:
      options.dependencies?.scoreCalculator ?? new DefaultExperienceScoreCalculator(),
    successEvaluator: options.dependencies?.successEvaluator ?? new DefaultSuccessEvaluator(),
    failureAnalyzer: options.dependencies?.failureAnalyzer ?? new DefaultFailureAnalyzer(),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    executiveMemory:
      options.dependencies?.executiveMemory ?? new NoopExecutiveMemoryAdapter(),
    executiveKnowledge:
      options.dependencies?.executiveKnowledge ?? new NoopExecutiveKnowledgeAdapter(),
    executiveLearning:
      options.dependencies?.executiveLearning ?? new NoopExecutiveLearningAdapter(),
    executiveWisdom:
      options.dependencies?.executiveWisdom ?? new NoopExecutiveWisdomAdapter(),
    executiveCeo: options.dependencies?.executiveCeo ?? new NoopExecutiveCEOAdapter(),
    companyBrain: options.dependencies?.companyBrain ?? new NoopCompanyBrainAdapter(),
  };

  return new ExecutiveExperienceEngine(dependencies);
}
