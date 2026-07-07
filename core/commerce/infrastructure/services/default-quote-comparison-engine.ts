import { QuoteComparison, type QuoteComparisonEngine, type SupplierQuote } from "../../domain";

export class DefaultQuoteComparisonEngine implements QuoteComparisonEngine {
  compare(quotes: SupplierQuote[]) {
    const rankings = this.rank(quotes);
    const recommended = rankings[0];

    return QuoteComparison.create({
      organizationId: quotes[0]?.organizationId ?? "unknown",
      purchaseRequestId: quotes[0]?.purchaseRequestId ?? "unknown",
      quoteIds: quotes.map((q) => q.id),
      rankings: rankings.map((r) => ({
        quoteId: r.quoteId,
        supplierName: quotes.find((q) => q.id === r.quoteId)?.supplierName ?? "",
        score: r.score,
        rank: r.rank,
        reason: r.reason,
      })),
      recommendedQuoteId: recommended?.quoteId,
    });
  }

  rank(quotes: SupplierQuote[]) {
    if (quotes.length === 0) return [];

    const minAmount = Math.min(...quotes.map((q) => q.amount));
    const minDelivery = Math.min(...quotes.map((q) => q.deliveryDays));

    const scored = quotes.map((quote) => {
      const priceScore = minAmount > 0 ? (minAmount / quote.amount) * 50 : 25;
      const deliveryScore =
        minDelivery > 0 ? (minDelivery / quote.deliveryDays) * 50 : 25;
      const score = Math.round(priceScore + deliveryScore);
      return {
        quoteId: quote.id,
        score,
        rank: 0,
        reason: `Preço: ${quote.amount} ${quote.currency}, entrega: ${quote.deliveryDays} dias`,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s, i) => ({ ...s, rank: i + 1 }));
  }
}
