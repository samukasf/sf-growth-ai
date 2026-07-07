import { OrderNotFoundError } from "../../shared";
import {
  Invoice,
  Payment,
  createInvoiceIssuedEvent,
  createPaymentReceivedEvent,
} from "../../domain";
import type { ReceivePaymentDto } from "../dto";
import type { CommerceDependencies } from "../dependencies";

export class ReceivePaymentUseCase {
  constructor(private readonly deps: CommerceDependencies) {}

  async execute(dto: ReceivePaymentDto) {
    const order = await this.deps.orderRepository.findById(dto.orderId);
    if (!order) throw new OrderNotFoundError(dto.orderId);

    const payment = Payment.create({
      organizationId: dto.organizationId,
      orderId: dto.orderId,
      amount: dto.amount,
      currency: dto.currency,
      method: dto.method,
    }).receive(dto.transactionRef);

    await this.deps.paymentRepository.save(payment);
    await this.deps.eventDispatcher.publish(createPaymentReceivedEvent(payment));

    const invoice = Invoice.create({
      organizationId: dto.organizationId,
      orderId: dto.orderId,
      paymentId: payment.id,
      number: `INV-${Date.now()}`,
      amount: dto.amount,
      currency: dto.currency,
    }).issue();

    await this.deps.paymentRepository.saveInvoice(invoice);
    await this.deps.eventDispatcher.publish(createInvoiceIssuedEvent(invoice));

    return { payment, invoice };
  }
}
