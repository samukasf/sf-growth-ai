import type {
  CouncilConflict,
  CouncilConsensus,
  CouncilDecision,
  CouncilMember,
  CouncilOpinion,
  CouncilRecommendation,
  CouncilSession,
  ExecutiveCouncil,
} from "../entities";

export interface CouncilRepository {
  saveCouncil(council: ExecutiveCouncil): Promise<void>;
  findCouncilById(id: string): Promise<ExecutiveCouncil | null>;
  saveSession(session: CouncilSession): Promise<void>;
  findSessionById(id: string): Promise<CouncilSession | null>;
  saveMember(member: CouncilMember): Promise<void>;
  findMembersBySession(sessionId: string): Promise<CouncilMember[]>;
  saveOpinion(opinion: CouncilOpinion): Promise<void>;
  findOpinionsBySession(sessionId: string): Promise<CouncilOpinion[]>;
  saveConsensus(consensus: CouncilConsensus): Promise<void>;
  saveConflict(conflict: CouncilConflict): Promise<void>;
  findConflictsBySession(sessionId: string): Promise<CouncilConflict[]>;
  saveDecision(decision: CouncilDecision): Promise<void>;
  saveRecommendation(recommendation: CouncilRecommendation): Promise<void>;
  findRecommendationsBySession(sessionId: string): Promise<CouncilRecommendation[]>;
}
