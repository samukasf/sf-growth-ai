import { AutomationApproval, type ApprovalEngine } from "../../domain";

export class DefaultApprovalEngine implements ApprovalEngine {
  request(input: {
    automationId: string;
    executionId: string;
    organizationId: string;
    title: string;
    justification: string;
  }) {
    return AutomationApproval.create({
      organizationId: input.organizationId,
      automationId: input.automationId,
      executionId: input.executionId,
      title: input.title,
      justification: input.justification,
    });
  }

  approve(approval: AutomationApproval, approverId: string) {
    return approval.approve(approverId);
  }

  isRequired(requiresApproval: boolean, actionType: string): boolean {
    if (requiresApproval) return true;
    return actionType === "request_approval" || actionType === "execute_api";
  }
}
