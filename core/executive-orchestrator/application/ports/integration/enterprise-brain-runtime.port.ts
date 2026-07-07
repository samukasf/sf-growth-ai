import type {
  OrchestratorBrainContext,
  OrchestratorBrainSnapshot,
} from "../../../domain";

export type { OrchestratorBrainContext, OrchestratorBrainSnapshot };

export interface EnterpriseBrainRuntimePort {
  buildSnapshot(organizationId: string, companyId: string): Promise<OrchestratorBrainSnapshot>;
  buildContext(organizationId: string, companyId: string): Promise<OrchestratorBrainContext>;
}
