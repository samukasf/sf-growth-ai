import type { OrganizationId, SubscriptionId } from "../../shared";
import type { Subscription } from "../entities";

export interface SubscriptionRepository {
  save(subscription: Subscription): Promise<void>;
  findById(id: SubscriptionId): Promise<Subscription | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Subscription[]>;
  findByCustomer(customerId: string): Promise<Subscription[]>;
}
