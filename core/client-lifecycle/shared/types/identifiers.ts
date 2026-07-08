export type OrganizationId = string;
export type AgencyId = string;
export type CompanyId = string;
export type ClientLeadId = string;
export type ClientOpportunityId = string;
export type ClientProposalId = string;
export type ClientContractId = string;
export type ClientOnboardingId = string;
export type ClientSuccessPlanId = string;
export type ClientRelationshipId = string;
export type ClientRenewalId = string;
export type ClientUpsellId = string;
export type ClientHealthId = string;
export type ClientJourneyId = string;
export type DomainEventId = string;

export type ClientLeadStatus = "new" | "qualified" | "disqualified" | "converted";
export type ClientOpportunityStatus = "open" | "won" | "lost" | "archived";
export type ClientProposalStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";
export type ClientContractStatus = "draft" | "active" | "expired" | "terminated";
export type ClientOnboardingStatus = "pending" | "in_progress" | "completed" | "blocked";
export type ClientSuccessPlanStatus = "draft" | "active" | "completed" | "cancelled";
export type ClientRelationshipStatus = "healthy" | "at_risk" | "critical" | "churned" | "recovered";
export type ClientRenewalStatus = "pending" | "proposed" | "accepted" | "declined" | "expired";
export type ClientUpsellStatus = "detected" | "proposed" | "accepted" | "declined" | "expired";
export type ClientJourneyPhase =
  | "lead"
  | "opportunity"
  | "proposal"
  | "contract"
  | "onboarding"
  | "active"
  | "renewal"
  | "upsell"
  | "at_risk"
  | "recovered"
  | "churned"
  | "offboarded";
