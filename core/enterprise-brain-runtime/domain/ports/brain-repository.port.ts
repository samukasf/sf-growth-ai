import type {
  EnterpriseBrainContext,
  EnterpriseBrainRelationship,
  EnterpriseBrainSnapshot,
  EnterpriseBrainState,
} from "../entities";
import type { CompanyId, OrganizationId } from "../../shared";

export type DataSourceContribution = {
  source: string;
  available: boolean;
  recordCount: number;
  summary: string;
  highlights: string[];
  context: Record<string, string>;
  healthScore: number;
};

export type BrainDataSources = {
  fetchAll(organizationId: OrganizationId, companyId: CompanyId): Promise<DataSourceContribution[]>;
};

export interface BrainRepository {
  saveSnapshot(snapshot: EnterpriseBrainSnapshot): Promise<void>;
  findSnapshotById(id: string): Promise<EnterpriseBrainSnapshot | null>;
  findLatestSnapshot(organizationId: string, companyId: string): Promise<EnterpriseBrainSnapshot | null>;
  saveContext(context: EnterpriseBrainContext): Promise<void>;
  findLatestContext(organizationId: string, companyId: string): Promise<EnterpriseBrainContext | null>;
  saveState(state: EnterpriseBrainState): Promise<void>;
  findState(organizationId: string, companyId: string): Promise<EnterpriseBrainState | null>;
  saveRelationships(relationships: EnterpriseBrainRelationship[]): Promise<void>;
  findRelationships(organizationId: string, companyId: string): Promise<EnterpriseBrainRelationship[]>;
}
