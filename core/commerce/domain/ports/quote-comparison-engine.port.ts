import type { QuoteComparison, SupplierQuote } from "../entities";

export interface QuoteComparisonEngine {
  compare(quotes: SupplierQuote[]): QuoteComparison;
  rank(quotes: SupplierQuote[]): Array<{ quoteId: string; score: number; rank: number; reason: string }>;
}
