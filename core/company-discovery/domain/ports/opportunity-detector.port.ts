import type { CompanyProfile, DiscoveryFinding, DiscoveryOpportunity } from "../entities";
import type { DiscoverySessionId } from "../../shared";

export type DetectOpportunitiesInput = {
  sessionId: DiscoverySessionId;
  profile: CompanyProfile;
  findings: DiscoveryFinding[];
};

export interface OpportunityDetector {
  detect(input: DetectOpportunitiesInput): DiscoveryOpportunity[];
}
