import type {
  ApproveSoftwareProjectInput,
  SoftwareFactoryResult,
  SoftwareFactoryRuntime,
  RequestSoftwareInput,
} from "../../domain";
import type { SoftwareProjectId } from "../../shared";
import type { SoftwareFactoryDependencies } from "../dependencies";
import {
  ApproveSoftwareProjectUseCase,
  RequestSoftwareProjectUseCase,
} from "../use-cases";

export class SoftwareFactoryRuntimeService implements SoftwareFactoryRuntime {
  private readonly requestUseCase: RequestSoftwareProjectUseCase;
  private readonly approveUseCase: ApproveSoftwareProjectUseCase;

  constructor(private readonly deps: SoftwareFactoryDependencies) {
    this.requestUseCase = new RequestSoftwareProjectUseCase(deps);
    this.approveUseCase = new ApproveSoftwareProjectUseCase(deps);
  }

  requestSoftwareProject(input: RequestSoftwareInput): Promise<SoftwareFactoryResult> {
    return this.requestUseCase.execute(input);
  }

  approveSoftwareProject(input: ApproveSoftwareProjectInput): Promise<SoftwareFactoryResult> {
    return this.approveUseCase.execute(input);
  }

  getProject(projectId: SoftwareProjectId): Promise<SoftwareFactoryResult | null> {
    return this.deps.repository.findResultByProject(projectId);
  }
}

