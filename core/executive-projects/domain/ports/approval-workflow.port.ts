import type { ExecutiveProject, ProjectApproval } from "../entities";

export interface ApprovalWorkflow {
  createRequest(project: ExecutiveProject): ProjectApproval | null;
  approve(approval: ProjectApproval): ProjectApproval;
  reject(approval: ProjectApproval): ProjectApproval;
}
