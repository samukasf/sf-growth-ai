import type { DomainEvent, DomainEventHandler, DomainEventType } from "../../shared";
import type { EnterpriseEventBus } from "../../domain";

export class InMemoryEnterpriseEventBus implements EnterpriseEventBus {
  private readonly handlers = new Map<DomainEventType, DomainEventHandler[]>();
  private readonly broadcastLog: DomainEvent[] = [];

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? [];
    await Promise.all(handlers.map((handler) => handler(event)));
  }

  subscribe(eventType: DomainEventType, handler: DomainEventHandler): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  async broadcast(event: DomainEvent): Promise<void> {
    this.broadcastLog.push(event);
    await this.publish(event);
  }
}
