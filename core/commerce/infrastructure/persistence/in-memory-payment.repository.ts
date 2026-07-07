import { Invoice, Payment, type PaymentRepository } from "../../domain";

function serializePayment(payment: Payment): string {
  return JSON.stringify(payment.toJSON());
}

function deserializePayment(raw: string): Payment {
  return Payment.create(JSON.parse(raw) as ReturnType<Payment["toJSON"]>);
}

function serializeInvoice(invoice: Invoice): string {
  return JSON.stringify(invoice.toJSON());
}

function deserializeInvoice(raw: string): Invoice {
  return Invoice.create(JSON.parse(raw) as ReturnType<Invoice["toJSON"]>);
}

export class InMemoryPaymentRepository implements PaymentRepository {
  private readonly payments = new Map<string, string>();
  private readonly invoices = new Map<string, string>();

  async save(payment: Payment): Promise<void> {
    this.payments.set(payment.id, serializePayment(payment));
  }

  async findById(id: string): Promise<Payment | null> {
    const raw = this.payments.get(id);
    return raw ? deserializePayment(raw) : null;
  }

  async findByOrder(orderId: string): Promise<Payment[]> {
    const results: Payment[] = [];
    for (const raw of this.payments.values()) {
      const payment = deserializePayment(raw);
      if (payment.orderId === orderId) results.push(payment);
    }
    return results;
  }

  async saveInvoice(invoice: Invoice): Promise<void> {
    this.invoices.set(invoice.id, serializeInvoice(invoice));
  }

  async findInvoiceById(id: string): Promise<Invoice | null> {
    const raw = this.invoices.get(id);
    return raw ? deserializeInvoice(raw) : null;
  }

  async findInvoicesByOrganization(organizationId: string): Promise<Invoice[]> {
    const results: Invoice[] = [];
    for (const raw of this.invoices.values()) {
      const invoice = deserializeInvoice(raw);
      if (invoice.organizationId === organizationId) results.push(invoice);
    }
    return results;
  }
}
