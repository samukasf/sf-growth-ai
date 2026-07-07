import type {
  CompanyDiscoveryEngine,
  DiscoveryReport,
  RunDiscoveryInput,
  RunDiscoveryResult,
  StartDiscoveryInput,
  StartDiscoveryResult,
} from "../../domain";
import type { CompanyId, DiscoverySessionId } from "../../shared";
import type { CompanyDiscoveryDependencies } from "../dependencies";
import { RunDiscoveryPipelineUseCase, StartDiscoverySessionUseCase } from "../use-cases";

export class CompanyDiscoveryEngineService implements CompanyDiscoveryEngine {
  private readonly startUseCase: StartDiscoverySessionUseCase;
  private readonly runUseCase: RunDiscoveryPipelineUseCase;

  constructor(private readonly deps: CompanyDiscoveryDependencies) {
    this.startUseCase = new StartDiscoverySessionUseCase(deps);
    this.runUseCase = new RunDiscoveryPipelineUseCase(deps);
  }

  startDiscovery(input: StartDiscoveryInput): Promise<StartDiscoveryResult> {
    return this.startUseCase.execute(input);
  }

  runDiscovery(input: RunDiscoveryInput): Promise<RunDiscoveryResult> {
    return this.runUseCase.execute(input);
  }

  getProfile(companyId: CompanyId) {
    return this.deps.repository.findProfileByCompany(companyId);
  }

  getReport(sessionId: DiscoverySessionId): Promise<DiscoveryReport | null> {
    return this.deps.repository.findReportBySession(sessionId);
  }
}
