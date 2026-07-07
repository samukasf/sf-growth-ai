export type CouncilId = string;
export type CouncilSessionId = string;
export type CouncilMemberId = string;
export type CouncilOpinionId = string;
export type CouncilConsensusId = string;
export type CouncilDecisionId = string;
export type CouncilConflictId = string;
export type CouncilRecommendationId = string;
export type ExecutiveRequestId = string;
export type OrganizationId = string;
export type CompanyId = string;
export type DomainEventId = string;

export type CouncilSpecialistRole =
  | "ceo"
  | "finance"
  | "marketing"
  | "sales"
  | "operations"
  | "hr"
  | "legal"
  | "crm"
  | "communication"
  | "commerce"
  | "scheduling"
  | "innovation"
  | "projects";

export type CouncilSessionStatus = "pending" | "active" | "deliberating" | "completed" | "cancelled";

export type CouncilMemberStatus = "invited" | "active" | "responded" | "declined";

export type CouncilConflictStatus = "open" | "resolved" | "escalated";
