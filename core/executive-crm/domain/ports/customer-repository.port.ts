import type { CustomerId, OrganizationId } from "../../shared";
import type { Customer } from "../entities";

export interface CustomerRepository {
  save(customer: Customer): Promise<void>;
  findById(id: CustomerId): Promise<Customer | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Customer[]>;
}
