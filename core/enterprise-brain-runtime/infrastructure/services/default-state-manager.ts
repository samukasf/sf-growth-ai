import { EnterpriseBrainState } from "../../domain";
import type { BrainRepository } from "../../domain/ports/brain-repository.port";
import type { EnterpriseBrainStateManager } from "../../domain/ports/state-manager.port";
import type { BrainStatePhase } from "../../shared";

export class DefaultEnterpriseBrainStateManager implements EnterpriseBrainStateManager {
  constructor(private readonly repository: BrainRepository) {}

  async getOrCreate(organizationId: string, companyId: string) {
    const existing = await this.repository.findState(organizationId, companyId);
    if (existing) return existing;

    const state = EnterpriseBrainState.create({
      organizationId,
      companyId,
      phase: "initializing",
      syncedSources: [],
    });

    await this.repository.saveState(state);
    return state;
  }

  async transition(organizationId: string, companyId: string, phase: BrainStatePhase, lastSnapshotId?: string) {
    const current = await this.getOrCreate(organizationId, companyId);
    const next = current.transition(phase, lastSnapshotId);
    await this.repository.saveState(next);
    return next;
  }

  async markSynced(organizationId: string, companyId: string, sources: string[]) {
    const current = await this.getOrCreate(organizationId, companyId);
    const next = EnterpriseBrainState.create({
      ...current.toJSON(),
      syncedSources: sources,
      phase: "active",
      updatedAt: new Date().toISOString(),
    });
    await this.repository.saveState(next);
    return next;
  }
}
