export const REVENUE_STAGES = [
  "found", "researched", "qualified", "prepare_outreach", "contacted", "replied",
  "opportunity", "negotiation", "proposal_sent", "won", "lost",
] as const;
export type RevenueStage = (typeof REVENUE_STAGES)[number];

export const REVENUE_AGENTS = [
  "market", "lead_research", "qualification", "outreach", "creative",
  "closer", "ads", "crm", "revenue_manager",
] as const;
export type RevenueAgentName = (typeof REVENUE_AGENTS)[number];

export type AutonomyLevel = 0 | 1 | 2 | 3;

export type LeadScoreComponents = {
  icpFit: number;
  apparentNeed: number;
  buyingCapacity: number;
  intentSignals: number;
  digitalOpportunity: number;
  solutionGap: number;
  recentActivity: number;
  contactability: number;
};

export type ExplainableLeadScore = {
  score: number;
  components: LeadScoreComponents;
  explanation: string[];
  problemDetected: string | null;
  recommendedOffer: string | null;
  bestChannel: string | null;
  nextBestAction: string;
};

export type RevenueLead = {
  id: string;
  companyId: string;
  contactId?: string | null;
  source?: string | null;
  stage: RevenueStage;
  score: number;
  value: number;
  language?: string | null;
  opportunitySummary?: string | null;
  recommendedOffer?: string | null;
  bestChannel?: string | null;
  nextBestAction?: string | null;
  nextActionAt?: string | null;
};

export type OutreachDraft = {
  leadId: string;
  channel: "email" | "whatsapp" | "linkedin" | "call";
  language: string;
  subject?: string;
  body: string;
  approvalRequired: true;
};
