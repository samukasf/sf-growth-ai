import { Subscription, createSubscriptionStartedEvent } from "../../domain";
import type { StartSubscriptionDto } from "../dto";
import type { CommerceDependencies } from "../dependencies";

export class StartSubscriptionUseCase {
  constructor(private readonly deps: CommerceDependencies) {}

  async execute(dto: StartSubscriptionDto) {
    const subscription = Subscription.create({
      organizationId: dto.organizationId,
      customerId: dto.customerId,
      planName: dto.planName,
      itemId: dto.itemId,
      itemType: dto.itemType,
      amount: dto.amount,
      currency: dto.currency,
      frequency: dto.frequency,
      startDate: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    await this.deps.subscriptionRepository.save(subscription);
    await this.deps.eventDispatcher.publish(createSubscriptionStartedEvent(subscription));
    return subscription;
  }
}
