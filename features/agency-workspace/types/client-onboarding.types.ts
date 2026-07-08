import type { AgencyClient } from "@/core/agency-core";
import type { BusinessHealthReport } from "@/core/business-operating";
import type { AssessmentResult } from "@/core/enterprise-assessment";
import type { ProcessCouncilResult } from "@/core/executive-council";
import type { OpportunityResult } from "@/core/executive-opportunity";
import type { ExecutiveProject } from "@/core/executive-projects";
import type { ExecutiveCEO } from "@/features/samuel-ai/services/executive-ceo.service";
import type { ExecutiveTimelineState } from "@/features/samuel-ai/components/executive-timeline/executive-timeline.types";

import type { CompanyBrainSnapshot, CompanyDashboardSnapshot } from "./agency-workspace.types";

export type NewClientFormInput = {
  companyName: string;
  website: string;
  instagram: string;
  facebook: string;
  googleBusiness: string;
  phone: string;
  email: string;
  city: string;
  segment: string;
  objectives: string;
};

export type ClientOnboardingScores = {
  businessHealth: number;
  enterpriseMaturity: number;
  automation: number;
  aiReadiness: number;
};

export type OnboardingProvisioning = {
  tenant: boolean;
  companyBrain: boolean;
  executiveMemory: boolean;
  executiveTimeline: boolean;
  executiveDashboard: boolean;
  executiveCouncil: boolean;
  executiveWorkspace: boolean;
};

export type ClientOnboardingResult = {
  companyId: string;
  tenantId: string;
  client: ReturnType<AgencyClient["toJSON"]>;
  companyBrain: CompanyBrainSnapshot;
  companyDashboard: CompanyDashboardSnapshot;
  discoverySummary: string;
  assessment: AssessmentResult;
  businessHealth: BusinessHealthReport;
  council: ProcessCouncilResult;
  executiveCeo: ExecutiveCEO;
  executiveTimeline: ExecutiveTimelineState;
  provisioning: OnboardingProvisioning;
  opportunities: string[];
  risks: string[];
  recommendedProjects: string[];
  plan90Days: string[];
  scores: ClientOnboardingScores;
  opportunityResults: OpportunityResult[];
  projects: ExecutiveProject[];
};

export type OnboardClientContext = {
  organizationId: string;
  agencyId: string;
};
