import type {
  ApproveProjectDto,
  CompleteProjectDto,
  GenerateProjectDto,
  RejectProjectDto,
  StartProjectDto,
} from "../dto";
import type { ExecutiveProjectEngineDependencies } from "../dependencies";
import {
  ApproveProjectUseCase,
  CompleteProjectUseCase,
  GenerateProjectUseCase,
  RejectProjectUseCase,
  StartProjectUseCase,
} from "../use-cases";

export class ExecutiveProjectEngine {
  private readonly generateUseCase: GenerateProjectUseCase;
  private readonly approveUseCase: ApproveProjectUseCase;
  private readonly rejectUseCase: RejectProjectUseCase;
  private readonly startUseCase: StartProjectUseCase;
  private readonly completeUseCase: CompleteProjectUseCase;

  constructor(private readonly deps: ExecutiveProjectEngineDependencies) {
    this.generateUseCase = new GenerateProjectUseCase(deps);
    this.approveUseCase = new ApproveProjectUseCase(deps);
    this.rejectUseCase = new RejectProjectUseCase(deps);
    this.startUseCase = new StartProjectUseCase(deps);
    this.completeUseCase = new CompleteProjectUseCase(deps);
  }

  generateProject(dto: GenerateProjectDto) {
    return this.generateUseCase.execute(dto);
  }

  approveProject(dto: ApproveProjectDto) {
    return this.approveUseCase.execute(dto);
  }

  rejectProject(dto: RejectProjectDto) {
    return this.rejectUseCase.execute(dto);
  }

  startProject(dto: StartProjectDto) {
    return this.startUseCase.execute(dto);
  }

  completeProject(dto: CompleteProjectDto) {
    return this.completeUseCase.execute(dto);
  }

  async listProjects(companyId: string) {
    return this.deps.repository.findProjectsByCompany(companyId);
  }
}
