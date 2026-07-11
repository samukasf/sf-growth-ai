import type { CompanyBrain, DiscoveryResult } from "../company-brain.types";
import { mapCompanyBrainAndDiscoveryToTimelineEvents } from "./timeline.mapper";
import type { TimelineRepository } from "./timeline.repository";
import { getDefaultTimelineRepository } from "./timeline.repository";
import { mapCreateInputToEvent } from "./timeline.mapper";
import type {
  CreateTimelineEventInput,
  TimelineEvent,
  TimelineFilter,
  TimelineImportance,
  TimelineListOptions,
  TimelineSummary,
} from "./timeline.types";

function matchesArrayFilter<T>(value: T, filter?: T | T[]): boolean {
  if (!filter) return true;
  return Array.isArray(filter) ? filter.includes(value) : value === filter;
}

function isWithinRange(createdAt: string, from?: string, to?: string): boolean {
  const time = new Date(createdAt).getTime();
  if (from && time < new Date(from).getTime()) return false;
  if (to && time > new Date(to).getTime()) return false;
  return true;
}

export class TimelineService {
  constructor(private readonly repository: TimelineRepository) {}

  async create(input: CreateTimelineEventInput): Promise<TimelineEvent> {
    const event = mapCreateInputToEvent(input);
    await this.repository.save(event);
    return event;
  }

  async list(options: TimelineListOptions = {}): Promise<TimelineEvent[]> {
    const events = await this.repository.list();
    const filtered = events.filter((event) => this.matchesFilter(event, options));
    const sort = options.sort ?? "desc";

    return filtered.sort((a, b) => {
      const comparison = a.createdAt.localeCompare(b.createdAt);
      return sort === "asc" ? comparison : -comparison;
    });
  }

  filter(events: TimelineEvent[], filter: TimelineFilter = {}): TimelineEvent[] {
    return events.filter((event) => this.matchesFilter(event, filter));
  }

  summarize(filter: TimelineFilter = {}): Promise<TimelineSummary> {
    return this.list(filter).then((events) => this.buildSummary(events));
  }

  private matchesFilter(event: TimelineEvent, filter: TimelineFilter): boolean {
    if (filter.tenantId && event.tenantId !== filter.tenantId) return false;
    if (filter.companyId && event.companyId !== filter.companyId) return false;
    if (!matchesArrayFilter(event.eventType, filter.eventType)) return false;
    if (!matchesArrayFilter(event.importance, filter.importance)) return false;
    if (filter.source && event.source !== filter.source) return false;
    if (!isWithinRange(event.createdAt, filter.from, filter.to)) return false;

    if (filter.query) {
      const normalized = filter.query.toLowerCase();
      const haystack = `${event.title} ${event.description} ${event.source}`.toLowerCase();
      if (!haystack.includes(normalized)) return false;
    }

    return true;
  }

  private buildSummary(events: TimelineEvent[]): TimelineSummary {
    const byType: TimelineSummary["byType"] = {};
    const byImportance: TimelineSummary["byImportance"] = {};

    for (const event of events) {
      byType[event.eventType] = (byType[event.eventType] ?? 0) + 1;
      byImportance[event.importance] = (byImportance[event.importance] ?? 0) + 1;
    }

    const sorted = [...events].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const latestEvent = sorted[0] ?? null;
    const criticalCount = byImportance.critical ?? 0;
    const highCount = byImportance.high ?? 0;

    const headline =
      events.length === 0
        ? "Nenhum evento registrado na timeline."
        : `${events.length} evento(s) registrados · último: ${latestEvent?.title ?? "—"}`;

    const highlights = sorted.slice(0, 3).map((event) => `${event.title} (${event.eventType})`);

    if (criticalCount > 0) {
      highlights.unshift(`${criticalCount} evento(s) crítico(s) requerem atenção.`);
    } else if (highCount > 0) {
      highlights.unshift(`${highCount} evento(s) de alta importância na timeline.`);
    }

    return {
      total: events.length,
      byType,
      byImportance,
      latestEvent,
      headline,
      highlights: highlights.slice(0, 4),
    };
  }

  async seedFromCompanyBrain(
    brain: CompanyBrain,
    discovery?: DiscoveryResult,
  ): Promise<TimelineEvent[]> {
    const events = mapCompanyBrainAndDiscoveryToTimelineEvents(brain, discovery);
    const saved: TimelineEvent[] = [];

    for (const event of events) {
      saved.push(
        await this.create({
          id: event.id,
          tenantId: event.tenantId,
          companyId: event.companyId,
          eventType: event.eventType,
          title: event.title,
          description: event.description,
          source: event.source,
          createdBy: event.createdBy,
          importance: event.importance,
          createdAt: event.createdAt,
        }),
      );
    }

    return saved;
  }
}

let defaultService: TimelineService | null = null;

export function getTimelineService(): TimelineService {
  if (!defaultService) {
    defaultService = new TimelineService(getDefaultTimelineRepository());
  }
  return defaultService;
}

export function importanceWeight(importance: TimelineImportance): number {
  const weights: Record<TimelineImportance, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  return weights[importance];
}