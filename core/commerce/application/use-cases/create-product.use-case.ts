import { Product, createProductCreatedEvent } from "../../domain";
import type { CreateProductDto } from "../dto";
import type { CommerceDependencies } from "../dependencies";

export class CreateProductUseCase {
  constructor(private readonly deps: CommerceDependencies) {}

  async execute(dto: CreateProductDto) {
    const product = Product.create({
      organizationId: dto.organizationId,
      name: dto.name,
      description: dto.description,
      sku: dto.sku,
      price: dto.price,
      currency: dto.currency,
      stock: dto.stock,
      category: dto.category,
    });

    await this.deps.productRepository.save(product);
    await this.deps.eventDispatcher.publish(createProductCreatedEvent(product));
    return product;
  }
}
