import {
  CompanyProfile,
  DiscoveryFinding,
  DiscoveryGap,
  DiscoveryOpportunity,
  DiscoveryQuestionnaire,
  DiscoveryScore,
  DiscoverySession,
  DiscoverySource,
  type DiscoveryRepository,
  type DiscoveryReport,
} from "../../domain";
import type { CompanyId, DiscoverySessionId } from "../../shared";

function serialize<T>(value: T): string {
  return JSON.stringify(value);
}

export class InMemoryDiscoveryRepository implements DiscoveryRepository {
  private readonly sessions = new Map<string, string>();
  private readonly sources = new Map<string, string[]>();
  private readonly findings = new Map<string, string[]>();
  private readonly gaps = new Map<string, string[]>();
  private readonly opportunities = new Map<string, string[]>();
  private readonly questionnaires = new Map<string, string[]>();
  private readonly scores = new Map<string, string>();
  private readonly profiles = new Map<string, string>();
  private readonly reports = new Map<string, string>();

  async saveSession(session: DiscoverySession): Promise<void> {
    this.sessions.set(session.id, serialize(session.toJSON()));
  }

  async findSessionById(sessionId: DiscoverySessionId): Promise<DiscoverySession | null> {
    const raw = this.sessions.get(sessionId);
    if (!raw) return null;
    return DiscoverySession.create(JSON.parse(raw));
  }

  async findSessionsByCompany(companyId: CompanyId): Promise<DiscoverySession[]> {
    return [...this.sessions.values()]
      .map((raw) => DiscoverySession.create(JSON.parse(raw)))
      .filter((s) => s.companyId === companyId);
  }

  async saveSource(source: DiscoverySource): Promise<void> {
    const list = this.sources.get(source.sessionId) ?? [];
    list.push(serialize(source.toJSON()));
    this.sources.set(source.sessionId, list);
  }

  async findSourcesBySession(sessionId: DiscoverySessionId): Promise<DiscoverySource[]> {
    return (this.sources.get(sessionId) ?? []).map((raw) => DiscoverySource.create(JSON.parse(raw)));
  }

  async saveFinding(finding: DiscoveryFinding): Promise<void> {
    const list = this.findings.get(finding.sessionId) ?? [];
    list.push(serialize(finding.toJSON()));
    this.findings.set(finding.sessionId, list);
  }

  async findFindingsBySession(sessionId: DiscoverySessionId): Promise<DiscoveryFinding[]> {
    return (this.findings.get(sessionId) ?? []).map((raw) => DiscoveryFinding.create(JSON.parse(raw)));
  }

  async saveGap(gap: DiscoveryGap): Promise<void> {
    const list = this.gaps.get(gap.sessionId) ?? [];
    list.push(serialize(gap.toJSON()));
    this.gaps.set(gap.sessionId, list);
  }

  async findGapsBySession(sessionId: DiscoverySessionId): Promise<DiscoveryGap[]> {
    return (this.gaps.get(sessionId) ?? []).map((raw) => DiscoveryGap.create(JSON.parse(raw)));
  }

  async saveOpportunity(opportunity: DiscoveryOpportunity): Promise<void> {
    const list = this.opportunities.get(opportunity.sessionId) ?? [];
    list.push(serialize(opportunity.toJSON()));
    this.opportunities.set(opportunity.sessionId, list);
  }

  async findOpportunitiesBySession(sessionId: DiscoverySessionId): Promise<DiscoveryOpportunity[]> {
    return (this.opportunities.get(sessionId) ?? []).map((raw) =>
      DiscoveryOpportunity.create(JSON.parse(raw)),
    );
  }

  async saveQuestionnaire(questionnaire: DiscoveryQuestionnaire): Promise<void> {
    const list = this.questionnaires.get(questionnaire.sessionId) ?? [];
    list.push(serialize(questionnaire.toJSON()));
    this.questionnaires.set(questionnaire.sessionId, list);
  }

  async findQuestionnairesBySession(sessionId: DiscoverySessionId): Promise<DiscoveryQuestionnaire[]> {
    return (this.questionnaires.get(sessionId) ?? []).map((raw) =>
      DiscoveryQuestionnaire.create(JSON.parse(raw)),
    );
  }

  async saveScore(score: DiscoveryScore): Promise<void> {
    this.scores.set(score.sessionId, serialize(score.toJSON()));
  }

  async findScoreBySession(sessionId: DiscoverySessionId): Promise<DiscoveryScore | null> {
    const raw = this.scores.get(sessionId);
    if (!raw) return null;
    return DiscoveryScore.create(JSON.parse(raw));
  }

  async saveProfile(profile: CompanyProfile): Promise<void> {
    this.profiles.set(profile.companyId, serialize(profile.toJSON()));
  }

  async findProfileByCompany(companyId: CompanyId): Promise<CompanyProfile | null> {
    const raw = this.profiles.get(companyId);
    if (!raw) return null;
    return CompanyProfile.create(JSON.parse(raw));
  }

  saveReport(sessionId: DiscoverySessionId, report: DiscoveryReport): Promise<void> {
    this.reports.set(sessionId, serialize(report));
    return Promise.resolve();
  }

  findReportBySession(sessionId: DiscoverySessionId): Promise<DiscoveryReport | null> {
    const raw = this.reports.get(sessionId);
    return Promise.resolve(raw ? (JSON.parse(raw) as DiscoveryReport) : null);
  }
}
