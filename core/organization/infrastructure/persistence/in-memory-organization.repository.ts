import {
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
  type OrganizationRepository,
  type RoleRepository,
} from "../../domain";

function serializeOrg(org: Organization): string {
  return JSON.stringify(org.toJSON());
}

function deserializeOrg(raw: string): Organization {
  return Organization.create(JSON.parse(raw) as ReturnType<Organization["toJSON"]>);
}

function serializeMember(member: OrganizationMember): string {
  return JSON.stringify(member.toJSON());
}

function deserializeMember(raw: string): OrganizationMember {
  return OrganizationMember.create(JSON.parse(raw) as ReturnType<OrganizationMember["toJSON"]>);
}

export class InMemoryOrganizationRepository implements OrganizationRepository {
  private readonly organizations = new Map<string, string>();
  private readonly profiles: OrganizationProfile[] = [];
  private readonly settings: OrganizationSettings[] = [];
  private readonly policies: OrganizationPolicy[] = [];
  private readonly structures: OrganizationStructure[] = [];
  private readonly hierarchies: OrganizationHierarchy[] = [];
  private readonly members = new Map<string, string>();
  private readonly departments: Department[] = [];
  private readonly departmentProfiles: DepartmentProfile[] = [];
  private readonly identities: ExecutiveIdentity[] = [];
  private readonly approvalLevels: ApprovalLevel[] = [];
  private readonly auditEntries: AuditEntry[] = [];

  async saveOrganization(organization: Organization): Promise<void> {
    this.organizations.set(organization.id, serializeOrg(organization));
  }

  async findOrganizationById(id: string): Promise<Organization | null> {
    const raw = this.organizations.get(id);
    return raw ? deserializeOrg(raw) : null;
  }

  async saveProfile(profile: OrganizationProfile): Promise<void> {
    this.profiles.push(profile);
  }

  async saveSettings(settings: OrganizationSettings): Promise<void> {
    this.settings.push(settings);
  }

  async savePolicy(policy: OrganizationPolicy): Promise<void> {
    this.policies.push(policy);
  }

  async saveStructure(structure: OrganizationStructure): Promise<void> {
    this.structures.push(structure);
  }

  async saveHierarchy(hierarchy: OrganizationHierarchy): Promise<void> {
    this.hierarchies.push(hierarchy);
  }

  async saveMember(member: OrganizationMember): Promise<void> {
    this.members.set(member.id, serializeMember(member));
  }

  async findMemberById(id: string): Promise<OrganizationMember | null> {
    const raw = this.members.get(id);
    return raw ? deserializeMember(raw) : null;
  }

  async findMembersByOrganization(organizationId: string): Promise<OrganizationMember[]> {
    const results: OrganizationMember[] = [];
    for (const raw of this.members.values()) {
      const member = deserializeMember(raw);
      if (member.organizationId === organizationId) results.push(member);
    }
    return results;
  }

  async saveDepartment(department: Department): Promise<void> {
    this.departments.push(department);
  }

  async findDepartmentsByOrganization(organizationId: string): Promise<Department[]> {
    return this.departments.filter((d) => d.organizationId === organizationId);
  }

  async findDepartmentById(id: string): Promise<Department | null> {
    return this.departments.find((d) => d.id === id) ?? null;
  }

  async saveDepartmentProfile(profile: DepartmentProfile): Promise<void> {
    this.departmentProfiles.push(profile);
  }

  async saveExecutiveIdentity(identity: ExecutiveIdentity): Promise<void> {
    this.identities.push(identity);
  }

  async findExecutiveIdentityByMemberId(memberId: string): Promise<ExecutiveIdentity | null> {
    return this.identities.find((i) => i.memberId === memberId) ?? null;
  }

  async saveApprovalLevel(level: ApprovalLevel): Promise<void> {
    this.approvalLevels.push(level);
  }

  async findApprovalLevels(organizationId: string): Promise<ApprovalLevel[]> {
    return this.approvalLevels.filter((l) => l.organizationId === organizationId);
  }

  async saveAuditEntry(entry: AuditEntry): Promise<void> {
    this.auditEntries.push(entry);
  }

  async findAuditEntries(organizationId: string): Promise<AuditEntry[]> {
    return this.auditEntries.filter((e) => e.organizationId === organizationId);
  }
}

export class InMemoryRoleRepository implements RoleRepository {
  private readonly roles: Role[] = [];

  async save(role: Role): Promise<void> {
    this.roles.push(role);
  }

  async findByOrganization(organizationId: string): Promise<Role[]> {
    return this.roles.filter((r) => r.organizationId === organizationId);
  }

  async findById(id: string): Promise<Role | null> {
    return this.roles.find((r) => r.id === id) ?? null;
  }
}
