import type { OpportunityId, OrganizationId } from "../../shared";
import type { Opportunity } from "../entities";

export interface OpportunityRepository {
  save(opportunity: Opportunity): Promise<void>;
  findById(id: OpportunityId): Promise<Opportunity | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Opportunity[]>;
  findByCustomer(customerId: string): Promise<Opportunity[]>;
}
