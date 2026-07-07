import { OrderNotFoundError } from "../../shared";
import { createOrderCompletedEvent } from "../../domain";
import type { CompleteOrderDto } from "../dto";
import type { CommerceDependencies } from "../dependencies";

export class CompleteOrderUseCase {
  constructor(private readonly deps: CommerceDependencies) {}

  async execute(dto: CompleteOrderDto) {
    const order = await this.deps.orderRepository.findById(dto.orderId);
    if (!order) throw new OrderNotFoundError(dto.orderId);

    const completed = order.complete();
    await this.deps.orderRepository.save(completed);
    await this.deps.eventDispatcher.publish(createOrderCompletedEvent(completed));
    return completed;
  }
}
