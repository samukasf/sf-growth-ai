import type {
  ApproveProjectInput,
  ExecutiveProjectGenerator,
  ExecutiveProjectResult,
  GenerateProjectInput,
  GenerateProjectResult,
  RejectProjectInput,
  StartProjectInput,
} from "../../domain";
import type { ExecutiveProjectId } from "../../shared";
import type { ExecutiveProjectGeneratorDependencies } from "../dependencies";
import { ApproveProjectUseCase, GenerateProjectUseCase, RejectProjectUseCase, StartProjectUseCase } from "../use-cases";

export class ExecutiveProjectGeneratorService implements ExecutiveProjectGenerator {
  private readonly generateUseCase: GenerateProjectUseCase;
  private readonly approveUseCase: ApproveProjectUseCase;
  private readonly rejectUseCase: RejectProjectUseCase;
  private readonly startUseCase: StartProjectUseCase;

  constructor(private readonly deps: ExecutiveProjectGeneratorDependencies) {
    this.generateUseCase = new GenerateProjectUseCase(deps);
    this.approveUseCase = new ApproveProjectUseCase(deps);
    this.rejectUseCase = new RejectProjectUseCase(deps);
    this.startUseCase = new StartProjectUseCase(deps);
  }

  generateProject(input: GenerateProjectInput): Promise<GenerateProjectResult> {
    return this.generateUseCase.execute(input);
  }

  approveProject(input: ApproveProjectInput): Promise<ExecutiveProjectResult> {
    return this.approveUseCase.execute(input);
  }

  rejectProject(input: RejectProjectInput): Promise<ExecutiveProjectResult> {
    return this.rejectUseCase.execute(input);
  }

  startProject(input: StartProjectInput): Promise<ExecutiveProjectResult> {
    return this.startUseCase.execute(input);
  }

  getProject(projectId: ExecutiveProjectId): Promise<ExecutiveProjectResult | null> {
    return this.deps.repository.findResultByProject(projectId);
  }
}

