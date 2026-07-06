import type { EventDispatcher } from "../shared";
import type {
  CaseRepository,
  ExperienceAnalyzer,
  ExperienceRepository,
  ExperienceScoreCalculator,
  FailureAnalyzer,
  PatternMatcher,
  ScenarioMatcher,
  SuccessEvaluator,
} from "../domain";
import type {
  CompanyBrainPort,
  ExecutiveCEOPort,
  ExecutiveKnowledgePort,
  ExecutiveLearningPort,
  ExecutiveMemoryPort,
  ExecutiveWisdomPort,
} from "./ports/integration";

export type ExecutiveExperienceEngineDependencies = {
  experienceRepository: ExperienceRepository;
  caseRepository: CaseRepository;
  analyzer: ExperienceAnalyzer;
  scenarioMatcher: ScenarioMatcher;
  patternMatcher: PatternMatcher;
  scoreCalculator: ExperienceScoreCalculator;
  successEvaluator: SuccessEvaluator;
  failureAnalyzer: FailureAnalyzer;
  eventDispatcher: EventDispatcher;
  executiveMemory: ExecutiveMemoryPort;
  executiveKnowledge: ExecutiveKnowledgePort;
  executiveLearning: ExecutiveLearningPort;
  executiveWisdom: ExecutiveWisdomPort;
  executiveCeo: ExecutiveCEOPort;
  companyBrain: CompanyBrainPort;
};
