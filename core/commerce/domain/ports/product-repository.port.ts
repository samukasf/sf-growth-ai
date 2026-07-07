import type { OrganizationId, ProductId } from "../../shared";
import type { Product } from "../entities";

export interface ProductRepository {
  save(product: Product): Promise<void>;
  findById(id: ProductId): Promise<Product | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Product[]>;
}
