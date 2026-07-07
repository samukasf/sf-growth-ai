import type { OrganizationId, ServiceId } from "../../shared";
import type { Service } from "../entities";

export interface ServiceRepository {
  save(service: Service): Promise<void>;
  findById(id: ServiceId): Promise<Service | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Service[]>;
}
