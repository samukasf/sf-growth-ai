import type { CompareQuotesDto } from "../dto";
import type { CommerceDependencies } from "../dependencies";

export class CompareQuotesUseCase {
  constructor(private readonly deps: CommerceDependencies) {}

  async execute(dto: CompareQuotesDto) {
    const quotes = await this.deps.supplierQuoteRepository.findQuotesByPurchaseRequest(
      dto.purchaseRequestId,
    );

    const comparison = this.deps.quoteComparisonEngine.compare(quotes);
    await this.deps.supplierQuoteRepository.saveComparison(comparison);
    return comparison;
  }
}
