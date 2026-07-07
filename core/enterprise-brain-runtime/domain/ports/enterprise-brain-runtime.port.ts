import type {
  EnterpriseBrainContext,
  EnterpriseBrainHealth,
  EnterpriseBrainRelationship,
  EnterpriseBrainSnapshot,
  EnterpriseBrainState,
} from "../entities";
import type { CompanyId, OrganizationId } from "../../shared";

export interface EnterpriseBrainRuntime {
  buildSnapshot(organizationId: OrganizationId, companyId: CompanyId): Promise<EnterpriseBrainSnapshot>;
  buildContext(organizationId: OrganizationId, companyId: CompanyId): Promise<EnterpriseBrainContext>;
  analyzeHealth(organizationId: OrganizationId, companyId: CompanyId): Promise<EnterpriseBrainHealth>;
  getLatestSnapshot(organizationId: OrganizationId, companyId: CompanyId): Promise<EnterpriseBrainSnapshot | null>;
  getState(organizationId: OrganizationId, companyId: CompanyId): Promise<EnterpriseBrainState>;
  getRelationships(organizationId: OrganizationId, companyId: CompanyId): Promise<EnterpriseBrainRelationship[]>;
}
