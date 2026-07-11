import type {
  CouncilConflict,
  CouncilConsensus,
  CouncilDecision,
  CouncilMember,
  CouncilOpinion,
  CouncilRecommendation,
  CouncilSession,
} from "../entities";
import type { OpinionFailure } from "./opinion-collector.port";

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
  /**
   * Campo aditivo (Sprint 78 — Executive Council Intelligence): falhas
   * isoladas de conselheiros individuais (ex.: provider de IA indisponível)
   * que não interromperam a sessão. Lista vazia quando não houve falhas.
   */
  opinionFailures: OpinionFailure[];
};

export interface ExecutiveCouncilRuntime {
  process(input: ProcessCouncilInput): Promise<ProcessCouncilResult>;
}
