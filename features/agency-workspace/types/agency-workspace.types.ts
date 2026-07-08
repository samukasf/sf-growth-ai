import type { AgencyClient, AgencyContext, AgencyDashboard, AgencyHealth, AgencyMetrics } from "@/core/agency-core";
import type { BusinessHealthReport, BusinessDayState, BusinessPriority, BusinessReview, BusinessRoutine } from "@/core/business-operating";
import type { AssessmentResult } from "@/core/enterprise-assessment";
import type { ProcessCouncilResult } from "@/core/executive-council";
import type { ExecutiveMission } from "@/core/executive-missions/domain";
import type { OpportunityResult } from "@/core/executive-opportunity";
import type { ExecutiveProject } from "@/core/executive-projects";
import type { SoftwareFactoryResult } from "@/core/software-factory";

export type CompanyBrainSnapshot = {
  companyId: string;
  companyName: string;
  summary: string;
  healthScore: number;
  signals: string[];
};

export type AgencyWorkspaceData = {
  organizationId: string;
  agencyId: string;
  agencyName: string;
  selectedClientId: string | null;
  agencyBrain: ReturnType<AgencyContext["toJSON"]> | null;
  agencyDashboard: ReturnType<AgencyDashboard["toJSON"]> | null;
  agencyHealth: ReturnType<AgencyHealth["toJSON"]> | null;
  agencyMetrics: ReturnType<AgencyMetrics["toJSON"]> | null;
  clients: ReturnType<AgencyClient["toJSON"]>[];
  businessDay: BusinessDayState | null;
  routines: ReturnType<BusinessRoutine["toJSON"]>[];
  priorities: ReturnType<BusinessPriority["toJSON"]>[];
  businessHealth: BusinessHealthReport | null;
  businessReview: ReturnType<BusinessReview["toJSON"]> | null;
  companyBrains: CompanyBrainSnapshot[];
  council: ProcessCouncilResult | null;
  executiveCeoSummary: {
    headline: string;
    healthScore: number;
    topPriorities: string[];
    recommendations: string[];
  };
  missions: ReturnType<ExecutiveMission["toJSON"]>[];
  opportunities: OpportunityResult[];
  projects: ExecutiveProject[];
  assessments: AssessmentResult[];
  softwareProjects: SoftwareFactoryResult[];
};
