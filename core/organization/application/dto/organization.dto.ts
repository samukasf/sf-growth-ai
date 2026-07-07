import type { AccessLevel, PermissionScope } from "../../domain";

export type CreateOrganizationDto = {
  name: string;
  legalName: string;
  taxId: string;
  country: string;
  timezone: string;
  currency: string;
  industry: string;
  companySize: string;
  businessModel: string;
  language: string;
};

export type InviteMemberDto = {
  organizationId: string;
  name: string;
  email: string;
  phone?: string;
  role: AccessLevel;
  department: string;
  position: string;
  permissions?: PermissionScope[];
  managerId?: string;
  actorId: string;
  actorName: string;
};

export type ActivateMemberDto = {
  organizationId: string;
  memberId: string;
  actorId: string;
  actorName: string;
};

export type ChangeMemberRoleDto = {
  organizationId: string;
  memberId: string;
  newRole: AccessLevel;
  permissions: PermissionScope[];
  actorId: string;
  actorName: string;
};

export type CreateDepartmentDto = {
  organizationId: string;
  name: string;
  code: string;
  parentDepartmentId?: string;
  actorId: string;
  actorName: string;
};

export type RequestApprovalDto = {
  organizationId: string;
  memberId: string;
  amount: number;
  currency?: string;
  description: string;
  actorId: string;
  actorName: string;
};

export type ResolveDashboardContextDto = {
  organizationId: string;
  memberId: string;
};
