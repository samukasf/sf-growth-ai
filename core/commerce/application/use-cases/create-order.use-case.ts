import { createOrderCreatedEvent } from "../../domain";
import type { CreateOrderDto } from "../dto";
import type { CommerceDependencies } from "../dependencies";

export class CreateOrderUseCase {
  constructor(private readonly deps: CommerceDependencies) {}

  async execute(dto: CreateOrderDto) {
    const cart = await this.deps.orderRepository.findCartById(dto.cartId);
    if (!cart) throw new Error(`Cart not found: ${dto.cartId}`);

    const { order, items } = this.deps.commerceEngine.buildOrderFromCart(
      cart,
      dto.taxRate ?? 0.23,
      { customerId: dto.customerId, channel: dto.channel },
    );

    const finalOrder = order;
    await this.deps.orderRepository.save(finalOrder);
    for (const item of items) {
      await this.deps.orderRepository.saveItem(item);
    }
    await this.deps.eventDispatcher.publish(createOrderCreatedEvent(finalOrder));

    return { order: finalOrder, items };
  }
}
