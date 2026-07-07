import type { OrganizationId } from "../../shared";
import type {
  ApprovalLevel,
  AuditEntry,
  Department,
  DepartmentProfile,
  ExecutiveIdentity,
  Organization,
  OrganizationHierarchy,
  OrganizationMember,
  OrganizationPolicy,
  OrganizationProfile,
  OrganizationSettings,
  OrganizationStructure,
  Role,
} from "../entities";

export type OrganizationQuery = {
  organizationId: OrganizationId;
  status?: string;
  limit?: number;
};

export interface OrganizationRepository {
  saveOrganization(organization: Organization): Promise<void>;
  findOrganizationById(id: OrganizationId): Promise<Organization | null>;
  saveProfile(profile: OrganizationProfile): Promise<void>;
  saveSettings(settings: OrganizationSettings): Promise<void>;
  savePolicy(policy: OrganizationPolicy): Promise<void>;
  saveStructure(structure: OrganizationStructure): Promise<void>;
  saveHierarchy(hierarchy: OrganizationHierarchy): Promise<void>;
  saveMember(member: OrganizationMember): Promise<void>;
  findMemberById(id: string): Promise<OrganizationMember | null>;
  findMembersByOrganization(organizationId: OrganizationId): Promise<OrganizationMember[]>;
  saveDepartment(department: Department): Promise<void>;
  findDepartmentsByOrganization(organizationId: OrganizationId): Promise<Department[]>;
  findDepartmentById(id: string): Promise<Department | null>;
  saveDepartmentProfile(profile: DepartmentProfile): Promise<void>;
  saveExecutiveIdentity(identity: ExecutiveIdentity): Promise<void>;
  findExecutiveIdentityByMemberId(memberId: string): Promise<ExecutiveIdentity | null>;
  saveApprovalLevel(level: ApprovalLevel): Promise<void>;
  findApprovalLevels(organizationId: OrganizationId): Promise<ApprovalLevel[]>;
  saveAuditEntry(entry: AuditEntry): Promise<void>;
  findAuditEntries(organizationId: OrganizationId): Promise<AuditEntry[]>;
}

export interface RoleRepository {
  save(role: Role): Promise<void>;
  findByOrganization(organizationId: OrganizationId): Promise<Role[]>;
  findById(id: string): Promise<Role | null>;
}
