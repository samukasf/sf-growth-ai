import type { EventDispatcher } from "../shared";
import type {
  ConsensusBuilder,
  ConflictResolver,
  CouncilMemberSelector,
  CouncilRepository,
  CouncilSessionManager,
  DecisionBuilder,
  OpinionCollector,
  RecommendationAggregator,
  SpecialistPort,
} from "../domain";
import type {
  EnterpriseBrainPort,
  ExecutiveCEOPort,
  ExecutiveOrchestratorPort,
} from "./ports/integration";

export type ExecutiveCouncilDependencies = {
  repository: CouncilRepository;
  memberSelector: CouncilMemberSelector;
  sessionManager: CouncilSessionManager;
  opinionCollector: OpinionCollector;
  consensusBuilder: ConsensusBuilder;
  conflictResolver: ConflictResolver;
  decisionBuilder: DecisionBuilder;
  recommendationAggregator: RecommendationAggregator;
  specialists: SpecialistPort[];
  eventDispatcher: EventDispatcher;
  executiveCeo: ExecutiveCEOPort;
  executiveOrchestrator: ExecutiveOrchestratorPort;
  enterpriseBrain: EnterpriseBrainPort;
};
