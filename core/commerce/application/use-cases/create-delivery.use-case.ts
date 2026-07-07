import { OrderNotFoundError } from "../../shared";
import { createDeliveryCreatedEvent } from "../../domain";
import type { CreateDeliveryDto } from "../dto";
import type { CommerceDependencies } from "../dependencies";

export class CreateDeliveryUseCase {
  constructor(private readonly deps: CommerceDependencies) {}

  async execute(dto: CreateDeliveryDto) {
    const order = await this.deps.orderRepository.findById(dto.orderId);
    if (!order) throw new OrderNotFoundError(dto.orderId);

    const plan = this.deps.deliveryManager.create(
      order,
      dto.address,
      dto.provider ?? "internal",
    );

    await this.deps.eventDispatcher.publish(createDeliveryCreatedEvent(plan.delivery));
    return plan;
  }
}
