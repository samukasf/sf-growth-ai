import type { CouncilSpecialistRole } from "../../shared";

export type ProcessCouncilDto = {
  organizationId: string;
  companyId: string;
  requestId: string;
  query: string;
  brainSnapshotId?: string;
  risks?: string[];
  opportunities?: string[];
  priorities?: string[];
  suggestedRoles?: CouncilSpecialistRole[];
  context?: Record<string, unknown>;
};
