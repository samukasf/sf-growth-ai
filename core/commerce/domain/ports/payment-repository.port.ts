import type { OrganizationId, PaymentId } from "../../shared";
import type { Invoice, Payment } from "../entities";

export interface PaymentRepository {
  save(payment: Payment): Promise<void>;
  findById(id: PaymentId): Promise<Payment | null>;
  findByOrder(orderId: string): Promise<Payment[]>;
  saveInvoice(invoice: Invoice): Promise<void>;
  findInvoiceById(id: string): Promise<Invoice | null>;
  findInvoicesByOrganization(organizationId: OrganizationId): Promise<Invoice[]>;
}
