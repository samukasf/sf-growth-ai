import type { DomainEvent, DomainEventType } from "./domain-event";

export type DomainEventHandler = (event: DomainEvent) => Promise<void> | void;

export interface EventDispatcher {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: DomainEventType, handler: DomainEventHandler): void;
}
