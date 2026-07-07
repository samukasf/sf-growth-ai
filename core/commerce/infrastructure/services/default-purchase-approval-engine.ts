import type { PurchaseApprovalEngine, PurchaseRequest } from "../../domain";

const APPROVAL_THRESHOLD = 5000;

export class DefaultPurchaseApprovalEngine implements PurchaseApprovalEngine {
  evaluate(request: PurchaseRequest) {
    const needsApproval =
      request.requiresApproval || request.estimatedBudget >= APPROVAL_THRESHOLD;

    return {
      approved: !needsApproval,
      requiresApproval: needsApproval,
      message: needsApproval
        ? "Encomenda requer aprovação"
        : "Encomenda aprovada automaticamente",
    };
  }

  approve(request: PurchaseRequest, approverId: string) {
    void approverId;
    return request.approve();
  }
}
