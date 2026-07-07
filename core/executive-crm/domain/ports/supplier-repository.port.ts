import type { OrganizationId, SupplierId } from "../../shared";
import type { Supplier } from "../entities";

export interface SupplierRepository {
  save(supplier: Supplier): Promise<void>;
  findById(id: SupplierId): Promise<Supplier | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Supplier[]>;
}
