import type { ProcessExecutiveRequestDto } from "../dto";
import type { ExecutiveOrchestratorEngineDependencies } from "../dependencies";
import { ProcessExecutiveRequestUseCase } from "../use-cases";

export class ExecutiveOrchestratorService {
  private readonly processUseCase: ProcessExecutiveRequestUseCase;

  constructor(private readonly deps: ExecutiveOrchestratorEngineDependencies) {
    this.processUseCase = new ProcessExecutiveRequestUseCase(deps);
  }

  processRequest(dto: ProcessExecutiveRequestDto) {
    return this.processUseCase.execute(dto);
  }

  async getRequest(requestId: string) {
    return this.deps.repository.findRequestById(requestId);
  }

  async listRequests(companyId: string) {
    return this.deps.repository.findRequestsByCompany(companyId);
  }
}
