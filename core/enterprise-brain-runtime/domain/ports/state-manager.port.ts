import type { EnterpriseBrainState } from "../entities";
import type { BrainStatePhase, CompanyId, OrganizationId } from "../../shared";

export interface EnterpriseBrainStateManager {
  getOrCreate(organizationId: OrganizationId, companyId: CompanyId): Promise<EnterpriseBrainState>;
  transition(
    organizationId: OrganizationId,
    companyId: CompanyId,
    phase: BrainStatePhase,
    lastSnapshotId?: string,
  ): Promise<EnterpriseBrainState>;
  markSynced(
    organizationId: OrganizationId,
    companyId: CompanyId,
    sources: string[],
  ): Promise<EnterpriseBrainState>;
}
