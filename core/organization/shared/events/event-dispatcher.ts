import type { DomainEvent, DomainEventType } from "./domain-event";

export type DomainEventHandler<T extends DomainEvent = DomainEvent> = (
  event: T,
) => void | Promise<void>;

export interface EventDispatcher {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: DomainEventType, handler: DomainEventHandler): void;
}
