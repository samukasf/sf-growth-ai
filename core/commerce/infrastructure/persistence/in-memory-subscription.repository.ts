import { Subscription, type SubscriptionRepository } from "../../domain";

function serializeSubscription(subscription: Subscription): string {
  return JSON.stringify(subscription.toJSON());
}

function deserializeSubscription(raw: string): Subscription {
  return Subscription.create(JSON.parse(raw) as ReturnType<Subscription["toJSON"]>);
}

export class InMemorySubscriptionRepository implements SubscriptionRepository {
  private readonly subscriptions = new Map<string, string>();

  async save(subscription: Subscription): Promise<void> {
    this.subscriptions.set(subscription.id, serializeSubscription(subscription));
  }

  async findById(id: string): Promise<Subscription | null> {
    const raw = this.subscriptions.get(id);
    return raw ? deserializeSubscription(raw) : null;
  }

  async findByOrganization(organizationId: string): Promise<Subscription[]> {
    const results: Subscription[] = [];
    for (const raw of this.subscriptions.values()) {
      const subscription = deserializeSubscription(raw);
      if (subscription.organizationId === organizationId) results.push(subscription);
    }
    return results;
  }

  async findByCustomer(customerId: string): Promise<Subscription[]> {
    const results: Subscription[] = [];
    for (const raw of this.subscriptions.values()) {
      const subscription = deserializeSubscription(raw);
      if (subscription.customerId === customerId) results.push(subscription);
    }
    return results;
  }
}
