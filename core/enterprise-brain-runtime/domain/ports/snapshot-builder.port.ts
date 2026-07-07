import type { EnterpriseBrainSnapshot } from "../entities";
import type { CompanyId, OrganizationId } from "../../shared";
import type { DataSourceContribution } from "./brain-repository.port";
import type { EnterpriseBrainSignal } from "../entities/enterprise-brain-signal";
import type { EnterpriseBrainSummary } from "../entities/enterprise-brain-summary";

export type SnapshotBuildInput = {
  organizationId: OrganizationId;
  companyId: CompanyId;
  businessContext: Record<string, string>;
  contributions: DataSourceContribution[];
  memorySummary: EnterpriseBrainSummary;
  knowledgeSummary: EnterpriseBrainSummary;
  learningSummary: EnterpriseBrainSummary;
  experienceSummary: EnterpriseBrainSummary;
  wisdomSummary: EnterpriseBrainSummary;
  organizationSummary: EnterpriseBrainSummary;
  activeSignals: EnterpriseBrainSignal[];
  risks: string[];
  opportunities: string[];
  priorities: string[];
  confidence: number;
};

export interface EnterpriseBrainSnapshotBuilder {
  build(input: SnapshotBuildInput): EnterpriseBrainSnapshot;
}
