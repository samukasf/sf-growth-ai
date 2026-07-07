import type {
  ApprovePurchaseDto,
  CompareQuotesDto,
  CompleteOrderDto,
  CreateDeliveryDto,
  CreateOrderDto,
  CreateProductDto,
  ReceivePaymentDto,
  ReceiveSupplierQuoteDto,
  RequestPurchaseDto,
  StartSubscriptionDto,
} from "../dto";
import type { CommerceDependencies } from "../dependencies";
import {
  ApprovePurchaseUseCase,
  CompareQuotesUseCase,
  CompleteOrderUseCase,
  CreateDeliveryUseCase,
  CreateOrderUseCase,
  CreateProductUseCase,
  ReceivePaymentUseCase,
  ReceiveSupplierQuoteUseCase,
  RequestPurchaseUseCase,
  StartSubscriptionUseCase,
} from "../use-cases";

export class CommerceService {
  private readonly createProductUseCase: CreateProductUseCase;
  private readonly createOrderUseCase: CreateOrderUseCase;
  private readonly receivePaymentUseCase: ReceivePaymentUseCase;
  private readonly startSubscriptionUseCase: StartSubscriptionUseCase;
  private readonly requestPurchaseUseCase: RequestPurchaseUseCase;
  private readonly approvePurchaseUseCase: ApprovePurchaseUseCase;
  private readonly receiveSupplierQuoteUseCase: ReceiveSupplierQuoteUseCase;
  private readonly compareQuotesUseCase: CompareQuotesUseCase;
  private readonly createDeliveryUseCase: CreateDeliveryUseCase;
  private readonly completeOrderUseCase: CompleteOrderUseCase;

  constructor(private readonly deps: CommerceDependencies) {
    this.createProductUseCase = new CreateProductUseCase(deps);
    this.createOrderUseCase = new CreateOrderUseCase(deps);
    this.receivePaymentUseCase = new ReceivePaymentUseCase(deps);
    this.startSubscriptionUseCase = new StartSubscriptionUseCase(deps);
    this.requestPurchaseUseCase = new RequestPurchaseUseCase(deps);
    this.approvePurchaseUseCase = new ApprovePurchaseUseCase(deps);
    this.receiveSupplierQuoteUseCase = new ReceiveSupplierQuoteUseCase(deps);
    this.compareQuotesUseCase = new CompareQuotesUseCase(deps);
    this.createDeliveryUseCase = new CreateDeliveryUseCase(deps);
    this.completeOrderUseCase = new CompleteOrderUseCase(deps);
  }

  createProduct(dto: CreateProductDto) {
    return this.createProductUseCase.execute(dto);
  }

  createOrder(dto: CreateOrderDto) {
    return this.createOrderUseCase.execute(dto);
  }

  receivePayment(dto: ReceivePaymentDto) {
    return this.receivePaymentUseCase.execute(dto);
  }

  startSubscription(dto: StartSubscriptionDto) {
    return this.startSubscriptionUseCase.execute(dto);
  }

  requestPurchase(dto: RequestPurchaseDto) {
    return this.requestPurchaseUseCase.execute(dto);
  }

  approvePurchase(dto: ApprovePurchaseDto) {
    return this.approvePurchaseUseCase.execute(dto);
  }

  receiveSupplierQuote(dto: ReceiveSupplierQuoteDto) {
    return this.receiveSupplierQuoteUseCase.execute(dto);
  }

  compareQuotes(dto: CompareQuotesDto) {
    return this.compareQuotesUseCase.execute(dto);
  }

  createDelivery(dto: CreateDeliveryDto) {
    return this.createDeliveryUseCase.execute(dto);
  }

  completeOrder(dto: CompleteOrderDto) {
    return this.completeOrderUseCase.execute(dto);
  }

  async listProducts(organizationId: string) {
    return this.deps.productRepository.findByOrganization(organizationId);
  }

  async listOrders(organizationId: string) {
    return this.deps.orderRepository.findByOrganization(organizationId);
  }

  getPaymentConnectors() {
    return this.deps.paymentConnectors;
  }
}
