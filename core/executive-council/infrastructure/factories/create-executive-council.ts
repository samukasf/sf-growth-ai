import type { ExecutiveCouncilDependencies } from "../../application";
import { ExecutiveCouncilRuntimeService } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import {
  NoopEnterpriseBrainAdapter,
  NoopExecutiveCEOAdapter,
  NoopExecutiveOrchestratorAdapter,
} from "../integration/noop-integration.adapters";
import { InMemoryCouncilRepository } from "../persistence/in-memory-council.repository";
import { DefaultConsensusBuilder } from "../services/default-consensus-builder";
import { DefaultConflictResolver } from "../services/default-conflict-resolver";
import { DefaultCouncilMemberSelector } from "../services/default-council-member-selector";
import { DefaultCouncilSessionManager } from "../services/default-council-session-manager";
import { DefaultDecisionBuilder } from "../services/default-decision-builder";
import { DefaultOpinionCollector } from "../services/default-opinion-collector";
import { DefaultRecommendationAggregator } from "../services/default-recommendation-aggregator";
import { createAISpecialists, isCouncilAIEnabled } from "../specialists/ai-council-specialist.adapter";
import { DEFAULT_COUNCIL_SPECIALISTS } from "../specialists/default-council-specialists";

export type CreateExecutiveCouncilOptions = {
  dependencies?: Partial<ExecutiveCouncilDependencies>;
};

/**
 * Especialistas padrão do Council (Sprint 78): IA real via AI Gateway
 * quando habilitada (`EXECUTIVE_COUNCIL_AI_ENABLED !== "false"`), com
 * fallback heurístico instantâneo via kill-switch — sem deploy de código.
 * Qualquer chamador que injete `dependencies.specialists` explicitamente
 * continua tendo prioridade (comportamento de DI inalterado).
 */
function resolveDefaultSpecialists() {
  return isCouncilAIEnabled() ? createAISpecialists() : DEFAULT_COUNCIL_SPECIALISTS;
}

export function createExecutiveCouncil(
  options: CreateExecutiveCouncilOptions = {},
): ExecutiveCouncilRuntimeService {
  const dependencies: ExecutiveCouncilDependencies = {
    repository: options.dependencies?.repository ?? new InMemoryCouncilRepository(),
    memberSelector:
      options.dependencies?.memberSelector ?? new DefaultCouncilMemberSelector(),
    sessionManager:
      options.dependencies?.sessionManager ?? new DefaultCouncilSessionManager(),
    opinionCollector:
      options.dependencies?.opinionCollector ?? new DefaultOpinionCollector(),
    consensusBuilder:
      options.dependencies?.consensusBuilder ?? new DefaultConsensusBuilder(),
    conflictResolver:
      options.dependencies?.conflictResolver ?? new DefaultConflictResolver(),
    decisionBuilder: options.dependencies?.decisionBuilder ?? new DefaultDecisionBuilder(),
    recommendationAggregator:
      options.dependencies?.recommendationAggregator ??
      new DefaultRecommendationAggregator(),
    specialists: options.dependencies?.specialists ?? resolveDefaultSpecialists(),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    executiveCeo: options.dependencies?.executiveCeo ?? new NoopExecutiveCEOAdapter(),
    executiveOrchestrator:
      options.dependencies?.executiveOrchestrator ?? new NoopExecutiveOrchestratorAdapter(),
    enterpriseBrain:
      options.dependencies?.enterpriseBrain ?? new NoopEnterpriseBrainAdapter(),
  };

  return new ExecutiveCouncilRuntimeService(dependencies);
}
