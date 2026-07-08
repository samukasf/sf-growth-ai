import type { AgencyId, CompanyId, OrganizationId } from "../../shared";

export type CreateLeadDto = {
  organizationId: OrganizationId;
  agencyId: AgencyId;
  companyId?: CompanyId;
  name: string;
  email?: string;
  phone?: string;
  source: string;
};

export type ClientScopeDto = {
  organizationId: OrganizationId;
  agencyId: AgencyId;
  companyId: CompanyId;
};

export type AcceptProposalDto = {
  agencyId: AgencyId;
  proposalId: string;
};

export type CompleteOnboardingDto = {
  agencyId: AgencyId;
  onboardingId: string;
};

export type ActivateCompanyBrainDto = {
  agencyId: AgencyId;
  journeyId: string;
};

export type SuggestRenewalDto = ClientScopeDto & {
  contractId: string;
};
