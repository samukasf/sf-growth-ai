import type { CompanyProfile, DiscoveryFinding, DiscoveryGap } from "../entities";
import type { DiscoverySessionId } from "../../shared";

export type AnalyzeGapsInput = {
  sessionId: DiscoverySessionId;
  profile: CompanyProfile;
  findings: DiscoveryFinding[];
};

export interface GapAnalyzer {
  analyze(input: AnalyzeGapsInput): DiscoveryGap[];
}
