import type { EventDispatcher } from "../shared";
import type {
  CommerceEngine,
  DeliveryManager,
  OrderRepository,
  PaymentRepository,
  PricingEngine,
  ProductRepository,
  PurchaseApprovalEngine,
  QuoteComparisonEngine,
  ServiceRepository,
  SubscriptionRepository,
  SupplierQuoteRepository,
} from "../domain";
import type { PaymentConnectorPort } from "./ports/connectors";
import type {
  BusinessAutomationPort,
  BusinessCommunicationPort,
  CompanyBrainPort,
  ExecutiveCrmPort,
  ExecutiveFinancePort,
  ExecutiveOperationsPort,
  ExecutiveSalesPort,
  OrganizationBrainPort,
  SoftwareFactoryPort,
} from "./ports/integration";

export type CommerceDependencies = {
  productRepository: ProductRepository;
  serviceRepository: ServiceRepository;
  orderRepository: OrderRepository;
  paymentRepository: PaymentRepository;
  subscriptionRepository: SubscriptionRepository;
  supplierQuoteRepository: SupplierQuoteRepository;
  commerceEngine: CommerceEngine;
  pricingEngine: PricingEngine;
  quoteComparisonEngine: QuoteComparisonEngine;
  purchaseApprovalEngine: PurchaseApprovalEngine;
  deliveryManager: DeliveryManager;
  eventDispatcher: EventDispatcher;
  businessCommunication: BusinessCommunicationPort;
  businessAutomation: BusinessAutomationPort;
  executiveCrm: ExecutiveCrmPort;
  executiveFinance: ExecutiveFinancePort;
  executiveSales: ExecutiveSalesPort;
  executiveOperations: ExecutiveOperationsPort;
  companyBrain: CompanyBrainPort;
  organizationBrain: OrganizationBrainPort;
  softwareFactory: SoftwareFactoryPort;
  paymentConnectors: PaymentConnectorPort[];
};
