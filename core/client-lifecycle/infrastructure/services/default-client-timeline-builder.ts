import type {
  ClientLifecycleRepository,
  ClientTimelineBuilder,
  ClientTimelineEntry,
} from "../../domain";

export class DefaultClientTimelineBuilder implements ClientTimelineBuilder {
  constructor(private readonly repository: ClientLifecycleRepository) {}

  async build(journeyId: string): Promise<ClientTimelineEntry[]> {
    const entries = await this.repository.listTimelineEntries(journeyId);
    return entries.sort(
      (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
    );
  }

  async append(entry: Omit<ClientTimelineEntry, "id">): Promise<ClientTimelineEntry> {
    const full: ClientTimelineEntry = {
      ...entry,
      id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
    await this.repository.saveTimelineEntry(full);
    return full;
  }
}
