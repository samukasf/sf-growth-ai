import { SoftwareApproval, type ApprovalManager, type SoftwareProject } from "../../domain";

export class DefaultApprovalManager implements ApprovalManager {
  request(project: SoftwareProject): SoftwareApproval {
    return SoftwareApproval.create({ projectId: project.id });
  }

  approve(approval: SoftwareApproval, decidedBy: string): SoftwareApproval {
    return approval.approve(decidedBy);
  }
}

