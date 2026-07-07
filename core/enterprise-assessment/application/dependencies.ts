import type { EventDispatcher } from "../shared";
import type {
  AssessmentRepository,
  BenchmarkEngine,
  PriorityAnalyzer,
  RecommendationEngine,
  RoadmapGenerator,
  ScoreCalculator,
} from "../domain";
import type {
  EnterpriseBrainPort,
  ExecutiveCEOPort,
  ExecutiveInnovationPort,
  ExecutiveProjectsPort,
  SoftwareFactoryPort,
} from "./ports/integration";

export type EnterpriseAssessmentDependencies = {
  repository: AssessmentRepository;
  scoreCalculator: ScoreCalculator;
  benchmarkEngine: BenchmarkEngine;
  recommendationEngine: RecommendationEngine;
  roadmapGenerator: RoadmapGenerator;
  priorityAnalyzer: PriorityAnalyzer;
  eventDispatcher: EventDispatcher;
  enterpriseBrain: EnterpriseBrainPort;
  executiveInnovation: ExecutiveInnovationPort;
  executiveProjects: ExecutiveProjectsPort;
  softwareFactory: SoftwareFactoryPort;
  executiveCeo: ExecutiveCEOPort;
};
