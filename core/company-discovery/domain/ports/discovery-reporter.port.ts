import type {
  CompanyProfile,
  DiscoveryGap,
  DiscoveryOpportunity,
  DiscoveryScore,
  DiscoverySession,
} from "../entities";

export type DiscoveryReport = {
  session: ReturnType<DiscoverySession["toJSON"]>;
  profile: ReturnType<CompanyProfile["toJSON"]>;
  score: ReturnType<DiscoveryScore["toJSON"]>;
  gaps: ReturnType<DiscoveryGap["toJSON"]>[];
  opportunities: ReturnType<DiscoveryOpportunity["toJSON"]>[];
  summary: string;
  nextSteps: string[];
  generatedAt: string;
};

export type GenerateReportInput = {
  session: DiscoverySession;
  profile: CompanyProfile;
  score: DiscoveryScore;
  gaps: DiscoveryGap[];
  opportunities: DiscoveryOpportunity[];
};

export interface DiscoveryReporter {
  generate(input: GenerateReportInput): DiscoveryReport;
}
