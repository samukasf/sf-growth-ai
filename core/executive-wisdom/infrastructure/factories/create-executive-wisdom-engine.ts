import type { ExecutiveWisdomEngineDependencies } from "../../application";
import { ExecutiveWisdomEngine } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import { NoopAIProviderAdapter } from "../integration/noop-ai-provider.adapter";
import { NoopCompanyBrainAdapter } from "../integration/noop-company-brain.adapter";
import { NoopExecutiveCEOAdapter } from "../integration/noop-executive-ceo.adapter";
import { NoopExecutiveKnowledgeAdapter } from "../integration/noop-executive-knowledge.adapter";
import { NoopExecutiveLearningAdapter } from "../integration/noop-executive-learning.adapter";
import { NoopExecutiveMemoryAdapter } from "../integration/noop-executive-memory.adapter";
import { InMemoryWisdomRepository } from "../persistence/in-memory-wisdom.repository";
import { DefaultBusinessRuleEngine } from "../services/default-business-rule-engine";
import { DefaultDecisionEvaluator } from "../services/default-decision-evaluator";
import { DefaultExperienceAggregator } from "../services/default-experience-aggregator";
import { DefaultPlaybookGenerator } from "../services/default-playbook-generator";
import { DefaultRecommendationEngine } from "../services/default-recommendation-engine";
import { DefaultWisdomAnalyzer } from "../services/default-wisdom-analyzer";

export type CreateExecutiveWisdomEngineOptions = {
  dependencies?: Partial<ExecutiveWisdomEngineDependencies>;
};

export function createExecutiveWisdomEngine(
  options: CreateExecutiveWisdomEngineOptions = {},
): ExecutiveWisdomEngine {
  const dependencies: ExecutiveWisdomEngineDependencies = {
    repository: options.dependencies?.repository ?? new InMemoryWisdomRepository(),
    analyzer: options.dependencies?.analyzer ?? new DefaultWisdomAnalyzer(),
    playbookGenerator:
      options.dependencies?.playbookGenerator ?? new DefaultPlaybookGenerator(),
    decisionEvaluator:
      options.dependencies?.decisionEvaluator ?? new DefaultDecisionEvaluator(),
    businessRuleEngine:
      options.dependencies?.businessRuleEngine ?? new DefaultBusinessRuleEngine(),
    recommendationEngine:
      options.dependencies?.recommendationEngine ?? new DefaultRecommendationEngine(),
    experienceAggregator:
      options.dependencies?.experienceAggregator ?? new DefaultExperienceAggregator(),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    executiveMemory:
      options.dependencies?.executiveMemory ?? new NoopExecutiveMemoryAdapter(),
    executiveKnowledge:
      options.dependencies?.executiveKnowledge ?? new NoopExecutiveKnowledgeAdapter(),
    executiveLearning:
      options.dependencies?.executiveLearning ?? new NoopExecutiveLearningAdapter(),
    executiveCeo: options.dependencies?.executiveCeo ?? new NoopExecutiveCEOAdapter(),
    companyBrain: options.dependencies?.companyBrain ?? new NoopCompanyBrainAdapter(),
    aiProvider: options.dependencies?.aiProvider ?? new NoopAIProviderAdapter(),
  };

  return new ExecutiveWisdomEngine(dependencies);
}
