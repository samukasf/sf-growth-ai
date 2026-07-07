import type {
  CompanyProfile,
  DiscoveryFinding,
  DiscoveryGap,
  DiscoveryOpportunity,
  DiscoveryQuestionnaire,
  DiscoveryScore,
  DiscoverySession,
  DiscoverySource,
} from "../entities";
import type { DiscoveryReport } from "./discovery-reporter.port";
import type { CompanyId, DiscoverySessionId } from "../../shared";

export interface DiscoveryRepository {
  saveSession(session: DiscoverySession): Promise<void>;
  findSessionById(sessionId: DiscoverySessionId): Promise<DiscoverySession | null>;
  findSessionsByCompany(companyId: CompanyId): Promise<DiscoverySession[]>;

  saveSource(source: DiscoverySource): Promise<void>;
  findSourcesBySession(sessionId: DiscoverySessionId): Promise<DiscoverySource[]>;

  saveFinding(finding: DiscoveryFinding): Promise<void>;
  findFindingsBySession(sessionId: DiscoverySessionId): Promise<DiscoveryFinding[]>;

  saveGap(gap: DiscoveryGap): Promise<void>;
  findGapsBySession(sessionId: DiscoverySessionId): Promise<DiscoveryGap[]>;

  saveOpportunity(opportunity: DiscoveryOpportunity): Promise<void>;
  findOpportunitiesBySession(sessionId: DiscoverySessionId): Promise<DiscoveryOpportunity[]>;

  saveQuestionnaire(questionnaire: DiscoveryQuestionnaire): Promise<void>;
  findQuestionnairesBySession(sessionId: DiscoverySessionId): Promise<DiscoveryQuestionnaire[]>;

  saveScore(score: DiscoveryScore): Promise<void>;
  findScoreBySession(sessionId: DiscoverySessionId): Promise<DiscoveryScore | null>;

  saveProfile(profile: CompanyProfile): Promise<void>;
  findProfileByCompany(companyId: CompanyId): Promise<CompanyProfile | null>;

  saveReport(sessionId: DiscoverySessionId, report: DiscoveryReport): Promise<void>;
  findReportBySession(sessionId: DiscoverySessionId): Promise<DiscoveryReport | null>;
}
