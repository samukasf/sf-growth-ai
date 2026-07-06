import type { ExecutiveOrchestratorEngineDependencies } from "../../application";
import { ExecutiveOrchestratorService } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import { DefaultParticipantRegistry } from "../integration/default-participant-registry";
import { NoopAIProviderAdapter } from "../integration/noop-ai-provider.adapter";
import { NoopCompanyBrainAdapter } from "../integration/noop-company-brain.adapter";
import { NoopExecutiveCEOAdapter } from "../integration/noop-executive-ceo.adapter";
import { InMemoryOrchestratorRepository } from "../persistence/in-memory-orchestrator.repository";
import { createDefaultDecisionTree } from "../services/default-decision-tree";
import { DefaultExecutiveConsensusEngine } from "../services/default-executive-consensus-engine";
import { DefaultExecutiveDependencyResolver } from "../services/default-executive-dependency-resolver";
import { DefaultExecutiveExecutionCoordinator } from "../services/default-executive-execution-coordinator";
import { DefaultExecutivePriorityResolver } from "../services/default-executive-priority-resolver";
import { DefaultExecutiveRoutingEngine } from "../services/default-executive-routing-engine";
import { DefaultExecutiveWorkflowEngine } from "../services/default-executive-workflow-engine";

export type CreateExecutiveOrchestratorOptions = {
  companyId?: string;
  dependencies?: Partial<ExecutiveOrchestratorEngineDependencies>;
};

export function createExecutiveOrchestrator(
  options: CreateExecutiveOrchestratorOptions = {},
): ExecutiveOrchestratorService {
  const companyId = options.companyId ?? "default-company";

  const dependencies: ExecutiveOrchestratorEngineDependencies = {
    repository: options.dependencies?.repository ?? new InMemoryOrchestratorRepository(),
    routingEngine: options.dependencies?.routingEngine ?? new DefaultExecutiveRoutingEngine(),
    workflowEngine: options.dependencies?.workflowEngine ?? new DefaultExecutiveWorkflowEngine(),
    consensusEngine:
      options.dependencies?.consensusEngine ?? new DefaultExecutiveConsensusEngine(),
    executionCoordinator:
      options.dependencies?.executionCoordinator ?? new DefaultExecutiveExecutionCoordinator(),
    priorityResolver:
      options.dependencies?.priorityResolver ?? new DefaultExecutivePriorityResolver(),
    dependencyResolver:
      options.dependencies?.dependencyResolver ?? new DefaultExecutiveDependencyResolver(),
    decisionTree:
      options.dependencies?.decisionTree ?? createDefaultDecisionTree(companyId),
    participantRegistry:
      options.dependencies?.participantRegistry ?? new DefaultParticipantRegistry(),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    executiveCeo: options.dependencies?.executiveCeo ?? new NoopExecutiveCEOAdapter(),
    companyBrain: options.dependencies?.companyBrain ?? new NoopCompanyBrainAdapter(),
    aiProvider: options.dependencies?.aiProvider ?? new NoopAIProviderAdapter(),
  };

  return new ExecutiveOrchestratorService(dependencies);
}
