import type { SoftwareFactoryDependencies } from "../../application";
import { SoftwareFactoryRuntimeService } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import {
  NoopAIProviderLayerAdapter,
  NoopBusinessAutomationPlatformAdapter,
  NoopEnterpriseBrainAdapter,
  NoopExecutiveCEOAdapter,
  NoopExecutiveCouncilAdapter,
  NoopExecutiveProjectGeneratorAdapter,
} from "../integration/noop-integration.adapters";
import { InMemorySoftwareFactoryRepository } from "../persistence/in-memory-software-factory.repository";
import { DefaultApprovalManager } from "../services/default-approval-manager";
import { DefaultArchitectureGenerator } from "../services/default-architecture-generator";
import { DefaultArtifactGenerator } from "../services/default-artifact-generator";
import { DefaultDeploymentPlanner } from "../services/default-deployment-planner";
import { DefaultModulePlanner } from "../services/default-module-planner";
import { DefaultRequirementsAnalyzer } from "../services/default-requirements-analyzer";
import { DefaultSpecificationBuilder } from "../services/default-specification-builder";

export type CreateSoftwareFactoryOptions = {
  dependencies?: Partial<SoftwareFactoryDependencies>;
};

export function createSoftwareFactory(
  options: CreateSoftwareFactoryOptions = {},
): SoftwareFactoryRuntimeService {
  const dependencies: SoftwareFactoryDependencies = {
    repository:
      options.dependencies?.repository ?? new InMemorySoftwareFactoryRepository(),
    requirementsAnalyzer:
      options.dependencies?.requirementsAnalyzer ?? new DefaultRequirementsAnalyzer(),
    specificationBuilder:
      options.dependencies?.specificationBuilder ?? new DefaultSpecificationBuilder(),
    architectureGenerator:
      options.dependencies?.architectureGenerator ?? new DefaultArchitectureGenerator(),
    modulePlanner: options.dependencies?.modulePlanner ?? new DefaultModulePlanner(),
    artifactGenerator:
      options.dependencies?.artifactGenerator ?? new DefaultArtifactGenerator(),
    deploymentPlanner:
      options.dependencies?.deploymentPlanner ?? new DefaultDeploymentPlanner(),
    approvalManager: options.dependencies?.approvalManager ?? new DefaultApprovalManager(),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    executiveProjectGenerator:
      options.dependencies?.executiveProjectGenerator ??
      new NoopExecutiveProjectGeneratorAdapter(),
    enterpriseBrain: options.dependencies?.enterpriseBrain ?? new NoopEnterpriseBrainAdapter(),
    executiveCeo: options.dependencies?.executiveCeo ?? new NoopExecutiveCEOAdapter(),
    executiveCouncil:
      options.dependencies?.executiveCouncil ?? new NoopExecutiveCouncilAdapter(),
    businessAutomationPlatform:
      options.dependencies?.businessAutomationPlatform ??
      new NoopBusinessAutomationPlatformAdapter(),
    aiProviderLayer:
      options.dependencies?.aiProviderLayer ?? new NoopAIProviderLayerAdapter(),
  };

  return new SoftwareFactoryRuntimeService(dependencies);
}

