import type { AutomationApproval } from "../entities";

export type ApprovalRequest = {
  automationId: string;
  executionId: string;
  organizationId: string;
  title: string;
  justification: string;
};

export interface ApprovalEngine {
  request(input: ApprovalRequest): AutomationApproval;
  approve(approval: AutomationApproval, approverId: string): AutomationApproval;
  isRequired(requiresApproval: boolean, actionType: string): boolean;
}
