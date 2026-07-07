export type CreateProductDto = {
  organizationId: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  currency: string;
  stock: number;
  category: string;
};

export type CreateOrderDto = {
  organizationId: string;
  cartId: string;
  customerId: string;
  channel: "online" | "in_store" | "phone" | "marketplace";
  taxRate?: number;
};

export type ReceivePaymentDto = {
  organizationId: string;
  orderId: string;
  amount: number;
  currency: string;
  method: "stripe" | "paypal" | "mbway" | "multibanco" | "bank_transfer" | "cash";
  transactionRef: string;
};

export type StartSubscriptionDto = {
  organizationId: string;
  customerId: string;
  planName: string;
  itemId: string;
  itemType: "product" | "service";
  amount: number;
  currency: string;
  frequency: "weekly" | "monthly" | "quarterly" | "yearly";
};

export type RequestPurchaseDto = {
  organizationId: string;
  requesterId: string;
  title: string;
  description: string;
  estimatedBudget: number;
  currency: string;
  requiresApproval?: boolean;
};

export type ApprovePurchaseDto = {
  organizationId: string;
  purchaseRequestId: string;
  approverId: string;
};

export type ReceiveSupplierQuoteDto = {
  organizationId: string;
  purchaseRequestId: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  currency: string;
  deliveryDays: number;
};

export type CompareQuotesDto = {
  organizationId: string;
  purchaseRequestId: string;
};

export type CreateDeliveryDto = {
  organizationId: string;
  orderId: string;
  address: string;
  provider?: "internal" | "glovo" | "uber_eats" | "bolt_food";
};

export type CompleteOrderDto = {
  organizationId: string;
  orderId: string;
};
