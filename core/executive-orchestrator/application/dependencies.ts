import type { EventDispatcher } from "../shared";
import type {
  ExecutiveConsensusEngine,
  ExecutiveDependencyResolver,
  ExecutiveExecutionCoordinator,
  ExecutivePriorityResolver,
  ExecutiveRoutingEngine,
  ExecutiveWorkflowEngine,
  OrchestratorRepository,
} from "../domain";
import type { ExecutiveDecisionTree } from "../domain";
import type {
  AIProviderPort,
  CompanyBrainPort,
  ExecutiveCEOPort,
  ExecutiveParticipantRegistry,
} from "./ports/integration";

export type ExecutiveOrchestratorEngineDependencies = {
  repository: OrchestratorRepository;
  routingEngine: ExecutiveRoutingEngine;
  workflowEngine: ExecutiveWorkflowEngine;
  consensusEngine: ExecutiveConsensusEngine;
  executionCoordinator: ExecutiveExecutionCoordinator;
  priorityResolver: ExecutivePriorityResolver;
  dependencyResolver: ExecutiveDependencyResolver;
  decisionTree: ExecutiveDecisionTree;
  participantRegistry: ExecutiveParticipantRegistry;
  eventDispatcher: EventDispatcher;
  executiveCeo: ExecutiveCEOPort;
  companyBrain: CompanyBrainPort;
  aiProvider: AIProviderPort;
};
