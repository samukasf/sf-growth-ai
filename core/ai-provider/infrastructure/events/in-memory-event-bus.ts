import type { DomainEvent, DomainEventHandler, DomainEventType } from "../../shared";
import type { EventDispatcher } from "../../shared";

export class InMemoryEventBus implements EventDispatcher {
  private readonly handlers = new Map<DomainEventType, DomainEventHandler[]>();

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? [];
    await Promise.all(handlers.map((handler) => handler(event)));
  }

  subscribe(eventType: DomainEventType, handler: DomainEventHandler): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }
}
