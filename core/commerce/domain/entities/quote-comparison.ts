import type { OrganizationId, PurchaseRequestId, QuoteComparisonId } from "../../shared";

export type QuoteRanking = {
  quoteId: string;
  supplierName: string;
  score: number;
  rank: number;
  reason: string;
};

export type QuoteComparisonProps = {
  id: QuoteComparisonId;
  organizationId: OrganizationId;
  purchaseRequestId: PurchaseRequestId;
  quoteIds: string[];
  rankings: QuoteRanking[];
  recommendedQuoteId?: string;
  createdAt: string;
};

export class QuoteComparison {
  readonly id: QuoteComparisonId;
  readonly organizationId: OrganizationId;
  readonly purchaseRequestId: PurchaseRequestId;
  readonly quoteIds: string[];
  readonly rankings: QuoteRanking[];
  readonly recommendedQuoteId?: string;
  readonly createdAt: string;

  private constructor(props: QuoteComparisonProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.purchaseRequestId = props.purchaseRequestId;
    this.quoteIds = [...props.quoteIds];
    this.rankings = props.rankings.map((r) => ({ ...r }));
    this.recommendedQuoteId = props.recommendedQuoteId;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<QuoteComparisonProps, "id" | "createdAt"> & {
      id?: QuoteComparisonId;
      createdAt?: string;
    },
  ): QuoteComparison {
    return new QuoteComparison({
      id: props.id ?? `comparison-${Date.now()}`,
      organizationId: props.organizationId,
      purchaseRequestId: props.purchaseRequestId,
      quoteIds: props.quoteIds,
      rankings: props.rankings,
      recommendedQuoteId: props.recommendedQuoteId,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): QuoteComparisonProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      purchaseRequestId: this.purchaseRequestId,
      quoteIds: [...this.quoteIds],
      rankings: this.rankings.map((r) => ({ ...r })),
      recommendedQuoteId: this.recommendedQuoteId,
      createdAt: this.createdAt,
    };
  }
}
