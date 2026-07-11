import type { TimelineEvent, TimelineEventId } from "./timeline.types";

export interface TimelineRepository {
  save(event: TimelineEvent): Promise<void>;
  findById(id: TimelineEventId): Promise<TimelineEvent | null>;
  list(): Promise<TimelineEvent[]>;
  deleteByCompany(companyId: string): Promise<void>;
}

export class InMemoryTimelineRepository implements TimelineRepository {
  private readonly events = new Map<TimelineEventId, TimelineEvent>();

  save(event: TimelineEvent): Promise<void> {
    this.events.set(event.id, structuredClone(event));
    return Promise.resolve();
  }

  findById(id: TimelineEventId): Promise<TimelineEvent | null> {
    const event = this.events.get(id);
    return Promise.resolve(event ? structuredClone(event) : null);
  }

  list(): Promise<TimelineEvent[]> {
    return Promise.resolve([...this.events.values()].map((event) => structuredClone(event)));
  }

  deleteByCompany(companyId: string): Promise<void> {
    for (const [id, event] of this.events.entries()) {
      if (event.companyId === companyId) {
        this.events.delete(id);
      }
    }
    return Promise.resolve();
  }
}

let defaultRepository: InMemoryTimelineRepository | null = null;

export function getDefaultTimelineRepository(): InMemoryTimelineRepository {
  if (!defaultRepository) {
    defaultRepository = new InMemoryTimelineRepository();
  }
  return defaultRepository;
}
