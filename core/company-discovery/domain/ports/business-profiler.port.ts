import type { CompanyProfile, DiscoveryFinding } from "../entities";
import type { CompanyId, OrganizationId } from "../../shared";

export type BuildProfileInput = {
  organizationId: OrganizationId;
  companyId: CompanyId;
  companyName: string;
  findings: DiscoveryFinding[];
  existingProfile?: CompanyProfile;
};

export interface BusinessProfiler {
  build(input: BuildProfileInput): Promise<CompanyProfile>;
}
