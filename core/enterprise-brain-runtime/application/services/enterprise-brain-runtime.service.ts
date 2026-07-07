import type { EnterpriseBrainRuntime } from "../../domain";
import type { EnterpriseBrainRuntimeDependencies } from "../dependencies";
import {
  AnalyzeHealthUseCase,
  BuildContextUseCase,
  BuildSnapshotUseCase,
} from "../use-cases";

export class EnterpriseBrainRuntimeService implements EnterpriseBrainRuntime {
  private readonly buildSnapshotUseCase: BuildSnapshotUseCase;
  private readonly buildContextUseCase: BuildContextUseCase;
  private readonly analyzeHealthUseCase: AnalyzeHealthUseCase;

  constructor(private readonly deps: EnterpriseBrainRuntimeDependencies) {
    this.buildSnapshotUseCase = new BuildSnapshotUseCase(deps);
    this.buildContextUseCase = new BuildContextUseCase(deps);
    this.analyzeHealthUseCase = new AnalyzeHealthUseCase(deps);
  }

  async buildSnapshot(organizationId: string, companyId: string) {
    const result = await this.buildSnapshotUseCase.execute({ organizationId, companyId });
    return result.snapshot;
  }

  buildContext(organizationId: string, companyId: string) {
    return this.buildContextUseCase.execute({ organizationId, companyId });
  }

  analyzeHealth(organizationId: string, companyId: string) {
    return this.analyzeHealthUseCase.execute({ organizationId, companyId });
  }

  getLatestSnapshot(organizationId: string, companyId: string) {
    return this.deps.repository.findLatestSnapshot(organizationId, companyId);
  }

  getState(organizationId: string, companyId: string) {
    return this.deps.stateManager.getOrCreate(organizationId, companyId);
  }

  getRelationships(organizationId: string, companyId: string) {
    return this.deps.repository.findRelationships(organizationId, companyId);
  }
}
