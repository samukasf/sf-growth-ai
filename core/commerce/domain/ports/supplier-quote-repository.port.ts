import type { OrganizationId, PurchaseRequestId } from "../../shared";
import type { PurchaseRequest, QuoteComparison, SupplierQuote } from "../entities";

export interface SupplierQuoteRepository {
  saveQuote(quote: SupplierQuote): Promise<void>;
  findQuoteById(id: string): Promise<SupplierQuote | null>;
  findQuotesByPurchaseRequest(purchaseRequestId: PurchaseRequestId): Promise<SupplierQuote[]>;
  savePurchaseRequest(request: PurchaseRequest): Promise<void>;
  findPurchaseRequestById(id: PurchaseRequestId): Promise<PurchaseRequest | null>;
  findPurchaseRequestsByOrganization(organizationId: OrganizationId): Promise<PurchaseRequest[]>;
  saveComparison(comparison: QuoteComparison): Promise<void>;
}
