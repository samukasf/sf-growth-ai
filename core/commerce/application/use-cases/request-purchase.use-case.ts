import { PurchaseRequest, createPurchaseRequestedEvent } from "../../domain";
import type { RequestPurchaseDto } from "../dto";
import type { CommerceDependencies } from "../dependencies";

export class RequestPurchaseUseCase {
  constructor(private readonly deps: CommerceDependencies) {}

  async execute(dto: RequestPurchaseDto) {
    const request = PurchaseRequest.create({
      organizationId: dto.organizationId,
      requesterId: dto.requesterId,
      title: dto.title,
      description: dto.description,
      estimatedBudget: dto.estimatedBudget,
      currency: dto.currency,
      requiresApproval: dto.requiresApproval ?? true,
    });

    await this.deps.supplierQuoteRepository.savePurchaseRequest(request);
    await this.deps.eventDispatcher.publish(createPurchaseRequestedEvent(request));

    const evaluation = this.deps.purchaseApprovalEngine.evaluate(request);
    return { request, evaluation };
  }
}
