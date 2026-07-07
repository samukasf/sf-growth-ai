import type { CommerceDependencies } from "../../application";
import { CommerceService } from "../../application";
import { createDefaultPaymentConnectors } from "../connectors/noop-payment-connectors";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import {
  NoopBusinessAutomationAdapter,
  NoopBusinessCommunicationAdapter,
  NoopCompanyBrainAdapter,
  NoopExecutiveCrmAdapter,
  NoopExecutiveFinanceAdapter,
  NoopExecutiveOperationsAdapter,
  NoopExecutiveSalesAdapter,
  NoopOrganizationBrainAdapter,
  NoopSoftwareFactoryAdapter,
} from "../integration/noop-integration.adapters";
import { InMemoryOrderRepository } from "../persistence/in-memory-order.repository";
import { InMemoryPaymentRepository } from "../persistence/in-memory-payment.repository";
import { InMemoryProductRepository } from "../persistence/in-memory-product.repository";
import { InMemoryServiceRepository } from "../persistence/in-memory-service.repository";
import { InMemorySubscriptionRepository } from "../persistence/in-memory-subscription.repository";
import { InMemorySupplierQuoteRepository } from "../persistence/in-memory-supplier-quote.repository";
import { DefaultCommerceEngine } from "../services/default-commerce-engine";
import { DefaultDeliveryManager } from "../services/default-delivery-manager";
import { DefaultPricingEngine } from "../services/default-pricing-engine";
import { DefaultPurchaseApprovalEngine } from "../services/default-purchase-approval-engine";
import { DefaultQuoteComparisonEngine } from "../services/default-quote-comparison-engine";

export type CreateCommerceOptions = {
  dependencies?: Partial<CommerceDependencies>;
};

export function createCommerce(options: CreateCommerceOptions = {}): CommerceService {
  const dependencies: CommerceDependencies = {
    productRepository:
      options.dependencies?.productRepository ?? new InMemoryProductRepository(),
    serviceRepository:
      options.dependencies?.serviceRepository ?? new InMemoryServiceRepository(),
    orderRepository: options.dependencies?.orderRepository ?? new InMemoryOrderRepository(),
    paymentRepository:
      options.dependencies?.paymentRepository ?? new InMemoryPaymentRepository(),
    subscriptionRepository:
      options.dependencies?.subscriptionRepository ?? new InMemorySubscriptionRepository(),
    supplierQuoteRepository:
      options.dependencies?.supplierQuoteRepository ?? new InMemorySupplierQuoteRepository(),
    commerceEngine: options.dependencies?.commerceEngine ?? new DefaultCommerceEngine(),
    pricingEngine: options.dependencies?.pricingEngine ?? new DefaultPricingEngine(),
    quoteComparisonEngine:
      options.dependencies?.quoteComparisonEngine ?? new DefaultQuoteComparisonEngine(),
    purchaseApprovalEngine:
      options.dependencies?.purchaseApprovalEngine ?? new DefaultPurchaseApprovalEngine(),
    deliveryManager: options.dependencies?.deliveryManager ?? new DefaultDeliveryManager(),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    businessCommunication:
      options.dependencies?.businessCommunication ?? new NoopBusinessCommunicationAdapter(),
    businessAutomation:
      options.dependencies?.businessAutomation ?? new NoopBusinessAutomationAdapter(),
    executiveCrm: options.dependencies?.executiveCrm ?? new NoopExecutiveCrmAdapter(),
    executiveFinance:
      options.dependencies?.executiveFinance ?? new NoopExecutiveFinanceAdapter(),
    executiveSales: options.dependencies?.executiveSales ?? new NoopExecutiveSalesAdapter(),
    executiveOperations:
      options.dependencies?.executiveOperations ?? new NoopExecutiveOperationsAdapter(),
    companyBrain: options.dependencies?.companyBrain ?? new NoopCompanyBrainAdapter(),
    organizationBrain:
      options.dependencies?.organizationBrain ?? new NoopOrganizationBrainAdapter(),
    softwareFactory:
      options.dependencies?.softwareFactory ?? new NoopSoftwareFactoryAdapter(),
    paymentConnectors:
      options.dependencies?.paymentConnectors ?? createDefaultPaymentConnectors(),
  };

  return new CommerceService(dependencies);
}
