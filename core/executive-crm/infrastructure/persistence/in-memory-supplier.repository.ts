import { Supplier, type SupplierRepository } from "../../domain";

function serializeSupplier(supplier: Supplier): string {
  return JSON.stringify(supplier.toJSON());
}

function deserializeSupplier(raw: string): Supplier {
  return Supplier.create(JSON.parse(raw) as ReturnType<Supplier["toJSON"]>);
}

export class InMemorySupplierRepository implements SupplierRepository {
  private readonly suppliers = new Map<string, string>();

  async save(supplier: Supplier): Promise<void> {
    this.suppliers.set(supplier.id, serializeSupplier(supplier));
  }

  async findById(id: string): Promise<Supplier | null> {
    const raw = this.suppliers.get(id);
    return raw ? deserializeSupplier(raw) : null;
  }

  async findByOrganization(organizationId: string): Promise<Supplier[]> {
    const results: Supplier[] = [];
    for (const raw of this.suppliers.values()) {
      const supplier = deserializeSupplier(raw);
      if (supplier.organizationId === organizationId) results.push(supplier);
    }
    return results;
  }
}
