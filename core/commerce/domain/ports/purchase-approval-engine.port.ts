import type { PurchaseRequest } from "../entities";

export type ApprovalResult = {
  approved: boolean;
  requiresApproval: boolean;
  message: string;
};

export interface PurchaseApprovalEngine {
  evaluate(request: PurchaseRequest): ApprovalResult;
  approve(request: PurchaseRequest, approverId: string): PurchaseRequest;
}
