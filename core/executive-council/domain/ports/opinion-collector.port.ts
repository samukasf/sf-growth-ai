import type { CouncilMember, CouncilOpinion } from "../entities";

export type SpecialistOpinionInput = {
  query: string;
  context: Record<string, unknown>;
};

export type SpecialistOpinionResult = {
  summary: string;
  recommendation: string;
  priority: number;
  confidence: number;
  risks: string[];
  opportunities: string[];
};

export interface SpecialistPort {
  readonly role: import("../../shared").CouncilSpecialistRole;
  provideOpinion(input: SpecialistOpinionInput): Promise<SpecialistOpinionResult>;
}

export interface OpinionCollector {
  collect(
    sessionId: string,
    members: CouncilMember[],
    query: string,
    context: Record<string, unknown>,
    specialists: SpecialistPort[],
  ): Promise<CouncilOpinion[]>;
}
