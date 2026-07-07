import { SupplierQuote, createSupplierQuoteReceivedEvent } from "../../domain";
import type { ReceiveSupplierQuoteDto } from "../dto";
import type { CommerceDependencies } from "../dependencies";

export class ReceiveSupplierQuoteUseCase {
  constructor(private readonly deps: CommerceDependencies) {}

  async execute(dto: ReceiveSupplierQuoteDto) {
    const quote = SupplierQuote.create({
      organizationId: dto.organizationId,
      purchaseRequestId: dto.purchaseRequestId,
      supplierId: dto.supplierId,
      supplierName: dto.supplierName,
      amount: dto.amount,
      currency: dto.currency,
      deliveryDays: dto.deliveryDays,
    });

    await this.deps.supplierQuoteRepository.saveQuote(quote);
    await this.deps.eventDispatcher.publish(createSupplierQuoteReceivedEvent(quote));
    return quote;
  }
}
