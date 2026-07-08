import { ProjectApproval } from "../../domain";
import type { ApprovalCoordinator, ApprovalCoordinationInput } from "../../domain";

export class DefaultApprovalCoordinator implements ApprovalCoordinator {
  requestApproval(input: ApprovalCoordinationInput): ProjectApproval {
    return ProjectApproval.create({ projectId: input.project.id, status: "pending" });
  }

  approve(input: { approval: ProjectApproval; decidedBy: string }): ProjectApproval {
    return input.approval.approve(input.decidedBy);
  }

  reject(input: { approval: ProjectApproval; decidedBy: string; reason: string }): ProjectApproval {
    return input.approval.reject(input.decidedBy, input.reason);
  }
}

