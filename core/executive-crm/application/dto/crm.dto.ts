import type { CustomerSegment, LeadSource } from "../../domain";

export type CreateLeadDto = {
  organizationId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  ownerId?: string;
  notes?: string;
};

export type QualifyLeadDto = {
  organizationId: string;
  leadId: string;
};

export type CreateCustomerDto = {
  organizationId: string;
  leadId?: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  segment: CustomerSegment;
  ownerId?: string;
};

export type CreateOpportunityDto = {
  organizationId: string;
  customerId: string;
  title: string;
  description: string;
  value: number;
  currency: string;
  stageId: string;
  expectedCloseDate?: string;
  ownerId?: string;
};

export type SendProposalDto = {
  organizationId: string;
  proposalId: string;
};

export type SignContractDto = {
  organizationId: string;
  contractId: string;
};

export type UpdateRelationshipDto = {
  organizationId: string;
  entityId: string;
  entityType: "lead" | "customer" | "supplier" | "partner";
};

export type MarkCustomerLostDto = {
  organizationId: string;
  customerId: string;
  reason: string;
};

export type RecoverCustomerDto = {
  organizationId: string;
  customerId: string;
};
