import type { EventDispatcher } from "../shared";
import type {
  ExperienceAggregator,
  FeedbackProcessor,
  LearningAnalyzer,
  LearningRepository,
  LearningScoreCalculator,
  OutcomeEvaluator,
  PatternDetector,
} from "../domain";
import type {
  CompanyBrainPort,
  ExecutiveCEOPort,
  ExecutiveMemoryPort,
  ExecutiveRecommendationPort,
  ExecutiveWisdomPort,
} from "./ports/integration";

export type ExecutiveLearningEngineDependencies = {
  repository: LearningRepository;
  analyzer: LearningAnalyzer;
  patternDetector: PatternDetector;
  outcomeEvaluator: OutcomeEvaluator;
  experienceAggregator: ExperienceAggregator;
  feedbackProcessor: FeedbackProcessor;
  scoreCalculator: LearningScoreCalculator;
  eventDispatcher: EventDispatcher;
  executiveMemory: ExecutiveMemoryPort;
  executiveWisdom: ExecutiveWisdomPort;
  companyBrain: CompanyBrainPort;
  executiveCeo: ExecutiveCEOPort;
  executiveRecommendation: ExecutiveRecommendationPort;
};
