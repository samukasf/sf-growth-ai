import type { LeadId, OrganizationId } from "../../shared";
import type { Lead } from "../entities";

export interface LeadRepository {
  save(lead: Lead): Promise<void>;
  findById(id: LeadId): Promise<Lead | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Lead[]>;
}
