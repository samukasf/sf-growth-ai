import type { OrganizationId } from "../../shared";

export type CreateAgencyDto = {
  organizationId: OrganizationId;
  name: string;
  slug: string;
};

export type AddClientDto = {
  organizationId: OrganizationId;
  agencyId: string;
  companyId: string;
  name: string;
  industry?: string;
};

export type CreateDepartmentDto = {
  organizationId: OrganizationId;
  agencyId: string;
  name: string;
  code: string;
};

export type CreateGoalDto = {
  organizationId: OrganizationId;
  agencyId: string;
  title: string;
  targetValue: number;
  dueDate: string;
};

export type UpdateKpiDto = {
  agencyId: string;
  kpiId: string;
  currentValue: number;
};

export type AgencyScopeDto = {
  organizationId: OrganizationId;
  agencyId: string;
};

export type ProjectScopeDto = {
  agencyId: string;
  projectId: string;
};
