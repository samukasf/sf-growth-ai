import type { DiscoveryReport } from "./discovery-reporter.port";
import type { CompanyProfile, DiscoverySession } from "../entities";
import type { CompanyId, DiscoverySessionId } from "../../shared";
import type { DiscoverySourceType } from "../../shared";

export type StartDiscoveryInput = {
  organizationId: string;
  companyId: string;
  companyName: string;
  initiatedBy: string;
  sourceTypes?: DiscoverySourceType[];
  context?: Record<string, unknown>;
};

export type StartDiscoveryResult = {
  session: DiscoverySession;
};

export type RunDiscoveryInput = {
  sessionId: DiscoverySessionId;
  context?: Record<string, unknown>;
};

export type RunDiscoveryResult = {
  session: DiscoverySession;
  profile: CompanyProfile;
  report: DiscoveryReport;
};

export interface CompanyDiscoveryEngine {
  startDiscovery(input: StartDiscoveryInput): Promise<StartDiscoveryResult>;
  runDiscovery(input: RunDiscoveryInput): Promise<RunDiscoveryResult>;
  getProfile(companyId: CompanyId): Promise<CompanyProfile | null>;
  getReport(sessionId: DiscoverySessionId): Promise<DiscoveryReport | null>;
}
