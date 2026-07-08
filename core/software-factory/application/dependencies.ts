import type { EventDispatcher } from "../shared";
import type {
  ApprovalManager,
  ArchitectureGenerator,
  ArtifactGenerator,
  DeploymentPlanner,
  ModulePlanner,
  RequirementsAnalyzer,
  SoftwareFactoryRepository,
  SpecificationBuilder,
} from "../domain";
import type {
  AIProviderLayerPort,
  BusinessAutomationPlatformPort,
  EnterpriseBrainPort,
  ExecutiveCEOPort,
  ExecutiveCouncilPort,
  ExecutiveProjectGeneratorPort,
} from "./ports/integration";

export type SoftwareFactoryDependencies = {
  repository: SoftwareFactoryRepository;
  requirementsAnalyzer: RequirementsAnalyzer;
  specificationBuilder: SpecificationBuilder;
  architectureGenerator: ArchitectureGenerator;
  modulePlanner: ModulePlanner;
  artifactGenerator: ArtifactGenerator;
  deploymentPlanner: DeploymentPlanner;
  approvalManager: ApprovalManager;
  eventDispatcher: EventDispatcher;
  executiveProjectGenerator: ExecutiveProjectGeneratorPort;
  enterpriseBrain: EnterpriseBrainPort;
  executiveCeo: ExecutiveCEOPort;
  executiveCouncil: ExecutiveCouncilPort;
  businessAutomationPlatform: BusinessAutomationPlatformPort;
  aiProviderLayer: AIProviderLayerPort;
};

