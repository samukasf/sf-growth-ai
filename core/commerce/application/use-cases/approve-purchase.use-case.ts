import { createPurchaseApprovedEvent } from "../../domain";
import type { ApprovePurchaseDto } from "../dto";
import type { CommerceDependencies } from "../dependencies";

export class ApprovePurchaseUseCase {
  constructor(private readonly deps: CommerceDependencies) {}

  async execute(dto: ApprovePurchaseDto) {
    const request = await this.deps.supplierQuoteRepository.findPurchaseRequestById(
      dto.purchaseRequestId,
    );
    if (!request) throw new Error(`Purchase request not found: ${dto.purchaseRequestId}`);

    const approved = this.deps.purchaseApprovalEngine.approve(request, dto.approverId);
    await this.deps.supplierQuoteRepository.savePurchaseRequest(approved);
    await this.deps.eventDispatcher.publish(
      createPurchaseApprovedEvent(approved, dto.approverId),
    );

    return approved;
  }
}
