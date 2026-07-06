import type { EventDispatcher } from "../shared";
import type {
  BusinessRuleEngine,
  DecisionEvaluator,
  ExperienceAggregator,
  PlaybookGenerator,
  RecommendationEngine,
  WisdomAnalyzer,
  WisdomRepository,
} from "../domain";
import type {
  AIProviderPort,
  CompanyBrainPort,
  ExecutiveCEOPort,
  ExecutiveKnowledgePort,
  ExecutiveLearningPort,
  ExecutiveMemoryPort,
} from "./ports/integration";

export type ExecutiveWisdomEngineDependencies = {
  repository: WisdomRepository;
  analyzer: WisdomAnalyzer;
  playbookGenerator: PlaybookGenerator;
  decisionEvaluator: DecisionEvaluator;
  businessRuleEngine: BusinessRuleEngine;
  recommendationEngine: RecommendationEngine;
  experienceAggregator: ExperienceAggregator;
  eventDispatcher: EventDispatcher;
  executiveMemory: ExecutiveMemoryPort;
  executiveKnowledge: ExecutiveKnowledgePort;
  executiveLearning: ExecutiveLearningPort;
  executiveCeo: ExecutiveCEOPort;
  companyBrain: CompanyBrainPort;
  aiProvider: AIProviderPort;
};
