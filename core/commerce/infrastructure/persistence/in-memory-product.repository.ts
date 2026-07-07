import { Product, type ProductRepository } from "../../domain";

function serializeProduct(product: Product): string {
  return JSON.stringify(product.toJSON());
}

function deserializeProduct(raw: string): Product {
  return Product.create(JSON.parse(raw) as ReturnType<Product["toJSON"]>);
}

export class InMemoryProductRepository implements ProductRepository {
  private readonly products = new Map<string, string>();

  async save(product: Product): Promise<void> {
    this.products.set(product.id, serializeProduct(product));
  }

  async findById(id: string): Promise<Product | null> {
    const raw = this.products.get(id);
    return raw ? deserializeProduct(raw) : null;
  }

  async findByOrganization(organizationId: string): Promise<Product[]> {
    const results: Product[] = [];
    for (const raw of this.products.values()) {
      const product = deserializeProduct(raw);
      if (product.organizationId === organizationId) results.push(product);
    }
    return results;
  }
}
