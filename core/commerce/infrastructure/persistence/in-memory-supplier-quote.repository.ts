import {
  PurchaseRequest,
  QuoteComparison,
  SupplierQuote,
  type SupplierQuoteRepository,
} from "../../domain";

function serializePurchaseRequest(request: PurchaseRequest): string {
  return JSON.stringify(request.toJSON());
}

function deserializePurchaseRequest(raw: string): PurchaseRequest {
  return PurchaseRequest.create(JSON.parse(raw) as ReturnType<PurchaseRequest["toJSON"]>);
}

export class InMemorySupplierQuoteRepository implements SupplierQuoteRepository {
  private readonly quotes: SupplierQuote[] = [];
  private readonly requests = new Map<string, string>();
  private readonly comparisons: QuoteComparison[] = [];

  async saveQuote(quote: SupplierQuote): Promise<void> {
    this.quotes.push(quote);
  }

  async findQuoteById(id: string): Promise<SupplierQuote | null> {
    return this.quotes.find((q) => q.id === id) ?? null;
  }

  async findQuotesByPurchaseRequest(purchaseRequestId: string): Promise<SupplierQuote[]> {
    return this.quotes.filter((q) => q.purchaseRequestId === purchaseRequestId);
  }

  async savePurchaseRequest(request: PurchaseRequest): Promise<void> {
    this.requests.set(request.id, serializePurchaseRequest(request));
  }

  async findPurchaseRequestById(id: string): Promise<PurchaseRequest | null> {
    const raw = this.requests.get(id);
    return raw ? deserializePurchaseRequest(raw) : null;
  }

  async findPurchaseRequestsByOrganization(organizationId: string): Promise<PurchaseRequest[]> {
    const results: PurchaseRequest[] = [];
    for (const raw of this.requests.values()) {
      const request = deserializePurchaseRequest(raw);
      if (request.organizationId === organizationId) results.push(request);
    }
    return results;
  }

  async saveComparison(comparison: QuoteComparison): Promise<void> {
    this.comparisons.push(comparison);
  }
}
