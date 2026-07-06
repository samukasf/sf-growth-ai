import type { DomainEvent, DomainEventHandler, DomainEventType, EventDispatcher } from "../../shared";

export class InMemoryEventBus implements EventDispatcher {
  private readonly handlers = new Map<DomainEventType, DomainEventHandler[]>();

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? [];

    for (const handler of handlers) {
      await handler(event);
    }
  }

  subscribe(eventType: DomainEventType, handler: DomainEventHandler): void {
    const current = this.handlers.get(eventType) ?? [];
    current.push(handler);
    this.handlers.set(eventType, current);
  }
}
