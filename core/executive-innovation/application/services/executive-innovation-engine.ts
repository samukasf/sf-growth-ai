import type {
  ApproveInnovationDto,
  CreateInnovationOpportunityDto,
  CreateInnovationProjectDto,
  DetectOpportunitiesDto,
  RejectInnovationDto,
} from "../dto";
import type { ExecutiveInnovationEngineDependencies } from "../dependencies";
import {
  ApproveInnovationUseCase,
  CreateInnovationOpportunityUseCase,
  CreateInnovationProjectUseCase,
  DetectOpportunitiesUseCase,
  RejectInnovationUseCase,
} from "../use-cases";

export class ExecutiveInnovationEngine {
  private readonly detectUseCase: DetectOpportunitiesUseCase;
  private readonly createUseCase: CreateInnovationOpportunityUseCase;
  private readonly approveUseCase: ApproveInnovationUseCase;
  private readonly rejectUseCase: RejectInnovationUseCase;
  private readonly createProjectUseCase: CreateInnovationProjectUseCase;

  constructor(private readonly deps: ExecutiveInnovationEngineDependencies) {
    this.detectUseCase = new DetectOpportunitiesUseCase(deps);
    this.createUseCase = new CreateInnovationOpportunityUseCase(deps);
    this.approveUseCase = new ApproveInnovationUseCase(deps);
    this.rejectUseCase = new RejectInnovationUseCase(deps);
    this.createProjectUseCase = new CreateInnovationProjectUseCase(deps);
  }

  detectOpportunities(dto: DetectOpportunitiesDto) {
    return this.detectUseCase.execute(dto);
  }

  createOpportunity(dto: CreateInnovationOpportunityDto) {
    return this.createUseCase.execute(dto);
  }

  approveInnovation(dto: ApproveInnovationDto) {
    return this.approveUseCase.execute(dto);
  }

  rejectInnovation(dto: RejectInnovationDto) {
    return this.rejectUseCase.execute(dto);
  }

  createProject(dto: CreateInnovationProjectDto) {
    return this.createProjectUseCase.execute(dto);
  }

  async prioritizeOpportunities(companyId: string) {
    const opportunities = await this.deps.repository.findOpportunitiesByCompany(companyId);
    return this.deps.prioritizer.prioritize(opportunities);
  }
}
