import type {
  ChangeBusinessStateDto,
  CheckHealthDto,
  CompleteWorkflowDto,
  RegisterCapabilityDto,
  RegisterPlatformDto,
  StartSessionDto,
  StartWorkflowDto,
} from "../dto";
import type { EnterpriseOsDependencies } from "../dependencies";
import {
  ChangeBusinessStateUseCase,
  CheckHealthUseCase,
  CompleteWorkflowUseCase,
  RegisterCapabilityUseCase,
  RegisterPlatformUseCase,
  StartSessionUseCase,
  StartWorkflowUseCase,
} from "../use-cases";

export class EnterpriseOsService {
  private readonly registerPlatformUseCase: RegisterPlatformUseCase;
  private readonly registerCapabilityUseCase: RegisterCapabilityUseCase;
  private readonly startWorkflowUseCase: StartWorkflowUseCase;
  private readonly completeWorkflowUseCase: CompleteWorkflowUseCase;
  private readonly changeBusinessStateUseCase: ChangeBusinessStateUseCase;
  private readonly startSessionUseCase: StartSessionUseCase;
  private readonly checkHealthUseCase: CheckHealthUseCase;

  constructor(private readonly deps: EnterpriseOsDependencies) {
    this.registerPlatformUseCase = new RegisterPlatformUseCase(deps);
    this.registerCapabilityUseCase = new RegisterCapabilityUseCase(deps);
    this.startWorkflowUseCase = new StartWorkflowUseCase(deps);
    this.completeWorkflowUseCase = new CompleteWorkflowUseCase(deps);
    this.changeBusinessStateUseCase = new ChangeBusinessStateUseCase(deps);
    this.startSessionUseCase = new StartSessionUseCase(deps);
    this.checkHealthUseCase = new CheckHealthUseCase(deps);
  }

  registerPlatform(dto: RegisterPlatformDto) {
    return this.registerPlatformUseCase.execute(dto);
  }

  registerCapability(dto: RegisterCapabilityDto) {
    return this.registerCapabilityUseCase.execute(dto);
  }

  startWorkflow(dto: StartWorkflowDto) {
    return this.startWorkflowUseCase.execute(dto);
  }

  completeWorkflow(dto: CompleteWorkflowDto) {
    return this.completeWorkflowUseCase.execute(dto);
  }

  changeBusinessState(dto: ChangeBusinessStateDto) {
    return this.changeBusinessStateUseCase.execute(dto);
  }

  startSession(dto: StartSessionDto) {
    return this.startSessionUseCase.execute(dto);
  }

  checkHealth(dto: CheckHealthDto) {
    return this.checkHealthUseCase.execute(dto);
  }

  async listPlatforms(organizationId: string) {
    return this.deps.enterpriseRegistry.findPlatformsByOrganization(organizationId);
  }

  async listCapabilities(platformId: string) {
    return this.deps.enterpriseRegistry.findCapabilitiesByPlatform(platformId);
  }

  getKernelStatus() {
    return this.deps.operatingSystemKernel.getStatus();
  }

  async initialize(organizationId: string) {
    return this.deps.operatingSystemKernel.initialize(organizationId);
  }
}
