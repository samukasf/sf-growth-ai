import type {
  CouncilConflict,
  CouncilConsensus,
  CouncilDecision,
  CouncilMember,
  CouncilOpinion,
  CouncilRecommendation,
  CouncilSession,
} from "../entities";

export type ProcessCouncilInput = {
  organizationId: string;
  companyId: string;
  requestId: string;
  query: string;
  brainSnapshotId?: string;
  risks?: string[];
  opportunities?: string[];
  priorities?: string[];
  suggestedRoles?: import("../../shared").CouncilSpecialistRole[];
  context?: Record<string, unknown>;
};

export type ProcessCouncilResult = {
  session: CouncilSession;
  members: CouncilMember[];
  opinions: CouncilOpinion[];
  conflicts: CouncilConflict[];
  consensus: CouncilConsensus;
  decision: CouncilDecision;
  recommendations: CouncilRecommendation[];
  response: string;
};

export interface ExecutiveCouncilRuntime {
  process(input: ProcessCouncilInput): Promise<ProcessCouncilResult>;
}
