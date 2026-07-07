import type {
  CouncilConflict,
  CouncilConsensus,
  CouncilDecision,
  CouncilMember,
  CouncilOpinion,
  CouncilRecommendation,
  CouncilRepository,
  CouncilSession,
  ExecutiveCouncil,
} from "../../domain";

export class InMemoryCouncilRepository implements CouncilRepository {
  private readonly councils = new Map<string, ExecutiveCouncil>();
  private readonly sessions = new Map<string, CouncilSession>();
  private readonly members = new Map<string, CouncilMember[]>();
  private readonly opinions = new Map<string, CouncilOpinion[]>();
  private readonly consensus = new Map<string, CouncilConsensus>();
  private readonly conflicts = new Map<string, CouncilConflict[]>();
  private readonly decisions = new Map<string, CouncilDecision>();
  private readonly recommendations = new Map<string, CouncilRecommendation[]>();

  async saveCouncil(council: ExecutiveCouncil): Promise<void> {
    this.councils.set(council.id, council);
  }

  async findCouncilById(id: string): Promise<ExecutiveCouncil | null> {
    return this.councils.get(id) ?? null;
  }

  async saveSession(session: CouncilSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async findSessionById(id: string): Promise<CouncilSession | null> {
    return this.sessions.get(id) ?? null;
  }

  async saveMember(member: CouncilMember): Promise<void> {
    const existing = this.members.get(member.sessionId) ?? [];
    existing.push(member);
    this.members.set(member.sessionId, existing);
  }

  async findMembersBySession(sessionId: string): Promise<CouncilMember[]> {
    return [...(this.members.get(sessionId) ?? [])];
  }

  async saveOpinion(opinion: CouncilOpinion): Promise<void> {
    const existing = this.opinions.get(opinion.sessionId) ?? [];
    existing.push(opinion);
    this.opinions.set(opinion.sessionId, existing);
  }

  async findOpinionsBySession(sessionId: string): Promise<CouncilOpinion[]> {
    return [...(this.opinions.get(sessionId) ?? [])];
  }

  async saveConsensus(consensus: CouncilConsensus): Promise<void> {
    this.consensus.set(consensus.sessionId, consensus);
  }

  async saveConflict(conflict: CouncilConflict): Promise<void> {
    const existing = this.conflicts.get(conflict.sessionId) ?? [];
    const index = existing.findIndex((c) => c.id === conflict.id);
    if (index >= 0) existing[index] = conflict;
    else existing.push(conflict);
    this.conflicts.set(conflict.sessionId, existing);
  }

  async findConflictsBySession(sessionId: string): Promise<CouncilConflict[]> {
    return [...(this.conflicts.get(sessionId) ?? [])];
  }

  async saveDecision(decision: CouncilDecision): Promise<void> {
    this.decisions.set(decision.sessionId, decision);
  }

  async saveRecommendation(recommendation: CouncilRecommendation): Promise<void> {
    const existing = this.recommendations.get(recommendation.sessionId) ?? [];
    existing.push(recommendation);
    this.recommendations.set(recommendation.sessionId, existing);
  }

  async findRecommendationsBySession(sessionId: string): Promise<CouncilRecommendation[]> {
    return [...(this.recommendations.get(sessionId) ?? [])];
  }
}
