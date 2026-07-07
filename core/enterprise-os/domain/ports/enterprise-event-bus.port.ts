import type { DomainEvent, DomainEventHandler, DomainEventType } from "../../shared";

export interface EnterpriseEventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: DomainEventType, handler: DomainEventHandler): void;
  broadcast(event: DomainEvent): Promise<void>;
}
