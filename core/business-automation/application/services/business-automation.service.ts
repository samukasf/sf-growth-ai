import type {
  ApproveAutomationDto,
  CancelAutomationDto,
  CreateAutomationDto,
  ExecuteAutomationDto,
  ScheduleAutomationDto,
} from "../dto";
import type { BusinessAutomationDependencies } from "../dependencies";
import {
  ApproveAutomationUseCase,
  CancelAutomationUseCase,
  CreateAutomationUseCase,
  ExecuteAutomationUseCase,
  ScheduleAutomationUseCase,
} from "../use-cases";

export class BusinessAutomationService {
  private readonly createUseCase: CreateAutomationUseCase;
  private readonly executeUseCase: ExecuteAutomationUseCase;
  private readonly approveUseCase: ApproveAutomationUseCase;
  private readonly cancelUseCase: CancelAutomationUseCase;
  private readonly scheduleUseCase: ScheduleAutomationUseCase;

  constructor(private readonly deps: BusinessAutomationDependencies) {
    this.createUseCase = new CreateAutomationUseCase(deps);
    this.executeUseCase = new ExecuteAutomationUseCase(deps);
    this.approveUseCase = new ApproveAutomationUseCase(deps);
    this.cancelUseCase = new CancelAutomationUseCase(deps);
    this.scheduleUseCase = new ScheduleAutomationUseCase(deps);
  }

  createAutomation(dto: CreateAutomationDto) {
    return this.createUseCase.execute(dto);
  }

  executeAutomation(dto: ExecuteAutomationDto) {
    return this.executeUseCase.execute(dto);
  }

  approveAutomation(dto: ApproveAutomationDto) {
    return this.approveUseCase.execute(dto);
  }

  cancelAutomation(dto: CancelAutomationDto) {
    return this.cancelUseCase.execute(dto);
  }

  scheduleAutomation(dto: ScheduleAutomationDto) {
    return this.scheduleUseCase.execute(dto);
  }

  async listAutomations(organizationId: string) {
    return this.deps.automationRepository.findByOrganization(organizationId);
  }

  async listWorkflows(organizationId: string) {
    return this.deps.workflowRepository.findByOrganization(organizationId);
  }

  async listSchedules(organizationId: string) {
    return this.deps.automationRepository.findSchedulesByOrganization(organizationId);
  }
}
