import {
  createProjectApprovedEvent,
  type ApproveSoftwareProjectInput,
  type SoftwareFactoryResult,
} from "../../domain";
import { SoftwareProjectNotFoundError } from "../../shared";
import type { SoftwareFactoryDependencies } from "../dependencies";

export class ApproveSoftwareProjectUseCase {
  constructor(private readonly deps: SoftwareFactoryDependencies) {}

  async execute(input: ApproveSoftwareProjectInput): Promise<SoftwareFactoryResult> {
    const project = await this.deps.repository.findProjectById(input.projectId);
    if (!project) throw new SoftwareProjectNotFoundError(input.projectId);

    const updated = project.withApprovalStatus("approved");
    await this.deps.repository.saveProject(updated);

    const approval = await this.deps.repository.findApprovalByProject(updated.id);
    if (approval) {
      await this.deps.repository.saveApproval(this.deps.approvalManager.approve(approval, input.approvedBy));
    }

    await this.deps.eventDispatcher.publish(createProjectApprovedEvent(updated, input.approvedBy));

    const result = await this.deps.repository.findResultByProject(updated.id);
    return result!;
  }
}

