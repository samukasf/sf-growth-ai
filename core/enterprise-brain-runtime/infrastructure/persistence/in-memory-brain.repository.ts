import {
  EnterpriseBrainContext,
  EnterpriseBrainRelationship,
  EnterpriseBrainSnapshot,
  EnterpriseBrainState,
  EnterpriseBrainSummary,
  type BrainRepository,
} from "../../domain";

function serializeSnapshot(snapshot: EnterpriseBrainSnapshot): string {
  return JSON.stringify(snapshot.toJSON());
}

function deserializeSnapshot(raw: string): EnterpriseBrainSnapshot {
  const parsed = JSON.parse(raw) as ReturnType<EnterpriseBrainSnapshot["toJSON"]>;
  return EnterpriseBrainSnapshot.create({
    ...parsed,
    memorySummary: EnterpriseBrainSummary.create(parsed.memorySummary),
    knowledgeSummary: EnterpriseBrainSummary.create(parsed.knowledgeSummary),
    learningSummary: EnterpriseBrainSummary.create(parsed.learningSummary),
    experienceSummary: EnterpriseBrainSummary.create(parsed.experienceSummary),
    wisdomSummary: EnterpriseBrainSummary.create(parsed.wisdomSummary),
    organizationSummary: EnterpriseBrainSummary.create(parsed.organizationSummary),
    activeSignals: parsed.activeSignals,
  });
}

export class InMemoryBrainRepository implements BrainRepository {
  private readonly snapshots = new Map<string, string>();
  private readonly contexts = new Map<string, EnterpriseBrainContext>();
  private readonly states = new Map<string, EnterpriseBrainState>();
  private readonly relationships = new Map<string, EnterpriseBrainRelationship[]>();

  private orgKey(organizationId: string, companyId: string) {
    return `${organizationId}:${companyId}`;
  }

  async saveSnapshot(snapshot: EnterpriseBrainSnapshot): Promise<void> {
    this.snapshots.set(snapshot.id, serializeSnapshot(snapshot));
  }

  async findSnapshotById(id: string): Promise<EnterpriseBrainSnapshot | null> {
    const raw = this.snapshots.get(id);
    return raw ? deserializeSnapshot(raw) : null;
  }

  async findLatestSnapshot(
    organizationId: string,
    companyId: string,
  ): Promise<EnterpriseBrainSnapshot | null> {
    const matches: EnterpriseBrainSnapshot[] = [];
    for (const raw of this.snapshots.values()) {
      const snapshot = deserializeSnapshot(raw);
      if (snapshot.organizationId === organizationId && snapshot.companyId === companyId) {
        matches.push(snapshot);
      }
    }
    return matches.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )[0] ?? null;
  }

  async saveContext(context: EnterpriseBrainContext): Promise<void> {
    this.contexts.set(this.orgKey(context.organizationId, context.companyId), context);
  }

  async findLatestContext(
    organizationId: string,
    companyId: string,
  ): Promise<EnterpriseBrainContext | null> {
    return this.contexts.get(this.orgKey(organizationId, companyId)) ?? null;
  }

  async saveState(state: EnterpriseBrainState): Promise<void> {
    this.states.set(this.orgKey(state.organizationId, state.companyId), state);
  }

  async findState(
    organizationId: string,
    companyId: string,
  ): Promise<EnterpriseBrainState | null> {
    return this.states.get(this.orgKey(organizationId, companyId)) ?? null;
  }

  async saveRelationships(relationships: EnterpriseBrainRelationship[]): Promise<void> {
    if (relationships.length === 0) return;
    const key = "global";
    this.relationships.set(key, relationships);
  }

  async findRelationships(): Promise<EnterpriseBrainRelationship[]> {
    return [...(this.relationships.get("global") ?? [])];
  }
}
