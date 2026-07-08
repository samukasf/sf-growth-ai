import type { AgencyId, CompanyId, OrganizationId } from "../../shared";

export type StartBusinessDayDto = {
  organizationId: OrganizationId;
  companyId: CompanyId;
  agencyId?: AgencyId;
};

export type BusinessDayScopeDto = {
  organizationId: OrganizationId;
  companyId: CompanyId;
  businessDayId: string;
  agencyId?: AgencyId;
};

export type CompanyScopeDto = {
  organizationId: OrganizationId;
  companyId: CompanyId;
};
